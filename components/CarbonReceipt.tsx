"use client";

import React, { useState } from "react";
import { Share2, Clipboard, CheckCircle2 } from "lucide-react";

export interface ActivityItem {
  id: string;
  description: string;
  transportKg: number;
  foodKg: number;
  energyKg: number;
  totalKg: number;
  date: string;
}

interface CarbonReceiptProps {
  activities: ActivityItem[];
  dailyBudgetKg: number;
}

export default function CarbonReceipt({ activities, dailyBudgetKg }: CarbonReceiptProps) {
  const [copied, setCopied] = useState(false);
  const budget = dailyBudgetKg || 5.0;

  // Calculate subtotals
  const subtotalTransport = activities.reduce((sum, act) => sum + act.transportKg, 0);
  const subtotalFood = activities.reduce((sum, act) => sum + act.foodKg, 0);
  const subtotalEnergy = activities.reduce((sum, act) => sum + act.energyKg, 0);
  const grandTotal = activities.reduce((sum, act) => sum + act.totalKg, 0);
  const remaining = budget - grandTotal;

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const handleShare = async () => {
    const shareText = `My Verda daily carbon footprint audit: ${grandTotal.toFixed(2)} kg CO₂ used out of my ${budget} kg budget today! ${
      remaining >= 0 ? "Under budget! 🌿" : "Over budget! ⚠️"
    } Track yours in real-time with Verda.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Carbon Footprint Receipt",
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.warn("Share cancelled or failed: ", err);
      }
    } else {
      // Fallback copy
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("Clipboard copy failed: ", err);
      }
    }
  };

  return (
    <div className="relative rounded-3xl border border-[#E5E7EB] bg-white/70 backdrop-blur-md p-6 shadow-sm flex flex-col w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-md">
      <h2 className="text-lg font-bold text-gray-800 mb-4 self-start">📄 Daily Receipt</h2>
      
      {/* Paper Receipt container */}
      <div className="w-full bg-[#FAF9F6] border border-gray-200/80 rounded-2xl p-5 shadow-inner font-mono text-gray-700 text-xs relative overflow-hidden">
        {/* Soft thermal paper texture details */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-b from-gray-200/20 to-transparent" />
        
        {/* Receipt Header */}
        <div className="text-center mb-4">
          <p className="font-bold text-sm tracking-widest text-gray-900">VERDA CARBON AUDIT</p>
          <p className="text-[10px] text-gray-400 mt-1">ZERO-FRICTION EMISSIONS CO.</p>
          <p className="text-[10px] text-gray-400">DATE: {todayStr}</p>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-300 my-3" />

        {/* Itemized Activity Log */}
        <div className="space-y-2.5">
          <p className="font-bold text-gray-900 text-[10px] uppercase tracking-wider">ITEMS LOGGED:</p>
          {activities.length === 0 ? (
            <p className="text-gray-400 italic py-1">No activities logged today.</p>
          ) : (
            activities.map((act, idx) => (
              <div key={act.id} className="flex justify-between items-start gap-3">
                <span className="truncate text-gray-600 max-w-[190px]">
                  {idx + 1}. {act.description}
                </span>
                <span className="shrink-0 font-semibold text-gray-800">
                  {act.totalKg.toFixed(2)} kg
                </span>
              </div>
            ))
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-300 my-4" />

        {/* Category Subtotals */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500">SUBTOTAL TRANSPORT:</span>
            <span className="text-gray-800">{subtotalTransport.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">SUBTOTAL FOOD:</span>
            <span className="text-gray-800">{subtotalFood.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">SUBTOTAL ENERGY:</span>
            <span className="text-gray-800">{subtotalEnergy.toFixed(2)} kg</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-300 my-4" />

        {/* Totals Section */}
        <div className="space-y-1.5 text-sm font-semibold">
          <div className="flex justify-between text-gray-900 font-bold">
            <span>GRAND TOTAL:</span>
            <span>{grandTotal.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>DAILY BUDGET:</span>
            <span>{budget.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between text-xs pt-1 border-t border-gray-200/50">
            <span>REMAINING BAL:</span>
            <span className={remaining >= 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
              {remaining.toFixed(2)} kg
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-300 my-4" />

        {/* Emojis & Streak Badge */}
        <div className="text-center pt-1">
          <p className="font-bold text-gray-900 text-[10px] tracking-widest uppercase">🌿 STREAK BONUS 🌿</p>
          <div className="flex justify-center gap-1.5 mt-2 text-lg">
            <span>🔥</span>
            <span>🌿</span>
            <span>🔋</span>
            <span>🌳</span>
            <span>♻️</span>
          </div>
        </div>
      </div>

      {/* Share / Copy Action trigger */}
      <button
        type="button"
        onClick={handleShare}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 transition-all duration-200 hover:bg-emerald-100/60 hover:-translate-y-0.5 cursor-pointer shadow-xs"
      >
        {copied ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-bounce" />
            <span>COPIED TO CLIPBOARD</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 text-emerald-700" />
            <span>SHARE DAILY RECEIPT</span>
          </>
        )}
      </button>
    </div>
  );
}
