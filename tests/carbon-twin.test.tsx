// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CarbonTwin from "../components/CarbonTwin";
import React from "react";

// Mock Recharts to avoid responsive layout issues in JSDOM
vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: any) => <div className="mock-container">{children}</div>,
    RadialBarChart: ({ children }: any) => <svg className="mock-chart">{children}</svg>,
    RadialBar: () => <g className="mock-bar"></g>,
    PolarAngleAxis: () => <g className="mock-axis"></g>,
  };
});

describe("CarbonTwin Component", () => {
  it("renders with Healthy status when emissions are under 60% of budget", () => {
    render(<CarbonTwin todayEmissionsKg={2.0} dailyBudgetKg={5.0} />); // 40%
    
    // Check titles
    expect(screen.getByText("🌱 Your Carbon Twin")).toBeDefined();
    
    // Check status badge
    expect(screen.getByText("Healthy")).toBeDefined();
    
    // Check that it shows carbon values in text
    expect(screen.getByText("2 / 5 kg")).toBeDefined();
  });

  it("renders with Stressed status when emissions are between 60% and 100%", () => {
    render(<CarbonTwin todayEmissionsKg={4.0} dailyBudgetKg={5.0} />); // 80%
    
    expect(screen.getByText("Stressed")).toBeDefined();
    expect(screen.getByText("4 / 5 kg")).toBeDefined();
  });

  it("renders with Wilted status when emissions exceed 100% of budget", () => {
    render(<CarbonTwin todayEmissionsKg={6.5} dailyBudgetKg={5.0} />); // 130%
    
    expect(screen.getByText("Wilted")).toBeDefined();
    expect(screen.getByText("6.5 / 5 kg")).toBeDefined();
  });
});
