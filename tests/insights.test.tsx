// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import InsightsPanel from "../components/InsightsPanel";

// Mock global fetch to intercept API calls
const mockFetch = vi.fn();
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = mockFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

const mockInsightsData = {
  city: "Bangalore",
  activityCount: 5,
  totalEmissions: "12.50",
  summary: "You logged 5 activities in Bangalore this week, generating 12.50 kg CO₂ in total.",
  transportHeadline: "Excellent green commuting! 🏆",
  transportBody: "You have kept transport emissions extremely low this week. Your active commuting choices are making a real difference.",
  transportKg: "2.50",
  foodHeadline: "Smart food choices! 🌱",
  foodBody: "Your food choices are well within a sustainable range. Maintaining plant-forward meals keeps your footprint low.",
  foodKg: "6.00",
  energyKg: "4.00",
  score: 72,
  tips: [
    { icon: "🚲", title: "Micro-Commute Switch", body: "For any trips under 3 km, swap your motor vehicle for cycling or walking." },
    { icon: "🥗", title: "Plant-Forward Meals", body: "Replace 2 high-meat meals this week with plant-based alternatives." },
    { icon: "🔌", title: "Phantom Power Purge", body: "Unplug devices and turn off AC when not in use." },
  ],
  closingLine: "Keep growing your green streak — every mindful choice feeds your carbon twin's canopy. 🌿",
};

describe("InsightsPanel Component", () => {
  it("renders the initial empty state with CTA button", () => {
    render(<InsightsPanel />);

    expect(screen.getByText("AI Carbon Advisor")).toBeDefined();
    expect(screen.getByText("Generate My Insights")).toBeDefined();
    expect(screen.getByText("Your insights await")).toBeDefined();
  });

  it("shows loading state and then renders structured insights from JSON response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInsightsData,
    });

    render(<InsightsPanel />);

    const generateButton = screen.getByText("Generate My Insights");
    fireEvent.click(generateButton);

    // Loading state should appear
    await waitFor(() => {
      expect(screen.getByText("Analysing your week...")).toBeDefined();
    });

    // Results should appear after loading — find by data-testid
    await waitFor(() => {
      const container = screen.getByTestId("insights-output-container");
      expect(container).toBeDefined();
      expect(container.textContent).toContain("Bangalore");
      expect(container.textContent).toContain("5 logged");
      expect(container.textContent).toContain("12.50");
    }, { timeout: 5000 });
  });

  it("renders all three recommendation tips from API response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInsightsData,
    });

    render(<InsightsPanel />);
    fireEvent.click(screen.getByText("Generate My Insights"));

    await waitFor(() => {
      const container = screen.getByTestId("insights-output-container");
      expect(container.textContent).toContain("Micro-Commute Switch");
      expect(container.textContent).toContain("Plant-Forward Meals");
      expect(container.textContent).toContain("Phantom Power Purge");
    }, { timeout: 5000 });
  });

  it("handles fetch failure gracefully and displays an error message", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    render(<InsightsPanel />);
    fireEvent.click(screen.getByText("Generate My Insights"));

    await waitFor(() => {
      expect(screen.getByText("Generation failed")).toBeDefined();
      expect(screen.getByText("Failed to fetch insights. Please try again.")).toBeDefined();
    });

    // Retry button should be visible
    expect(screen.getByText("Try Again")).toBeDefined();
  });
});
