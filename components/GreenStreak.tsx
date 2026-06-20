"use client";

import React, { useState, useEffect } from "react";
import { Flame, Info } from "lucide-react";

interface StreakDay {
  date: string;
  totalKg: number;
  status: "green" | "red" | "grey";
}

interface StreakData {
  success: boolean;
  streak: number;
  budget: number;
  history: StreakDay[];
}

export default function GreenStreak() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/streak")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load streak: ", err);
        setLoading(false);
      });
  }, []);

  const getColorClass = (status: "green" | "red" | "grey") => {
    switch (status) {
      case "green":
        return "bg-emerald-400 border border-emerald-500/10";
      case "red":
        return "bg-red-300 border border-red-400/10";
      case "grey":
        return "bg-gray-100 border border-gray-200/50";
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="relative rounded-3xl border border-[#E5E7EB] bg-white/70 backdrop-blur-md p-6 shadow-sm flex flex-col w-full transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">🔥 Green Streak</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Consistently stay under your carbon budget
          </p>
        </div>

        {/* Dynamic Streak Badge */}
        {!loading && data && (
          <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-100 px-3.5 py-1 text-xs font-bold text-orange-700 animate-bounce">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-600" />
            <span>🔥 {data.streak}-Day Streak</span>
          </div>
        )}
      </div>

      {loading ? (
        /* Loading skeleton grids */
        <div className="space-y-4">
          <div className="h-4 bg-gray-200/60 rounded-full w-24 animate-pulse" />
          <div className="grid grid-cols-7 gap-2 mx-auto max-w-[266px]">
            {Array.from({ length: 30 }).map((_, idx) => (
              <div key={idx} className="w-8 h-8 rounded-md bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Main Streak Grid */}
          <div className="grid grid-cols-7 gap-2.5 mx-auto max-w-[266px]">
            {data.history.map((day) => (
              <div
                key={day.date}
                tabIndex={0}
                onMouseEnter={() => setActiveTooltip(day.date)}
                onMouseLeave={() => setActiveTooltip(null)}
                onFocus={() => setActiveTooltip(day.date)}
                onBlur={() => setActiveTooltip(null)}
                aria-label={`Emissions on ${day.date}: ${day.totalKg} kg CO2, status ${day.status}`}
                className={`w-8 h-8 rounded-md relative cursor-help transition-all duration-200 hover:scale-108 hover:shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${getColorClass(
                  day.status
                )}`}
              >
                {/* Custom Keyboard-Accessible Hover Tooltip */}
                {activeTooltip === day.date && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-40 w-36 bg-gray-900/95 backdrop-blur-xs text-white text-[10px] rounded-lg p-2 shadow-lg text-center pointer-events-none animate-fadeIn font-mono leading-normal">
                    <div className="font-bold text-gray-200">{formatTooltipDate(day.date)}</div>
                    <div className="mt-0.5 font-bold">{day.totalKg.toFixed(2)} kg CO₂</div>
                    <div className="text-gray-400 text-[9px] uppercase tracking-wider font-semibold mt-0.5">
                      {day.status === "grey"
                        ? "No activity"
                        : day.status === "green"
                        ? "Under Budget"
                        : "Over Budget"}
                    </div>
                    {/* Tooltip triangle indicator */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Grid legend mapping */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-4 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-gray-100 border border-gray-200/50" />
              <span>Unlogged</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-400 border border-emerald-500/10" />
              <span>Under Budget</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-red-300 border border-red-400/10" />
              <span>Over Budget</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-xs font-semibold">
          <Info className="h-5 w-5 mx-auto text-gray-300 mb-2" />
          <span>Failed to load streak history.</span>
        </div>
      )}
    </div>
  );
}
