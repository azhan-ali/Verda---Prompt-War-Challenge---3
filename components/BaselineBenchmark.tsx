"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowDown, ArrowUp, ShieldAlert, Award } from "lucide-react";
import { getCityBaseline } from "../lib/cityBaselines";

interface BaselineBenchmarkProps {
  todayEmissionsKg: number;
  cityName?: string | null;
}

export default function BaselineBenchmark({ todayEmissionsKg, cityName }: BaselineBenchmarkProps) {
  const baseline = getCityBaseline(cityName);
  const cityAvg = baseline.baselineKg;
  const activeCityName = baseline.name;

  // Set the visual maximum scale dynamically to accommodate both markers
  const maxVal = Math.max(todayEmissionsKg, cityAvg) * 1.3 || 6.0;
  const userPercent = (todayEmissionsKg / maxVal) * 100;
  const cityPercent = (cityAvg / maxVal) * 100;

  const isUnder = todayEmissionsKg <= cityAvg;
  const savingDelta = Number(Math.abs(cityAvg - todayEmissionsKg).toFixed(2));

  return (
    <div className="relative rounded-3xl border border-[#E5E7EB] bg-white/70 backdrop-blur-md p-6 shadow-sm flex flex-col w-full transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">📊 Baseline Benchmark</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Calibrated for {activeCityName} ({cityAvg} kg standard)
          </p>
        </div>

        {/* Dynamic status badge */}
        {isUnder ? (
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 animate-pulse">
            <Award className="h-3.5 w-3.5" />
            <span>Better than Avg</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Above Baseline</span>
          </div>
        )}
      </div>

      {/* Benchmark Slider/Track visualization */}
      <div className="relative my-8 px-2">
        {/* Label ABOVE the bar (User) */}
        <div className="h-8 relative w-full">
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${userPercent}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className="absolute -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-xs font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 whitespace-nowrap shadow-xs">
              You ({todayEmissionsKg} kg)
            </span>
            <div className="w-1.5 h-1.5 bg-[#059669] rounded-full mt-1" />
          </motion.div>
        </div>

        {/* The Track */}
        <div className="h-3.5 w-full bg-gray-100 rounded-full relative overflow-visible border border-gray-200/50">
          {/* User progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${userPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isUnder 
                ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
                : "bg-gradient-to-r from-amber-500 to-orange-400"
            }`}
          />

          {/* Dotted threshold line at the City Average point */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-7 w-0.5 border-l-2 border-dashed border-gray-400 pointer-events-none"
            style={{ left: `${cityPercent}%` }}
          />
        </div>

        {/* Label BELOW the bar (City Avg) */}
        <div className="h-8 relative w-full mt-2">
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${cityPercent}%` }}
          >
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mb-1" />
            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 whitespace-nowrap">
              {activeCityName} Avg ({cityAvg} kg)
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Nudge Text */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2.5">
        <div className={`p-2 rounded-xl ${isUnder ? "bg-emerald-50/50" : "bg-amber-50/50"}`}>
          <Sparkles className={`h-4.5 w-4.5 ${isUnder ? "text-emerald-600" : "text-amber-600"}`} />
        </div>
        <div>
          {isUnder ? (
            <>
              <p className="text-sm font-bold text-gray-900">Great work, Citizen!</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                You are currently saving <strong className="text-emerald-600 font-semibold">{savingDelta} kg CO₂</strong> compared to the average standard in {activeCityName}. Keep logging your green habits to maintain your streak!
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-900">Almost there!</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                You are currently <strong className="text-amber-600 font-semibold">{savingDelta} kg CO₂</strong> above the {activeCityName} average. Try walking short distances, opting for vegetarian lunches, or switching off standby appliances.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
