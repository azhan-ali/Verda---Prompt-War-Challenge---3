// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BaselineBenchmark from "../components/BaselineBenchmark";
import CarbonReceipt from "../components/CarbonReceipt";
import React from "react";

// Mock navigator.share
Object.defineProperty(global.navigator, "share", {
  value: vi.fn(),
  configurable: true,
  writable: true
});

describe("BaselineBenchmark Component", () => {
  it("renders comparison indicators under standard average", () => {
    render(<BaselineBenchmark todayEmissionsKg={3.5} cityName="Bangalore" />); // Bangalore avg is 4.6kg
    
    expect(screen.getByText("📊 Baseline Benchmark")).toBeDefined();
    expect(screen.getByText("Calibrated for Bangalore (4.6 kg standard)")).toBeDefined();
    expect(screen.getByText("Better than Avg")).toBeDefined();
    expect(screen.getByText("You (3.5 kg)")).toBeDefined();
    expect(screen.getByText("Great work, Citizen!")).toBeDefined();
  });

  it("renders comparison warnings when above standard average", () => {
    render(<BaselineBenchmark todayEmissionsKg={6.2} cityName="Delhi" />); // Delhi avg is 5.2kg
    
    expect(screen.getByText("Above Baseline")).toBeDefined();
    expect(screen.getByText("You (6.2 kg)")).toBeDefined();
    expect(screen.getByText("Almost there!")).toBeDefined();
  });
});

describe("CarbonReceipt Component", () => {
  const mockActivities = [
    {
      id: "act-1",
      description: "drove petrol car",
      transportKg: 2.5,
      foodKg: 0,
      energyKg: 0,
      totalKg: 2.5,
      date: new Date().toISOString()
    },
    {
      id: "act-2",
      description: "ate beef steak",
      transportKg: 0,
      foodKg: 15.5,
      energyKg: 0,
      totalKg: 15.5,
      date: new Date().toISOString()
    }
  ];

  it("calculates subtotals and displays itemized lines correctly", () => {
    render(<CarbonReceipt activities={mockActivities} dailyBudgetKg={5.0} />);
    
    expect(screen.getByText("📄 Daily Receipt")).toBeDefined();
    expect(screen.getByText("VERDA CARBON AUDIT")).toBeDefined();
    expect(screen.getByText("1. drove petrol car")).toBeDefined();
    expect(screen.getByText("2. ate beef steak")).toBeDefined();
    
    // Subtotals
    expect(screen.getByText("SUBTOTAL TRANSPORT:")).toBeDefined();
    expect(screen.getAllByText("2.50 kg")).toHaveLength(2); // item log and subtotal
    expect(screen.getByText("SUBTOTAL FOOD:")).toBeDefined();
    expect(screen.getAllByText("15.50 kg")).toHaveLength(2); // item log and subtotal
    
    // Grand totals
    expect(screen.getByText("GRAND TOTAL:")).toBeDefined();
    expect(screen.getByText("18.00 kg")).toBeDefined();
    
    // Budget remaining
    expect(screen.getByText("DAILY BUDGET:")).toBeDefined();
    expect(screen.getByText("5.00 kg")).toBeDefined();
    expect(screen.getByText("REMAINING BAL:")).toBeDefined();
    expect(screen.getByText("-13.00 kg")).toBeDefined(); // 5.0 - 18.0 = -13.0
  });

  it("handles empty daily activity states cleanly", () => {
    render(<CarbonReceipt activities={[]} dailyBudgetKg={5.0} />);
    expect(screen.getByText("No activities logged today.")).toBeDefined();
  });
});
