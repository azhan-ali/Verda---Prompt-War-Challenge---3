export interface CityBaseline {
  name: string;
  baselineKg: number;
  description: string;
}

export const CITY_BASELINES: Record<string, CityBaseline> = {
  Delhi: {
    name: "Delhi",
    baselineKg: 5.2,
    description: "National Capital Region Baseline"
  },
  Mumbai: {
    name: "Mumbai",
    baselineKg: 4.8,
    description: "Coastal Metro Baseline"
  },
  Bangalore: {
    name: "Bangalore",
    baselineKg: 4.6,
    description: "Technology Hub Baseline"
  },
  Patna: {
    name: "Patna",
    baselineKg: 4.5,
    description: "Eastern Plains Baseline"
  },
  India: {
    name: "India Average",
    baselineKg: 4.7,
    description: "National Average Baseline"
  }
};

export function getCityBaseline(cityName?: string | null): CityBaseline {
  if (!cityName) return CITY_BASELINES.India;
  
  const normalized = cityName.trim().toLowerCase();
  
  // Find key case-insensitively
  const matchedKey = Object.keys(CITY_BASELINES).find(
    (key) => key.toLowerCase() === normalized
  );
  
  if (matchedKey) {
    return CITY_BASELINES[matchedKey];
  }
  
  // Fallback: Return a custom object using the city name with the national baseline
  return {
    name: cityName.trim(),
    baselineKg: CITY_BASELINES.India.baselineKg,
    description: "National Average Baseline"
  };
}
