"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TreePine, Car, Sparkles, Flame, CheckCircle2 } from "lucide-react";
import { AnnualFootprint } from "../lib/simulatorMath";

interface SimulatorChartProps {
  currentAnn: AnnualFootprint;
  proposedAnn: AnnualFootprint;
  co2Saved: number;
  treesSaved: number;
  kmEquivalent: number;
}

export default function SimulatorChart({
  currentAnn,
  proposedAnn,
  co2Saved,
  treesSaved,
  kmEquivalent,
}: SimulatorChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format data for Recharts BarChart
  const data = [
    {
      name: "Current",
      Transport: currentAnn.transport,
      Diet: currentAnn.diet,
      Flights: currentAnn.flight,
    },
    {
      name: "Proposed",
      Transport: proposedAnn.transport,
      Diet: proposedAnn.diet,
      Flights: proposedAnn.flight,
    },
  ];

  const hasSavings = co2Saved > 0;

  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#E5E7EB] rounded-3xl p-6 shadow-sm flex flex-col w-full transition-all duration-300 hover:shadow-md">
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
        📈 CO₂ Footprint Comparison
      </h2>

      {/* Recharts Stacked Bar Chart */}
      <div className="h-64 w-full flex items-center justify-center relative mb-8">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#6B7280", fontSize: 11, fontWeight: "bold" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit=" kg"
              />
              <Tooltip 
                cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "16px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: "11px",
                  fontFamily: "monospace"
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", fontWeight: "bold", fill: "#4B5563" }}
              />
              <Bar dataKey="Transport" stackId="a" fill="#059669" isAnimationActive={true} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Diet" stackId="a" fill="#34D399" isAnimationActive={true} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Flights" stackId="a" fill="#A7F3D0" isAnimationActive={true} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-gray-100/50 animate-pulse rounded-2xl" />
        )}
      </div>

      {/* Stat Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
        
        {/* Stat 1: CO2 Saved */}
        <div className="rounded-2xl border border-gray-100 bg-[#FCFBF7]/80 p-4 text-center flex flex-col justify-center shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mx-auto mb-2.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Annual Savings</p>
          <p className={`text-lg font-extrabold mt-1 truncate ${hasSavings ? "text-emerald-700" : "text-gray-500"}`}>
            {hasSavings ? `💨 ${co2Saved.toLocaleString()} kg` : "0 kg"}
          </p>
        </div>

        {/* Stat 2: Trees Saved */}
        <div className="rounded-2xl border border-gray-100 bg-[#FCFBF7]/80 p-4 text-center flex flex-col justify-center shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mx-auto mb-2.5">
            <TreePine className="h-5 w-5" />
          </div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Tree Equivalent</p>
          <p className={`text-lg font-extrabold mt-1 truncate ${hasSavings ? "text-emerald-700" : "text-gray-500"}`}>
            {hasSavings ? `🌳 ${treesSaved} trees` : "0 trees"}
          </p>
        </div>

        {/* Stat 3: Driving Km equivalent */}
        <div className="rounded-2xl border border-gray-100 bg-[#FCFBF7]/80 p-4 text-center flex flex-col justify-center shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mx-auto mb-2.5">
            <Car className="h-5 w-5" />
          </div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Driving Offset</p>
          <p className={`text-lg font-extrabold mt-1 truncate ${hasSavings ? "text-emerald-700" : "text-gray-500"}`}>
            {hasSavings ? `🚗 ${kmEquivalent.toLocaleString()} km` : "0 km"}
          </p>
        </div>

      </div>
    </div>
  );
}
