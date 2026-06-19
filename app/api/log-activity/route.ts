import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { EMISSION_FACTORS } from "../../../lib/emissions";
import { GeminiActivitySchema, ParsedActivity } from "../../../lib/schemas";

// In-memory rate limiting map: userId -> timestamps[]
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  
  let userRequests = rateLimitMap.get(userId) || [];
  // Clean up old timestamps
  userRequests = userRequests.filter((timestamp) => timestamp > oneMinuteAgo);
  
  if (userRequests.length >= 10) {
    return false;
  }
  
  userRequests.push(now);
  rateLimitMap.set(userId, userRequests);
  return true;
}

function sanitizeInput(text: string): string {
  // Length limit 500 chars
  let clean = text.slice(0, 500);
  // Strip potentially dangerous special characters (allow basic punctuation and spaces)
  clean = clean.replace(/[^a-zA-Z0-9\s.,\-\'\"?!()]/g, "");
  return clean.trim();
}

function fallbackParse(text: string): ParsedActivity {
  const lower = text.toLowerCase();
  const result: ParsedActivity = {
    transport: [],
    food: [],
    energy: [],
    explanation: "Parsed via local heuristic fallback."
  };

  // 1. Try to extract Y distance (e.g., "15km", "15 km", "12 kilometers")
  let distance = 5.0; // default fallback km
  const kmMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometer)/);
  if (kmMatch) {
    distance = parseFloat(kmMatch[1]);
  }

  // Detect transport mode
  if (lower.includes("petrol") && lower.includes("car")) {
    result.transport?.push({ mode: "petrolCar", distanceKm: distance });
  } else if (lower.includes("diesel") && lower.includes("car")) {
    result.transport?.push({ mode: "dieselCar", distanceKm: distance });
  } else if (lower.includes("hybrid")) {
    result.transport?.push({ mode: "hybridCar", distanceKm: distance });
  } else if (lower.includes("electric") && lower.includes("car")) {
    result.transport?.push({ mode: "electricCar", distanceKm: distance });
  } else if (lower.includes("bike") || lower.includes("motorcycle") || lower.includes("scooter") || lower.includes("motorbike")) {
    result.transport?.push({ mode: "motorbike", distanceKm: distance });
  } else if (lower.includes("bus")) {
    result.transport?.push({ mode: "bus", distanceKm: distance });
  } else if (lower.includes("metro") || lower.includes("subway")) {
    result.transport?.push({ mode: "metro", distanceKm: distance });
  } else if (lower.includes("train")) {
    result.transport?.push({ mode: "train", distanceKm: distance });
  } else if (lower.includes("walk") || lower.includes("run") || lower.includes("foot")) {
    result.transport?.push({ mode: "walk", distanceKm: distance });
  } else if (lower.includes("cycle") || lower.includes("bicycle")) {
    result.transport?.push({ mode: "bicycle", distanceKm: distance });
  } else if (lower.includes("flight") || lower.includes("fly") || lower.includes("plane")) {
    if (distance > 1000) {
      result.transport?.push({ mode: "flightLong", distanceKm: distance });
    } else {
      result.transport?.push({ mode: "flightShort", distanceKm: distance });
    }
  }

  // 2. Try to extract food
  let servings = 1;
  const servingsMatch = lower.match(/(\d+)\s*(?:serving|meal|portion|plate)/);
  if (servingsMatch) {
    servings = parseInt(servingsMatch[1]);
  }

  if (lower.includes("beef") || lower.includes("steak")) {
    result.food?.push({ type: "beef", servings });
  } else if (lower.includes("lamb") || lower.includes("mutton")) {
    result.food?.push({ type: "lamb", servings });
  } else if (lower.includes("pork") || lower.includes("bacon")) {
    result.food?.push({ type: "pork", servings });
  } else if (lower.includes("chicken") || lower.includes("poultry")) {
    result.food?.push({ type: "poultry", servings });
  } else if (lower.includes("fish") || lower.includes("seafood")) {
    result.food?.push({ type: "fish", servings });
  } else if (lower.includes("dairy") || lower.includes("cheese") || lower.includes("milk")) {
    result.food?.push({ type: "dairy", servings });
  } else if (lower.includes("vegetarian") || lower.includes("veg meal") || lower.includes("paneer")) {
    result.food?.push({ type: "vegetarian", servings });
  } else if (lower.includes("vegan") || lower.includes("tofu") || lower.includes("salad")) {
    result.food?.push({ type: "vegan", servings });
  } else if (lower.includes("meal") || lower.includes("ate") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("breakfast")) {
    result.food?.push({ type: "genericMeal", servings });
  }

  // 3. Try to extract energy
  let energyAmount = 1.0;
  const kwhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kwh|unit)/);
  const kgMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|cylinder|lpg)/);

  if (lower.includes("solar") && lower.includes("electricity")) {
    energyAmount = kwhMatch ? parseFloat(kwhMatch[1]) : 5.0;
    result.energy?.push({ type: "electricitySolar", amount: energyAmount });
  } else if (lower.includes("wind")) {
    energyAmount = kwhMatch ? parseFloat(kwhMatch[1]) : 5.0;
    result.energy?.push({ type: "electricityWind", amount: energyAmount });
  } else if (lower.includes("electricity") || lower.includes("kwh") || lower.includes("appliances") || lower.includes("ac")) {
    energyAmount = kwhMatch ? parseFloat(kwhMatch[1]) : 3.0;
    result.energy?.push({ type: "electricityGrid", amount: energyAmount });
  } else if (lower.includes("gas") || lower.includes("burner")) {
    energyAmount = kwhMatch ? parseFloat(kwhMatch[1]) : 2.0;
    result.energy?.push({ type: "naturalGasKwh", amount: energyAmount });
  } else if (lower.includes("lpg") || lower.includes("cylinder")) {
    energyAmount = kgMatch ? parseFloat(kgMatch[1]) : 1.0;
    result.energy?.push({ type: "lpgKg", amount: energyAmount });
  }

  // Clean empty lists to fit Zod validation requirements
  if (result.transport?.length === 0) result.transport = null;
  if (result.food?.length === 0) result.food = null;
  if (result.energy?.length === 0) result.energy = null;

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate Limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Too many requests. Limit is 10 requests per minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawText = body.text;

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json(
        { error: "Missing required text field" },
        { status: 400 }
      );
    }

    const sanitizedText = sanitizeInput(rawText);
    if (!sanitizedText) {
      return NextResponse.json(
        { error: "Invalid text input after sanitization" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let parsedActivity: ParsedActivity;

    if (!apiKey || apiKey === "mock-client-id" || apiKey.includes("mock")) {
      console.warn("No valid GEMINI_API_KEY found, running heuristic fallback parser.");
      parsedActivity = fallbackParse(sanitizedText);
    } else {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const systemPrompt = `
          You are an expert environmental AI agent. Your job is to analyze user activity descriptions and extract transport, food, and energy parameters into a structured JSON object.

          Extract parameters using the following exact schema:
          {
            "transport": [
              {
                "mode": "petrolCar" | "dieselCar" | "hybridCar" | "electricCar" | "motorbike" | "bus" | "metro" | "train" | "flightShort" | "flightLong" | "walk" | "bicycle",
                "distanceKm": number
              }
            ],
            "food": [
              {
                "type": "beef" | "lamb" | "pork" | "poultry" | "fish" | "dairy" | "vegetarian" | "vegan" | "genericMeal",
                "servings": number
              }
            ],
            "energy": [
              {
                "type": "electricityGrid" | "electricitySolar" | "electricityWind" | "naturalGasKwh" | "lpgKg",
                "amount": number
              }
            ],
            "explanation": "string (brief summary of what was extracted)"
          }

          Rules:
          1. ONLY use the allowed enum values for "mode" (transport) and "type" (food / energy).
          2. If the text does not mention parameters for a category, return null or omit the category.
          3. Make sure numeric values are positive.
          4. If a description says "vegan day" or "vegetarian day", estimate 3 servings of vegan/vegetarian meals.
          5. If the user mentions time driving, estimate standard speeds (e.g. 50 km/h for car, 25 km/h for motorbike) to convert to distanceKm.
          6. Return ONLY a valid raw JSON object. Do not include markdown code block formatting.
        `;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: `${systemPrompt}\n\nAnalyze this input: "${sanitizedText}"` }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Gemini API responded with status ${response.status}`);
        }

        const responseData = await response.json();
        const responseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
          throw new Error("Empty response text from Gemini");
        }

        const rawParsed = JSON.parse(responseText.trim());
        const validated = GeminiActivitySchema.safeParse(rawParsed);

        if (!validated.success) {
          console.warn("Gemini response did not match schema. Error: ", validated.error);
          throw new Error("Validation failed");
        }

        parsedActivity = validated.data;
      } catch (geminiError) {
        console.error("Gemini API call failed, using heuristic fallback parser: ", geminiError);
        parsedActivity = fallbackParse(sanitizedText);
      }
    }

    // Zod final check to guarantee shape
    const finalValidation = GeminiActivitySchema.safeParse(parsedActivity);
    if (!finalValidation.success) {
      return NextResponse.json(
        { error: "Malformed data schema received.", details: finalValidation.error },
        { status: 422 }
      );
    }

    // Compute exact totals based on local constants
    let transportKg = 0;
    let foodKg = 0;
    let energyKg = 0;

    const breakdown: any = {
      transport: [],
      food: [],
      energy: [],
      explanation: parsedActivity.explanation || ""
    };

    if (parsedActivity.transport) {
      for (const item of parsedActivity.transport) {
        const factor = EMISSION_FACTORS.transport[item.mode] ?? 0;
        const emissions = Number((item.distanceKm * factor).toFixed(3));
        transportKg += emissions;
        breakdown.transport.push({
          mode: item.mode,
          distanceKm: item.distanceKm,
          factor,
          co2Kg: emissions
        });
      }
    }

    if (parsedActivity.food) {
      for (const item of parsedActivity.food) {
        const factor = EMISSION_FACTORS.food[item.type] ?? 0;
        const emissions = Number((item.servings * factor).toFixed(3));
        foodKg += emissions;
        breakdown.food.push({
          type: item.type,
          servings: item.servings,
          factor,
          co2Kg: emissions
        });
      }
    }

    if (parsedActivity.energy) {
      for (const item of parsedActivity.energy) {
        const factor = EMISSION_FACTORS.energy[item.type] ?? 0;
        const emissions = Number((item.amount * factor).toFixed(3));
        energyKg += emissions;
        breakdown.energy.push({
          type: item.type,
          amount: item.amount,
          factor,
          co2Kg: emissions
        });
      }
    }

    const totalKg = Number((transportKg + foodKg + energyKg).toFixed(3));

    // Save to Database
    const savedActivity = await prisma.activity.create({
      data: {
        userId,
        description: sanitizedText,
        transportKg,
        foodKg,
        energyKg,
        totalKg,
        calculationBreakdown: breakdown
      }
    });

    return NextResponse.json({
      success: true,
      activity: savedActivity
    });
  } catch (error: any) {
    console.error("Error logging activity: ", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
