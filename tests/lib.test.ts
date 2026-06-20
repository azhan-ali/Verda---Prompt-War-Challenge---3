// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { EMISSION_FACTORS } from "../lib/emissions";
import { GeminiActivitySchema } from "../lib/schemas";
import { calculateAnnualEmissions, calculateSavings, DEFAULT_CURRENT_LIFESTYLE, SimulatorInputs } from "../lib/simulatorMath";

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
    // DEFAULT_CURRENT_LIFESTYLE: petrolCar (0.17), mixed (5.5), 25km/day, 4 flights, average homeEnergy (5.0)
    // transport: 25 * 365 * 0.17 = 1551.25
    // diet: 5.5 * 365 = 2007.5
    // flights: 4 * 240 = 960
    // homeEnergy: 5.0 * 365 = 1825
    // total = 6343.75
    expect(res.transport).toBe(1551.25);
    expect(res.diet).toBe(2007.5);
    expect(res.flight).toBe(960);
    expect(res.homeEnergy).toBe(1825);
    expect(res.total).toBe(6343.75);
  });

  it("should calculate correct savings when switching options", () => {
    const proposed: SimulatorInputs = {
      transportMode: "electricCar" as const,
      dietType: "vegetarian" as const,
      dailyKm: 15,
      flightsPerYear: 1,
      homeEnergy: "solarRenewable" as const,
    };

    // electricCar: 0.05 * 15 * 365 = 273.75
    // vegetarian: 2.5 * 365 = 912.50
    // flights: 1 * 240 = 240
    // solarRenewable: 1.5 * 365 = 547.5
    // proposed total: 1973.75
    // current total: 6343.75
    // co2Saved: 6343.75 - 1973.75 = 4370
    // treesSaved: 4370 / 22 = 198.6...
    // kmEquivalent: 4370 / 0.17 = 25705.88... -> 25706
    const savings = calculateSavings(DEFAULT_CURRENT_LIFESTYLE, proposed);
    expect(savings.proposedTotal).toBe(1973.75);
    expect(savings.co2Saved).toBe(4370);
    expect(savings.treesSaved).toBe(198.6);
    expect(savings.kmEquivalent).toBe(25706);
  });

  it("should return 0 savings if proposed has higher emissions", () => {
    const lowCarbon: SimulatorInputs = {
      transportMode: "walkCycle" as const,
      dietType: "vegan" as const,
      dailyKm: 0,
      flightsPerYear: 0,
      homeEnergy: "solarRenewable" as const,
    };
    const proposed = DEFAULT_CURRENT_LIFESTYLE;
    const savings = calculateSavings(lowCarbon, proposed);
    // When proposed is higher, co2Saved is negative
    expect(savings.co2Saved).toBeLessThan(0);
    expect(savings.treesSaved).toBe(0);
    expect(savings.kmEquivalent).toBe(0);
  });
});
