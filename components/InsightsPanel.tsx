"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, BrainCircuit, RotateCcw, AlertCircle, Car, Leaf, Zap, TrendingDown, Trophy, Star, MapPin } from "lucide-react";

interface InsightsTip {
  icon: string;
  title: string;
  body: string;
}

interface InsightsData {
  city: string;
  activityCount: number;
  totalEmissions: string;
  summary: string;
  transportHeadline: string;
  transportBody: string;
  transportKg: string;
  foodHeadline: string;
  foodBody: string;
  foodKg: string;
  energyKg: string;
  score: number | null;
  tips: InsightsTip[];
  closingLine: string;
}

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);

  const color =
    score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";
  const label =
    score >= 70 ? "Excellent" : score >= 40 ? "Good" : "Needs Work";
  
  const bgGlow = 
    score >= 70 ? "from-emerald-500/10 to-teal-500/5" : score >= 40 ? "from-amber-500/10 to-yellow-500/5" : "from-red-500/10 to-orange-500/5";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Glow effect */}
        <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${bgGlow} filter blur-md animate-pulse`} />
        
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#F1F5F9" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-3xl font-black tracking-tight leading-none mt-1" style={{ color }}>{score}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Score</span>
        </div>
      </div>
      <div className="text-center mt-3 relative z-10">
        <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ color, backgroundColor: color + "15", border: `1px solid ${color}20` }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function StatPill({ 
  icon, label, value, color, bgColor, textColor, percentage 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string; 
  bgColor: string; 
  textColor: string;
  percentage: number;
}) {
  return (
    <div className="flex flex-col gap-3.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-4.5 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${textColor} shadow-sm border border-black/5`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-base font-extrabold text-slate-800 leading-none mt-0.5 truncate">{value} kg CO₂</p>
        </div>
      </div>
      
      {/* Mini progress bar */}
      <div>
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5">
          <span>Carbon Impact</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  icon, headline, body, kg, accentColor, delay,
}: {
  icon: React.ReactNode;
  headline: string;
  body: string;
  kg: string;
  accentColor: string;
  delay: string;
}) {
  return (
    <div
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
      style={{ animationDelay: delay }}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5" style={{ background: accentColor + "15", color: accentColor }}>
            {icon}
          </div>
          
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-100 text-right shrink-0 flex items-center gap-1.5">
            <span className="text-base font-extrabold text-slate-900 leading-none">{kg}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">kg CO₂</span>
          </div>
        </div>
        
        <h4 className="text-base font-extrabold text-slate-900 leading-snug mb-3">
          {headline}
        </h4>
        
        <p className="text-xs text-gray-500 leading-relaxed border-t border-slate-50 pt-4 font-medium">
          {body}
        </p>
      </div>
    </div>
  );
}

function TipCard({ tip, index }: { tip: InsightsTip; index: number }) {
  const colors = ["#10B981", "#0ea5e9", "#8b5cf6"];
  const bgs = ["bg-emerald-500/10", "bg-sky-500/10", "bg-purple-500/10"];
  const borderColors = ["border-emerald-100", "border-sky-100", "border-purple-100"];
  const textColors = ["text-emerald-700", "text-sky-700", "text-purple-700"];
  
  const color = colors[index % colors.length];
  const bg = bgs[index % bgs.length];
  const borderColor = borderColors[index % borderColors.length];
  const textColor = textColors[index % textColors.length];

  return (
    <div className={`rounded-2xl border ${borderColor} bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex gap-4 items-start`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${bg}`}>
        {tip.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-slate-900 mb-1 leading-snug">{tip.title}</p>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">{tip.body}</p>
      </div>
      
      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0 self-center ${bg} ${textColor}`}>
        Hack
      </span>
    </div>
  );
}

