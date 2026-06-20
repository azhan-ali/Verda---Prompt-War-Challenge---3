import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userCity = session.user.city || "Bangalore";

    // Fetch activities logged in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: "desc" },
    });

    const totalEmissions = activities.reduce((sum, act) => sum + act.totalKg, 0);
    const totalTransport = activities.reduce((sum, act) => sum + act.transportKg, 0);
    const totalFood = activities.reduce((sum, act) => sum + act.foodKg, 0);
    const totalEnergy = activities.reduce((sum, act) => sum + act.energyKg, 0);
    const activityCount = activities.length;

    const apiKey = process.env.GEMINI_API_KEY;

    // Determine context strings for richer prompting
    const transportCtx = totalTransport > 0
      ? `${totalTransport.toFixed(2)} kg CO₂ from transport (${Math.round((totalTransport / Math.max(totalEmissions, 0.01)) * 100)}% of total)`
      : "No transport emissions logged";
    const foodCtx = totalFood > 0
      ? `${totalFood.toFixed(2)} kg CO₂ from food choices (${Math.round((totalFood / Math.max(totalEmissions, 0.01)) * 100)}% of total)`
      : "No food emissions logged";
    const energyCtx = totalEnergy > 0
      ? `${totalEnergy.toFixed(2)} kg CO₂ from energy use (${Math.round((totalEnergy / Math.max(totalEmissions, 0.01)) * 100)}% of total)`
      : "No energy emissions logged";

    // Build a rich structured fallback JSON
    const buildFallback = () => {
      const transportGood = totalTransport < 2;
      const foodGood = totalFood < 5;
      const tips = [
        {
          icon: "🚲",
          title: "Micro-Commute Switch",
          body: "For any trips under 3 km, swap your motor vehicle for cycling or walking. This single habit eliminates roughly 0.5 kg CO₂ per trip.",
        },
        {
          icon: "🥗",
          title: "Plant-Forward Meals",
          body: "Replace 2 high-meat meals this week with plant-based alternatives. Vegan meals produce up to 60% less CO₂ than beef-heavy options.",
        },
        {
          icon: "🔌",
          title: "Phantom Power Purge",
          body: "Unplug devices and turn off AC when not in use. Standby electronics can account for 10% of your household's energy footprint.",
        },
      ];

      return {
        city: userCity,
        activityCount,
        totalEmissions: totalEmissions.toFixed(2),
        summary:
          activityCount === 0
            ? `Your carbon twin is waiting — no activities logged in the last 7 days. Start logging today to unlock your personalized insights.`
            : `You logged ${activityCount} ${activityCount === 1 ? "activity" : "activities"} in ${userCity} this week, generating ${totalEmissions.toFixed(2)} kg CO₂ in total.`,
        transportHeadline: transportGood
          ? "Excellent green commuting! 🏆"
          : "Transport is your top emission driver",
        transportBody: transportGood
          ? "You have kept transport emissions extremely low this week. Your active commuting choices are making a real difference."
          : "Your transport footprint is a key area to focus on. Shorter trips via public transit, cycling, or walking can significantly slash this category.",
        transportKg: totalTransport.toFixed(2),
        foodHeadline: foodGood ? "Smart food choices! 🌱" : "Your plate has impact",
        foodBody: foodGood
          ? "Your food choices are well within a sustainable range. Maintaining plant-forward meals keeps your footprint low."
          : "Dietary choices account for a significant share of your weekly emissions. Reducing meat frequency can have an outsized positive impact.",
        foodKg: totalFood.toFixed(2),
        energyKg: totalEnergy.toFixed(2),
        score: activityCount === 0 ? null : Math.max(0, Math.min(100, Math.round(100 - (totalEmissions / (5 * 7)) * 50))),
        tips,
        closingLine: activityCount === 0
          ? "Every logged activity is a step toward a healthier planet. Start today!"
          : "Keep growing your green streak — every mindful choice feeds your carbon twin's canopy. 🌿",
      };
    };

    if (!apiKey || apiKey === "mock-client-id" || apiKey.includes("mock")) {
      return NextResponse.json(buildFallback());
    }

    // Try to use Gemini to generate richer text for each section
    try {
      const prompt = `You are Verda, a premium environmental carbon advisor.
User's weekly carbon summary:
- City: ${userCity}
- Activities logged: ${activityCount}
- Total emissions: ${totalEmissions.toFixed(2)} kg CO₂
- Transport: ${transportCtx}
- Food: ${foodCtx}
- Energy: ${energyCtx}

Return ONLY a valid JSON object (no markdown, no code blocks) in this EXACT structure:
{
  "city": "${userCity}",
  "activityCount": ${activityCount},
  "totalEmissions": "${totalEmissions.toFixed(2)}",
  "summary": "1-2 sentence overall summary of their week, warm and encouraging tone",
  "transportHeadline": "short punchy 4-6 word headline for transport section",
  "transportBody": "2-3 sentence analysis of their transport footprint with actionable advice",
  "transportKg": "${totalTransport.toFixed(2)}",
  "foodHeadline": "short punchy 4-6 word headline for food section",
  "foodBody": "2-3 sentence analysis of their food footprint with actionable advice",
  "foodKg": "${totalFood.toFixed(2)}",
  "energyKg": "${totalEnergy.toFixed(2)}",
  "score": a number from 0-100 representing their eco score this week,
  "tips": [
    {"icon": "emoji", "title": "4-word tip title", "body": "1-2 sentence actionable tip"},
    {"icon": "emoji", "title": "4-word tip title", "body": "1-2 sentence actionable tip"},
    {"icon": "emoji", "title": "4-word tip title", "body": "1-2 sentence actionable tip"}
  ],
  "closingLine": "short motivational closing sentence with a nature emoji"
}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!geminiRes.ok) throw new Error("Gemini API failed");

      const geminiData = await geminiRes.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("No content from Gemini");

      const parsed = JSON.parse(rawText.trim());
      return NextResponse.json(parsed);
    } catch (geminiErr) {
      console.error("Gemini failed, using fallback:", geminiErr);
      return NextResponse.json(buildFallback());
    }
  } catch (error: unknown) {
    console.error("Error generating insights: ", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
