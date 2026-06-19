/**
 * Standard carbon emission factors (in kg CO₂ per unit of measurement).
 * Reference sources: TERI, IPCC, and DEFRA greenhouse gas conversion factors.
 */
export const EMISSION_FACTORS = {
  transport: {
    // Unit: kg CO₂ per km
    petrolCar: 0.17,
    dieselCar: 0.17,
    hybridCar: 0.11,
    electricCar: 0.05,
    motorbike: 0.09,
    bus: 0.08,
    metro: 0.03,
    train: 0.04,
    flightShort: 0.25, // under 1000km
    flightLong: 0.18,  // over 1000km
    walk: 0.0,
    bicycle: 0.0,
  },
  food: {
    // Unit: kg CO₂ per meal/serving
    beef: 15.5,
    lamb: 12.0,
    pork: 3.8,
    poultry: 2.9,
    fish: 2.5,
    dairy: 1.8,
    vegetarian: 0.8,
    vegan: 0.4,
    genericMeal: 1.5,
  },
  energy: {
    // Unit: kg CO₂ per kWh or unit
    electricityGrid: 0.82, // Indian grid average (~820g CO2/kWh)
    electricitySolar: 0.04,
    electricityWind: 0.02,
    naturalGasKwh: 0.18,
    lpgKg: 2.98, // per kg of LPG (Liquefied Petroleum Gas)
  }
};

export type TransportMode = keyof typeof EMISSION_FACTORS.transport;
export type FoodType = keyof typeof EMISSION_FACTORS.food;
export type EnergyType = keyof typeof EMISSION_FACTORS.energy;
