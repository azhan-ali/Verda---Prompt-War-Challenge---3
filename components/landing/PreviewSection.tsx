"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

export default function PreviewSection() {
  return (
    <section className="bg-transparent py-24 sm:py-32 border-b border-gray-100/40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="font-display text-base font-semibold leading-7 text-[#059669]">
            Baseline Benchmark
          </h2>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            See how you compare
          </p>
          <p className="mt-4 text-lg text-gray-500">
            Compare your footprint against standard citizens in your city.
          </p>
        </div>

        {/* Mock comparison card */}
        <div className="mx-auto max-w-xl rounded-3xl border border-[#E5E7EB] bg-white/70 backdrop-blur-md p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-gray-500">TODAY'S COMPARISON</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Better than 65% of city
            </span>
          </div>

          <div className="space-y-6">
            {/* You bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-gray-800">You (Average day)</span>
                <span className="font-bold text-[#059669]">3.2 kg CO₂</span>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "65%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#059669] rounded-full"
                />
              </div>
            </div>

            {/* City average bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-gray-800">City Average (Bangalore)</span>
                <span className="font-bold text-gray-500">4.6 kg CO₂</span>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gray-400 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 border-t border-gray-200/60 pt-4">
            <Info className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <p>
              Based on researched TERI 2023 city indices and default national baselines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
