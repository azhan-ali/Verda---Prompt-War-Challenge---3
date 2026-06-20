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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/simulator",
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
    // defaults: petrolCar (0.17 kg/km), mixed diet (5.5 kg/day), 25 km/day, 4 flights/year
    // transport: 25 * 365 * 0.17 = 1551.25
    // diet: 5.5 * 365 = 2007.5
    // flights: 4 * 240 = 960
    // total = 1551.25 + 2007.5 + 960 = 4518.75
    const emissions = calculateAnnualEmissions(DEFAULT_CURRENT_LIFESTYLE);
    expect(emissions.transport).toBe(1551.25);
    expect(emissions.diet).toBe(2007.5);
    expect(emissions.flight).toBe(960);
    expect(emissions.total).toBe(4518.75);
  });

  it("should calculate correct savings between default and proposed lifestyles", () => {
    const proposed: SimulatorInputs = {
      transportMode: "electricCar", // 0.05
      dietType: "vegetarian",       // 2.5
      dailyKm: 15,
      flightsPerYear: 1,            // 240
    };

    // proposed transport: 15 * 365 * 0.05 = 273.75
    // proposed diet: 2.5 * 365 = 912.5
    // proposed flights: 1 * 240 = 240
    // proposed total: 273.75 + 912.5 + 240 = 1426.25
    // co2Saved: 4518.75 - 1426.25 = 3092.5
    // treesSaved: 3092.5 / 22 = 140.56 -> 140.6
    // kmEquivalent: 3092.5 / 0.17 = 18191.17 -> 18191
    const savings = calculateSavings(DEFAULT_CURRENT_LIFESTYLE, proposed);
    expect(savings.currentTotal).toBe(4518.75);
    expect(savings.proposedTotal).toBe(1426.25);
    expect(savings.co2Saved).toBe(3092.5);
    expect(savings.treesSaved).toBe(140.6);
    expect(savings.kmEquivalent).toBe(18191);
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

    // Verify savings stats are displayed correctly
    expect(screen.getByText(`💨 3,092.5 kg`)).toBeDefined();
    expect(screen.getByText(`🌳 140.6 trees`)).toBeDefined();
    expect(screen.getByText(`🚗 18,191 km`)).toBeDefined();
  });
});

describe("SimulatorPage Integration", () => {
  it("renders SimulatorPage successfully with initial state", () => {
    render(<SimulatorPage />);
    expect(screen.getByText("🌿 What-If Carbon Simulator")).toBeDefined();
    expect(screen.getByText(/Simulate and project your annual/)).toBeDefined();
    
    // Check that we have sliders and comparison charts rendered on page
    expect(screen.getByText("⚙️ Simulate New Lifestyle")).toBeDefined();
    expect(screen.getByText("📈 CO₂ Footprint Comparison")).toBeDefined();
  });
});
