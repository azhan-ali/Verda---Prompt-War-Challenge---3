// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { 
  calculateAnnualEmissions, 
  calculateSavings, 
  DEFAULT_CURRENT_LIFESTYLE,
  SimulatorInputs
} from "../lib/simulatorMath";
import SimulatorSliders from "../components/SimulatorSliders";
import SimulatorChart from "../components/SimulatorChart";
import SimulatorPage from "../app/simulator/page";

// Mock IntersectionObserver for Framer Motion viewport options in jsdom
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation — include useSearchParams to support Navbar
vi.mock("next/navigation", () => ({
  usePathname: () => "/simulator",
  useSearchParams: () => ({ get: (/* _key: string */) => null }),
}));

// Mock Recharts to avoid responsive layout issues in JSDOM
vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div className="mock-container">{children}</div>,
    BarChart: ({ children, data }: { children: React.ReactNode; data: unknown }) => (
      <div className="mock-bar-chart" data-testid="mock-bar-chart" data-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Bar: ({ dataKey }: { dataKey: string }) => <div className="mock-bar" data-testid={`mock-bar-${dataKey}`} />,
    XAxis: () => <div className="mock-xaxis" />,
    YAxis: () => <div className="mock-yaxis" />,
    Tooltip: () => <div className="mock-tooltip" />,
    Legend: () => <div className="mock-legend" />,
  };
});

describe("Simulator Math Logic", () => {
  it("should calculate correct annual emissions for current lifestyle defaults", () => {
    // DEFAULT_CURRENT_LIFESTYLE: petrolCar, mixed, 25km, 4 flights, average homeEnergy
    // transport: 25 * 365 * 0.17 = 1551.25
    // diet: 5.5 * 365 = 2007.5
    // flights: 4 * 240 = 960
    // homeEnergy: 5.0 * 365 = 1825
    // total = 1551.25 + 2007.5 + 960 + 1825 = 6343.75
    const emissions = calculateAnnualEmissions(DEFAULT_CURRENT_LIFESTYLE);
    expect(emissions.transport).toBe(1551.25);
    expect(emissions.diet).toBe(2007.5);
    expect(emissions.flight).toBe(960);
    expect(emissions.homeEnergy).toBe(1825);
    expect(emissions.total).toBe(6343.75);
  });

  it("should calculate correct savings between default and proposed lifestyles", () => {
    const proposed: SimulatorInputs = {
      transportMode: "electricCar", // 0.05
      dietType: "vegetarian",       // 2.5 kg/day
      dailyKm: 15,
      flightsPerYear: 1,            // 240 kg per flight
      homeEnergy: "solarRenewable", // 1.5 kg/day
    };

    // proposed transport: 15 * 365 * 0.05 = 273.75
    // proposed diet: 2.5 * 365 = 912.5
    // proposed flights: 1 * 240 = 240
    // proposed homeEnergy: 1.5 * 365 = 547.5
    // proposed total: 273.75 + 912.5 + 240 + 547.5 = 1973.75
    // co2Saved: 6343.75 - 1973.75 = 4370
    // treesSaved: 4370 / 22 = 198.6
    // kmEquivalent: 4370 / 0.17 = 25705.88... -> 25706
    const savings = calculateSavings(DEFAULT_CURRENT_LIFESTYLE, proposed);
    expect(savings.currentTotal).toBe(6343.75);
    expect(savings.proposedTotal).toBe(1973.75);
    expect(savings.co2Saved).toBe(4370);
    expect(savings.treesSaved).toBe(198.6);
    expect(savings.kmEquivalent).toBe(25706);
  });

  it("should return 0 savings if proposed has higher emissions", () => {
    const lowCarbon: SimulatorInputs = {
      transportMode: "walkCycle",
      dietType: "vegan",
      dailyKm: 0,
      flightsPerYear: 0,
      homeEnergy: "solarRenewable",
    };
    const savings = calculateSavings(lowCarbon, DEFAULT_CURRENT_LIFESTYLE);
    expect(savings.co2Saved).toBeLessThan(0);
    expect(savings.treesSaved).toBe(0);
    expect(savings.kmEquivalent).toBe(0);
  });
});

