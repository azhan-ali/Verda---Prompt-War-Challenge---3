export interface SimulatorInputs {
  transportMode: "petrolCar" | "electricCar" | "transit" | "walkCycle";
  dietType: "meatLover" | "mixed" | "vegetarian" | "vegan";
  dailyKm: number;
  flightsPerYear: number;
  homeEnergy: "highUsage" | "average" | "solarRenewable";
}

export const SIMULATOR_FACTORS = {
  transport: {
    petrolCar: 0.17,  // kg CO2 per km
    electricCar: 0.05,
    transit: 0.06,    // Bus/Train standard mix
    walkCycle: 0.0,
  },
  diet: {
    meatLover: 12.0,  // kg CO2 per day
    mixed: 5.5,
    vegetarian: 2.5,
    vegan: 1.2,
  },
  homeEnergy: {
    highUsage: 10.0, // kg CO2 per day
    average: 5.0,
    solarRenewable: 1.5,
  },
  flight: 240.0,     // kg CO2 per flight (average 1200km flight)
};

export const DEFAULT_CURRENT_LIFESTYLE: SimulatorInputs = {
  transportMode: "petrolCar",
  dietType: "mixed",
  dailyKm: 25,
  flightsPerYear: 4,
  homeEnergy: "average",
};

export interface AnnualFootprint {
  transport: number;
  diet: number;
  flight: number;
  homeEnergy: number;
  total: number;
}

export function calculateAnnualEmissions(inputs: SimulatorInputs): AnnualFootprint {
  const transportAnn = inputs.dailyKm * 365 * SIMULATOR_FACTORS.transport[inputs.transportMode];
  const dietAnn = SIMULATOR_FACTORS.diet[inputs.dietType] * 365;
  const flightAnn = inputs.flightsPerYear * SIMULATOR_FACTORS.flight;
  const homeAnn = SIMULATOR_FACTORS.homeEnergy[inputs.homeEnergy] * 365;

  return {
    transport: Number(transportAnn.toFixed(2)),
    diet: Number(dietAnn.toFixed(2)),
    flight: Number(flightAnn.toFixed(2)),
    homeEnergy: Number(homeAnn.toFixed(2)),
    total: Number((transportAnn + dietAnn + flightAnn + homeAnn).toFixed(2)),
  };
}

export function calculateSavings(current: SimulatorInputs, proposed: SimulatorInputs) {
  const currentAnn = calculateAnnualEmissions(current);
  const proposedAnn = calculateAnnualEmissions(proposed);

  const co2Saved = currentAnn.total - proposedAnn.total;

  // 1 mature tree absorbs ~22 kg CO2 per year
  const treesSaved = co2Saved > 0 ? co2Saved / 22 : 0;
  
  // 1 km in petrol car = 0.17 kg CO2
  const kmEquivalent = co2Saved > 0 ? co2Saved / 0.17 : 0;

  return {
    currentTotal: currentAnn.total,
    proposedTotal: proposedAnn.total,
    co2Saved: Number(co2Saved.toFixed(2)),
    treesSaved: Number(treesSaved.toFixed(1)),
    kmEquivalent: Number(kmEquivalent.toFixed(0)),
    currentBreakdown: currentAnn,
    proposedBreakdown: proposedAnn,
  };
}
