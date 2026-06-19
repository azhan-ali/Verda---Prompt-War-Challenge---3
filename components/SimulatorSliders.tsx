"use client";

import React from "react";
import { SimulatorInputs } from "../lib/simulatorMath";
import { Car, Bike, Leaf, Plane, Globe, Utensils } from "lucide-react";

interface SimulatorSlidersProps {
  inputs: SimulatorInputs;
  onChange: (inputs: SimulatorInputs) => void;
}

export default function SimulatorSliders({ inputs, onChange }: SimulatorSlidersProps) {
  const updateInput = (key: keyof SimulatorInputs, value: any) => {
    onChange({
      ...inputs,
      [key]: value,
    });
  };

  const transportOptions = [
    { value: "petrolCar", label: "Petrol Car", icon: <Car className="h-4 w-4" /> },
    { value: "electricCar", label: "EV", icon: <Globe className="h-4 w-4" /> },
    { value: "transit", label: "Transit", icon: <Globe className="h-4 w-4" /> },
    { value: "walkCycle", label: "Active", icon: <Bike className="h-4 w-4" /> },
  ] as const;

  const dietOptions = [
    { value: "meatLover", label: "Heavy Meat", icon: <Utensils className="h-4 w-4" /> },
    { value: "mixed", label: "Mixed Diet", icon: <Utensils className="h-4 w-4" /> },
    { value: "vegetarian", label: "Vegetarian", icon: <Leaf className="h-4 w-4" /> },
    { value: "vegan", label: "Vegan Plan", icon: <Leaf className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="space-y-8 bg-white/70 backdrop-blur-md border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
        ⚙️ Simulate New Lifestyle
      </h2>

      {/* 1. Transport Mode Segmented Control */}
      <div className="space-y-3.5">
        <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
          🚗 Transport Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/40">
          {transportOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateInput("transportMode", opt.value)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                inputs.transportMode === opt.value
                  ? "bg-emerald-600 text-white shadow-sm scale-102"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Diet Type Segmented Control */}
      <div className="space-y-3.5">
        <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
          🥗 Diet Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/40">
          {dietOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateInput("dietType", opt.value)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                inputs.dietType === opt.value
                  ? "bg-emerald-600 text-white shadow-sm scale-102"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Daily Distance Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm font-bold text-gray-700">
          <span className="flex items-center gap-2">📍 Daily Commute</span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md">
            {inputs.dailyKm} km/day
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 font-semibold">0 km</span>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={inputs.dailyKm}
            onChange={(e) => updateInput("dailyKm", parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-xs text-gray-400 font-semibold">50 km</span>
        </div>
      </div>

      {/* 4. Annual Flights Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm font-bold text-gray-700">
          <span className="flex items-center gap-2">✈️ Annual Flights</span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md">
            {inputs.flightsPerYear} flights/yr
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 font-semibold">0</span>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={inputs.flightsPerYear}
            onChange={(e) => updateInput("flightsPerYear", parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-xs text-gray-400 font-semibold">20</span>
        </div>
      </div>
    </div>
  );
}
