"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { TreePine, AlertTriangle, Flame } from "lucide-react";

interface CarbonTwinProps {
  todayEmissionsKg: number;
  dailyBudgetKg: number;
}

export default function CarbonTwin({ todayEmissionsKg, dailyBudgetKg }: CarbonTwinProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const budget = dailyBudgetKg || 5.0; // standard fallback
  const percentage = (todayEmissionsKg / budget) * 100;

  // Determine tree health state
  let label = "Healthy";
  let statusColor = "#10B981"; // Emerald
  let leanAngle = 0;
  let leafScale = 1.0;
  let leafColor = "#10B981";
  let leafOpacity = 1.0;
  let textClass = "text-emerald-700 bg-emerald-50/80 border-emerald-200";
  let Icon = TreePine;
  let state = "healthy";

  if (percentage <= 60) {
    state = "healthy";
    label = "Healthy";
    statusColor = "#059669"; // Emerald 600
    leanAngle = 0;
    leafScale = 1.0;
    leafColor = "#10B981"; // Emerald 500
    leafOpacity = 1.0;
    textClass = "text-emerald-700 bg-emerald-50 border-emerald-100";
    Icon = TreePine;
  } else if (percentage <= 100) {
    state = "stressed";
    label = "Stressed";
    statusColor = "#D97706"; // Amber 600
    leanAngle = -8;
    leafScale = 0.8;
    leafColor = "#F59E0B"; // Amber 500
    leafOpacity = 0.85;
    textClass = "text-amber-700 bg-amber-50 border-amber-100";
    Icon = AlertTriangle;
  } else {
    state = "wilted";
    label = "Wilted";
    statusColor = "#DC2626"; // Red 600
    leanAngle = -18;
    leafScale = 0.3;
    leafColor = "#78350F"; // Brown 900
    leafOpacity = 0.2;
    textClass = "text-red-700 bg-red-50 border-red-100";
    Icon = Flame;
  }

  // Data mapping for Recharts RadialBarChart
  const chartData = [
    {
      name: "Carbon Used",
      value: Math.min(percentage, 100),
      fill: statusColor,
    },
  ];

  const ariaDescription = `Your Verda carbon twin is currently ${state} — you've utilized ${Math.round(
    percentage
  )}% of your daily carbon budget (${todayEmissionsKg} kg of ${budget} kg).`;

  return (
    <div
      className="relative rounded-3xl border border-[#E5E7EB] bg-white/70 backdrop-blur-md p-6 shadow-sm flex flex-col items-center justify-center overflow-hidden w-full transition-all duration-300 hover:shadow-md"
      role="img"
      aria-label={ariaDescription}
    >
      <div className="w-full flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">🌱 Your Carbon Twin</h2>
        {/* Colorblind-Friendly Text Label */}
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors duration-300 ${textClass}`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
      </div>

      {/* SVG Living Tree */}
      <div className="w-full h-44 flex items-center justify-center relative">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full max-w-[160px] overflow-visible"
        >
          {/* Ground plate line */}
          <line x1="20" y1="170" x2="180" y2="170" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="60" y1="170" x2="45" y2="185" stroke="#E5E7EB" strokeWidth="1.5" />
          <line x1="100" y1="170" x2="100" y2="188" stroke="#E5E7EB" strokeWidth="1.5" />
          <line x1="140" y1="170" x2="155" y2="185" stroke="#E5E7EB" strokeWidth="1.5" />

          {/* Animated Tree Trunk & Branches */}
          <motion.g
            animate={{ rotate: leanAngle }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ transformOrigin: "100px 170px" }}
          >
            {/* Main Trunk */}
            <path
              d="M94 170 C 94 130, 97 100, 100 85 C 103 100, 106 130, 106 170 Z"
              fill={state === "wilted" ? "#5C4033" : "#78350F"}
            />
            
            {/* Left Branch */}
            <path
              d="M100 115 C 85 100, 75 100, 70 105"
              stroke={state === "wilted" ? "#5C4033" : "#78350F"}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Right Branch */}
            <path
              d="M100 100 C 115 85, 125 90, 130 95"
              stroke={state === "wilted" ? "#5C4033" : "#78350F"}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Tree Canopy Circles */}
            <g>
              {/* Central foliage */}
              <motion.circle
                cx="100"
                cy="72"
                r="30"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: leafScale, fill: leafColor, opacity: leafOpacity }}
                transition={{ type: "spring", stiffness: 80 }}
              />
              {/* Left foliage */}
              <motion.circle
                cx="74"
                cy="88"
                r="22"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: leafScale, fill: leafColor, opacity: leafOpacity }}
                transition={{ type: "spring", stiffness: 80, delay: 0.05 }}
              />
              {/* Right foliage */}
              <motion.circle
                cx="124"
                cy="83"
                r="24"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: leafScale, fill: leafColor, opacity: leafOpacity }}
                transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
              />
              {/* Top foliage */}
              <motion.circle
                cx="100"
                cy="48"
                r="20"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: leafScale, fill: leafColor, opacity: leafOpacity }}
                transition={{ type: "spring", stiffness: 80, delay: 0.15 }}
              />
            </g>

            {/* Glowing active green buds when Healthy */}
            {state === "healthy" && (
              <g>
                <circle cx="85" cy="74" r="2.5" fill="#A7F3D0" />
                <circle cx="115" cy="70" r="2.5" fill="#A7F3D0" />
                <circle cx="98" cy="88" r="2" fill="#A7F3D0" />
                <circle cx="102" cy="46" r="2" fill="#A7F3D0" />
              </g>
            )}
          </motion.g>
        </svg>
      </div>

      {/* Radial budget ring */}
      <div className="relative w-full h-44 flex items-center justify-center mt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="74%"
              outerRadius="90%"
              barSize={12}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "#E5E7EB" }}
                dataKey="value"
                cornerRadius={6}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-28 w-28 rounded-full border-4 border-gray-200 border-t-transparent animate-spin" />
        )}

        {/* Center stats overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
          <span className="text-3xl font-extrabold text-gray-900 leading-none">
            {Math.round(percentage)}%
          </span>
          <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mt-1">
            Budget Used
          </span>
          <span className="text-xs text-gray-500 font-semibold mt-1">
            {todayEmissionsKg} / {budget} kg
          </span>
        </div>
      </div>
    </div>
  );
}
