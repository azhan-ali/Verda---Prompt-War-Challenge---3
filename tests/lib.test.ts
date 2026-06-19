// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { EMISSION_FACTORS } from "../lib/emissions";
import { GeminiActivitySchema } from "../lib/schemas";
import { calculateAnnualEmissions, calculateSavings, DEFAULT_CURRENT_LIFESTYLE } from "../lib/simulatorMath";

describe("lib/emissions.ts", () => {
  it("should have correct factors structures", () => {
    expect(EMISSION_FACTORS).toBeDefined();
    expect(EMISSION_FACTORS.transport.petrolCar).toBe(0.17);
    expect(EMISSION_FACTORS.food.vegetarian).toBe(0.8);
    expect(EMISSION_FACTORS.energy.electricityGrid).toBe(0.82);
  });
});

describe("lib/schemas.ts (GeminiActivitySchema)", () => {
  it("should validate correctly with valid data", () => {
    const validData = {
      transport: [
        { mode: "petrolCar", distanceKm: 15 },
        { mode: "walk", distanceKm: 2.5 }
      ],
      food: [
        { type: "vegetarian", servings: 2 },
        { type: "vegan", servings: 1 }
      ],
      energy: [
        { type: "electricityGrid", amount: 10 }
      ],
      explanation: "Drove 15km to work, walked, ate vegetarian meals and used grid electricity."
    };

    const parseResult = GeminiActivitySchema.safeParse(validData);
    expect(parseResult.success).toBe(true);
  });

  it("should validate correctly when optional arrays are empty/null", () => {
    const validData = {
      transport: null,
      food: [],
      energy: undefined,
      explanation: "Just rested at home."
    };

    const parseResult = GeminiActivitySchema.safeParse(validData);
    expect(parseResult.success).toBe(true);
  });

  it("should reject invalid transport modes or negative distances", () => {
    const invalidData = {
      transport: [
        { mode: "invalidMode", distanceKm: 15 }
      ],
      explanation: "Drove an invalid vehicle."
    };

    const parseResult = GeminiActivitySchema.safeParse(invalidData);
    expect(parseResult.success).toBe(false);

    const negativeData = {
      transport: [
        { mode: "petrolCar", distanceKm: -10 }
      ],
      explanation: "Drove negative distance."
    };
    expect(GeminiActivitySchema.safeParse(negativeData).success).toBe(false);
  });

  it("should reject invalid food types or energy types", () => {
    const invalidFood = {
      food: [{ type: "unknownFood", servings: 1 }],
      explanation: "Ate unknown food."
    };
    expect(GeminiActivitySchema.safeParse(invalidFood).success).toBe(false);

    const invalidEnergy = {
      energy: [{ type: "unknownEnergy", amount: 10 }],
      explanation: "Used unknown energy."
    };
    expect(GeminiActivitySchema.safeParse(invalidEnergy).success).toBe(false);
  });

  it("should reject missing or too long explanations", () => {
    const missingExplanation = {
      transport: [],
    };
    expect(GeminiActivitySchema.safeParse(missingExplanation).success).toBe(false);

    const longExplanation = {
      transport: [],
      explanation: "a".repeat(301)
    };
    expect(GeminiActivitySchema.safeParse(longExplanation).success).toBe(false);
  });
});

describe("lib/simulatorMath.ts", () => {
  it("should calculate correctly for current default lifestyle", () => {
    const res = calculateAnnualEmissions(DEFAULT_CURRENT_LIFESTYLE);
    // petrolCar factor = 0.17 * 25 * 365 = 1551.25
    // mixed factor = 5.5 * 365 = 2007.5
    // flight factor = 4 * 240 = 960
    // total = 4518.75
    expect(res.transport).toBe(1551.25);
    expect(res.diet).toBe(2007.5);
    expect(res.flight).toBe(960);
    expect(res.total).toBe(4518.75);
  });

  it("should calculate correct savings when switching options", () => {
    const proposed = {
      transportMode: "electricCar" as const,
      dietType: "vegetarian" as const,
      dailyKm: 15,
      flightsPerYear: 1,
    };

    // electricCar factor = 0.05 * 15 * 365 = 273.75
    // vegetarian factor = 2.5 * 365 = 912.50
    // flight factor = 1 * 240 = 240
    // total = 1426.25
    // co2Saved = 4518.75 - 1426.25 = 3092.5
    // treesSaved = 3092.5 / 22 = 140.56... -> 140.6
    // kmEquivalent = 3092.5 / 0.17 = 18191.17... -> 18191
    
    const savings = calculateSavings(DEFAULT_CURRENT_LIFESTYLE, proposed);
    expect(savings.proposedTotal).toBe(1426.25);
    expect(savings.co2Saved).toBe(3092.5);
    expect(savings.treesSaved).toBe(140.6);
    expect(savings.kmEquivalent).toBe(18191);
  });

  it("should return 0 savings if proposed has higher emissions", () => {
    const current = {
      transportMode: "walkCycle" as const,
      dietType: "vegan" as const,
      dailyKm: 0,
      flightsPerYear: 0,
    };
    const proposed = DEFAULT_CURRENT_LIFESTYLE;
    const savings = calculateSavings(current, proposed);
    expect(savings.co2Saved).toBe(-4080.75);
    expect(savings.treesSaved).toBe(0);
    expect(savings.kmEquivalent).toBe(0);
  });
});
