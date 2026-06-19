// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import GreenStreak from "../components/GreenStreak";
import React from "react";

const mockStreakData = {
  success: true,
  streak: 5,
  budget: 5.0,
  history: [
    { date: "2026-06-18", totalKg: 2.15, status: "green" },
    { date: "2026-06-17", totalKg: 6.20, status: "red" },
    { date: "2026-06-16", totalKg: 0.0, status: "grey" }
  ]
};

describe("GreenStreak Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockStreakData),
      } as any)
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading skeleton initially", () => {
    render(<GreenStreak />);
    expect(screen.getByText("🔥 Green Streak")).toBeDefined();
  });

  it("fetches and renders streak count and grid items", async () => {
    render(<GreenStreak />);
    
    // Wait for fetch to complete and state to update
    await waitFor(() => {
      expect(screen.getByText("🔥 5-Day Streak")).toBeDefined();
    });

    // Check legend items
    expect(screen.getByText("Unlogged")).toBeDefined();
    expect(screen.getByText("Under Budget")).toBeDefined();
    expect(screen.getByText("Over Budget")).toBeDefined();
  });

  it("shows tooltip on element hover and focus", async () => {
    render(<GreenStreak />);
    
    await waitFor(() => {
      expect(screen.getByText("🔥 5-Day Streak")).toBeDefined();
    });

    const gridBoxes = screen.getAllByRole("generic").filter(
      (el) => el.getAttribute("aria-label")?.includes("Emissions on")
    );
    
    expect(gridBoxes).toHaveLength(3);

    // Focus on the first block (2026-06-18, green)
    fireEvent.focus(gridBoxes[0]);
    
    // Tooltip should be visible
    expect(screen.getByText("2.15 kg CO₂")).toBeDefined();
    expect(screen.getAllByText(/under budget/i)).toHaveLength(2); // Legend and tooltip both present

    // Blur from the block
    fireEvent.blur(gridBoxes[0]);
    expect(screen.queryByText("2.15 kg CO₂")).toBeNull();
  });
});
