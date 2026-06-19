import { z } from "zod";

export const GeminiActivitySchema = z.object({
  transport: z.array(
    z.object({
      mode: z.enum([
        "petrolCar",
        "dieselCar",
        "hybridCar",
        "electricCar",
        "motorbike",
        "bus",
        "metro",
        "train",
        "flightShort",
        "flightLong",
        "walk",
        "bicycle"
      ]),
      distanceKm: z.number().nonnegative(),
    })
  ).nullable().optional(),

  food: z.array(
    z.object({
      type: z.enum([
        "beef",
        "lamb",
        "pork",
        "poultry",
        "fish",
        "dairy",
        "vegetarian",
        "vegan",
        "genericMeal"
      ]),
      servings: z.number().nonnegative(),
    })
  ).nullable().optional(),

  energy: z.array(
    z.object({
      type: z.enum([
        "electricityGrid",
        "electricitySolar",
        "electricityWind",
        "naturalGasKwh",
        "lpgKg"
      ]),
      amount: z.number().nonnegative(),
    })
  ).nullable().optional(),

  explanation: z.string().max(300),
});

export type ParsedActivity = z.infer<typeof GeminiActivitySchema>;