export default function InsightsPanel() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Reading carbon twin state...",
    "Analyzing recent commute logs...",
    "Comparing culinary benchmarks...",
    "Querying Patna regional databases...",
    "Synthesizing customized AI recommendations...",
    "Compiling final Carbon Intelligence report..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const generateInsights = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setLoading(true);
    setData(null);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/insights", { signal: controller.signal });
      if (!response.ok) throw new Error("Failed to fetch insights. Please try again.");
      const json: InsightsData = await response.json();
      setData(json);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "An error occurred.");
        console.error(err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="space-y-8">

      {/* Hero CTA Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 p-8 shadow-2xl">
        {/* Futury backgrounds */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5 min-w-0">
            <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="h-full w-full rounded-[15px] bg-slate-950 flex items-center justify-center">
                <BrainCircuit className="h-7 w-7 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-xl font-extrabold tracking-tight text-white">
                  AI Carbon Advisor
                </h3>
                <span className="text-[9px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Gemini Ultra Intelligence
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed font-medium">
                Unlock a personalized, deep-dive environmental intelligence report generated in real-time from your last 7 days of activities.
              </p>
            </div>
          </div>

          <button
            onClick={generateInsights}
            disabled={loading}
            tabIndex={0}
            className={`relative overflow-hidden group shrink-0 px-8 py-4 rounded-2xl font-extrabold text-sm select-none transition-all duration-300 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2.5 ${
              loading
                ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:opacity-95 hover:shadow-emerald-500/20"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1" aria-hidden>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Analysing your week...</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 animate-spin" style={{ animationDuration: "3s" }} />
                <span>{data ? "Regenerate Insights" : "Generate My Insights"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-4 p-6 bg-red-50/70 border border-red-100 rounded-3xl shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-800">Generation failed</p>
            <p className="text-xs text-red-600 mt-1 font-medium leading-relaxed">{error}</p>
            <button
              onClick={generateInsights}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-800 underline hover:text-red-950 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading State Simulator */}
      {loading && (
        <div className="rounded-3xl border border-slate-100 bg-white/70 backdrop-blur-md p-8 shadow-sm flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated glowing scanning indicator */}
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-200 animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center">
                <BrainCircuit className="h-10 w-10 text-emerald-500 animate-pulse" />
              </div>
              <div className="absolute -inset-1 rounded-full border-t-2 border-emerald-500 animate-[spin_1.5s_linear_infinite]" />
            </div>

            <h4 className="text-lg font-bold text-slate-800 mb-1">Analyzing Carbon Twin Data</h4>
            <div className="h-6 overflow-hidden relative w-72 flex justify-center">
              <p className="text-xs font-semibold text-emerald-600 animate-pulse transition-all duration-300">
                {loadingMessages[loadingStep]}
              </p>
            </div>

            {/* Simulated skeletons */}
            <div className="w-80 mt-8 space-y-3 opacity-40">
              <div className="h-3 bg-slate-200 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-slate-200 rounded-full w-5/6 mx-auto animate-pulse" />
              <div className="h-3 bg-slate-200 rounded-full w-2/3 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div
          id="insights-output-container"
          aria-live="polite"
          className="space-y-8 animate-fade-in"
        >
          {/* Summary Header Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-100/50 p-8">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-white to-emerald-50/20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-8 justify-between items-stretch">
              {/* Summary side */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      🌿 Verda Report — {data.city}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full shadow-sm">
                      📊 {data.activityCount} logged {data.activityCount === 1 ? "activity" : "activities"}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                    Weekly Carbon Diagnostic
                  </h2>
                  
                  <p className="text-base text-gray-600 leading-relaxed font-medium">
                    {data.summary}
                  </p>
                </div>

                {/* Emission Stat Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  <StatPill 
                    icon={<Car className="h-5 w-5" />} 
                    label="Transport" 
                    value={data.transportKg} 
                    color="#059669" 
                    bgColor="bg-emerald-50"
                    textColor="text-emerald-700"
                    percentage={data.totalEmissions ? Math.round((parseFloat(data.transportKg) / Math.max(parseFloat(data.totalEmissions), 0.01)) * 100) : 0}
                  />
                  <StatPill 
                    icon={<Leaf className="h-5 w-5" />} 
                    label="Food" 
                    value={data.foodKg} 
                    color="#0284C7" 
                    bgColor="bg-sky-50"
                    textColor="text-sky-700"
                    percentage={data.totalEmissions ? Math.round((parseFloat(data.foodKg) / Math.max(parseFloat(data.totalEmissions), 0.01)) * 100) : 0}
                  />
                  <StatPill 
                    icon={<Zap className="h-5 w-5" />} 
                    label="Energy" 
                    value={data.energyKg} 
                    color="#7C3AED" 
                    bgColor="bg-purple-50"
                    textColor="text-purple-700"
                    percentage={data.totalEmissions ? Math.round((parseFloat(data.energyKg) / Math.max(parseFloat(data.totalEmissions), 0.01)) * 100) : 0}
                  />
                </div>
              </div>

              {/* Eco Score ring */}
              {data.score !== null && (
                <div className="lg:w-48 shrink-0 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                  <ScoreRing score={data.score} />
                </div>
              )}
            </div>
          </div>

          {/* Category Analysis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Category Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryCard
                icon={<Car className="h-5 w-5" />}
                headline={data.transportHeadline}
                body={data.transportBody}
                kg={data.transportKg}
                accentColor="#059669"
                delay="0ms"
              />
              <CategoryCard
                icon={<Leaf className="h-5 w-5" />}
                headline={data.foodHeadline}
                body={data.foodBody}
                kg={data.foodKg}
                accentColor="#0284C7"
                delay="100ms"
              />
            </div>
          </div>

          {/* Action Tips */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
              <Star className="h-4 w-4" /> Actionable Recommendations
            </h3>
            <div className="flex flex-col gap-4">
              {data.tips.map((tip, i) => (
                <TipCard key={i} tip={tip} index={i} />
              ))}
            </div>
          </div>

          {/* Closing motivational banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-7 text-white shadow-xl shadow-emerald-600/20">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative flex items-center gap-5">
              <div className="h-12 w-12 rounded-2xl bg-white/25 flex items-center justify-center shrink-0 text-2xl shadow-inner border border-white/10">
                🌿
              </div>
              <p className="text-sm font-extrabold leading-relaxed opacity-95">{data.closingLine}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state (before first generation) */}
      {!data && !loading && !error && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-5 shadow-sm border border-emerald-100 animate-bounce">
            🧠
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Your insights await</h3>
          <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6 font-medium">
            Click <strong className="text-emerald-600 font-extrabold">"Generate My Insights"</strong> above to get a personalized AI-powered carbon intelligence report based on your recent activity data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-bold border-t border-slate-100 pt-6 w-full max-w-sm">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Zero data shared
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">⚡</span> Instant results
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">🌱</span> Actionable tips
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
