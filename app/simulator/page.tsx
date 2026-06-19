"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import SimulatorSliders from "@/components/SimulatorSliders";
import SimulatorChart from "@/components/SimulatorChart";
import { 
  SimulatorInputs, 
  calculateAnnualEmissions, 
  calculateSavings, 
  DEFAULT_CURRENT_LIFESTYLE 
} from "@/lib/simulatorMath";

export default function SimulatorPage() {
  // Proposed lifestyle starts with slightly greener choices as defaults for comparison
  const [proposedInputs, setProposedInputs] = useState<SimulatorInputs>({
    transportMode: "electricCar",
    dietType: "vegetarian",
    dailyKm: 15,
    flightsPerYear: 1,
  });

  const currentAnn = calculateAnnualEmissions(DEFAULT_CURRENT_LIFESTYLE);
  const proposedAnn = calculateAnnualEmissions(proposedInputs);
  const savings = calculateSavings(DEFAULT_CURRENT_LIFESTYLE, proposedInputs);

  return (
    <div className="relative min-h-screen bg-transparent pb-16">
      {/* Global Navbar */}
      <Navbar />

      {/* Main content wrapper */}
      <main className="pt-28 px-6 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Header Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            🌿 What-If Carbon Simulator
          </h1>
          <p className="mt-2 text-base md:text-lg text-gray-500 max-w-2xl">
            Simulate and project your annual CO₂ footprint adjustments in real-time. Drag sliders, switch options, and observe the immediate savings.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sliders */}
          <div className="lg:col-span-5">
            <SimulatorSliders
              inputs={proposedInputs}
              onChange={(updated) => setProposedInputs(updated)}
            />
          </div>

          {/* Right Column: Chart & Stats */}
          <div className="lg:col-span-7">
            <SimulatorChart
              currentAnn={currentAnn}
              proposedAnn={proposedAnn}
              co2Saved={savings.co2Saved}
              treesSaved={savings.treesSaved}
              kmEquivalent={savings.kmEquivalent}
            />
          </div>
          
        </div>

      </main>
    </div>
  );
}