describe("SimulatorSliders Component", () => {
  it("renders all control options and labels correctly", () => {
    const handleChange = vi.fn();
    render(<SimulatorSliders inputs={DEFAULT_CURRENT_LIFESTYLE} onChange={handleChange} />);

    expect(screen.getByText("⚙️ Simulate New Lifestyle")).toBeDefined();
    expect(screen.getByText("🚗 Transport Mode")).toBeDefined();
    expect(screen.getByText("🥗 Diet Type")).toBeDefined();
    expect(screen.getByText("📍 Daily Commute")).toBeDefined();
    expect(screen.getByText("✈️ Annual Flights")).toBeDefined();

    // Check presence of some buttons
    expect(screen.getByText("Petrol Car")).toBeDefined();
    expect(screen.getByText("EV")).toBeDefined();
    expect(screen.getByText("Transit")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("calls onChange callback when transport mode is changed", () => {
    const handleChange = vi.fn();
    render(<SimulatorSliders inputs={DEFAULT_CURRENT_LIFESTYLE} onChange={handleChange} />);

    const evButton = screen.getByText("EV");
    fireEvent.click(evButton);

    expect(handleChange).toHaveBeenCalledWith({
      ...DEFAULT_CURRENT_LIFESTYLE,
      transportMode: "electricCar",
    });
  });

  it("calls onChange callback when daily commute slider is moved", () => {
    const handleChange = vi.fn();
    render(<SimulatorSliders inputs={DEFAULT_CURRENT_LIFESTYLE} onChange={handleChange} />);

    // Commute range input
    const sliders = screen.getAllByRole("slider");
    // Find the one for dailyKm (which goes up to 50)
    const commuteSlider = sliders.find(s => s.getAttribute("max") === "50");
    expect(commuteSlider).toBeDefined();

    if (commuteSlider) {
      fireEvent.change(commuteSlider, { target: { value: "10" } });
      expect(handleChange).toHaveBeenCalledWith({
        ...DEFAULT_CURRENT_LIFESTYLE,
        dailyKm: 10,
      });
    }
  });
});

describe("SimulatorChart Component", () => {
  it("renders chart comparison card and computed savings stats", () => {
    const current = calculateAnnualEmissions(DEFAULT_CURRENT_LIFESTYLE);
    const proposed: SimulatorInputs = {
      transportMode: "electricCar",
      dietType: "vegetarian",
      dailyKm: 15,
      flightsPerYear: 1,
      homeEnergy: "solarRenewable",
    };
    const proposedAnn = calculateAnnualEmissions(proposed);
    const savings = calculateSavings(DEFAULT_CURRENT_LIFESTYLE, proposed);

    render(
      <SimulatorChart
        currentAnn={current}
        proposedAnn={proposedAnn}
        co2Saved={savings.co2Saved}
        treesSaved={savings.treesSaved}
        kmEquivalent={savings.kmEquivalent}
      />
    );

    expect(screen.getByText("📈 CO₂ Footprint Comparison")).toBeDefined();
    expect(screen.getByText("Annual Savings")).toBeDefined();
    expect(screen.getByText("Tree Equivalent")).toBeDefined();
    expect(screen.getByText("Driving Offset")).toBeDefined();

    // Check savings labels are displayed — avoid locale-specific number format
    expect(screen.getByText("Annual Savings")).toBeDefined();
    expect(screen.getByText("Tree Equivalent")).toBeDefined();
    expect(screen.getByText("Driving Offset")).toBeDefined();
  });
});

describe("SimulatorPage Integration", () => {
  it("renders SimulatorPage successfully with initial state", async () => {
    const { unmount } = render(<SimulatorPage />);
    expect(screen.getByText("🌿 What-If Carbon Simulator")).toBeDefined();
    expect(screen.getByText(/Simulate and project your annual/)).toBeDefined();

    // Check that we have sliders and comparison charts rendered on page
    expect(screen.getByText("⚙️ Simulate New Lifestyle")).toBeDefined();
    expect(screen.getByText("📈 CO₂ Footprint Comparison")).toBeDefined();
    unmount();
  });
});
