"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LayoutDashboard, Sliders, Sparkles, LogOut, Menu, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MagicInput from "@/components/MagicInput";
import CarbonTwin from "@/components/CarbonTwin";
import BaselineBenchmark from "@/components/BaselineBenchmark";
import CarbonReceipt from "@/components/CarbonReceipt";
import GreenStreak from "@/components/GreenStreak";
import SimulatorSliders from "@/components/SimulatorSliders";
import SimulatorChart from "@/components/SimulatorChart";
import InsightsPanel from "@/components/InsightsPanel";
import { 
  SimulatorInputs, 
  calculateAnnualEmissions, 
  calculateSavings, 
  DEFAULT_CURRENT_LIFESTYLE 
} from "@/lib/simulatorMath";

interface DashboardClientProps {
  session: Session;
  todayEmissionsKg: number;
  initialActivities: any[];
}

export default function DashboardClient({
  session: initialSession,
  todayEmissionsKg,
  initialActivities,
}: DashboardClientProps) {
  const { data: session, update } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const activeSession = session || initialSession;
  const user = activeSession?.user;

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [customCity, setCustomCity] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "insights">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [proposedInputs, setProposedInputs] = useState<SimulatorInputs>({
    transportMode: "electricCar",
    dietType: "vegetarian",
    dailyKm: 15,
    flightsPerYear: 1,
  });

  useEffect(() => {
    setMounted(true);
    
    const handleURLTab = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab === "insights" || tab === "simulator" || tab === "dashboard") {
          setActiveTab(tab as any);
        }
      }
    };
    
    handleURLTab();
    
    window.addEventListener("popstate", handleURLTab);
    const interval = setInterval(handleURLTab, 300);
    
    return () => {
      window.removeEventListener("popstate", handleURLTab);
      clearInterval(interval);
    };
  }, []);

  const currentAnn = calculateAnnualEmissions(DEFAULT_CURRENT_LIFESTYLE);
  const proposedAnn = calculateAnnualEmissions(proposedInputs);
  const savings = calculateSavings(DEFAULT_CURRENT_LIFESTYLE, proposedInputs);

  const showCityModal = !user?.city;

  const handleCitySelect = async (city: string) => {
    setSelectedCity(city);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update city");
      }

      await update({ city });
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const cities = [
    { name: "Delhi", baseline: "5.2 kg", desc: "Capital region baseline" },
    { name: "Mumbai", baseline: "4.8 kg", desc: "Coastal metro baseline" },
    { name: "Bangalore", baseline: "4.6 kg", desc: "Tech hub baseline" },
    { name: "Patna", baseline: "4.5 kg", desc: "Eastern plain baseline" },
  ];

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "simulator", label: "Simulator", icon: <Sliders className="h-5 w-5" /> },
    { id: "insights", label: "Insights", icon: <Sparkles className="h-5 w-5" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-transparent text-[#374151] font-sans antialiased flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-md border-r border-[#E5E7EB] sticky top-0 h-screen z-30">
        <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
          <span className="font-display text-2xl font-bold text-[#059669]">🌿 Verda</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                activeTab === link.id
                  ? "bg-emerald-50 text-[#059669]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </nav>

        {/* User Card at bottom of Sidebar */}
        <div className="p-4 border-t border-[#E5E7EB] bg-gray-50/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <span className="block text-sm font-semibold text-gray-900 truncate">{user?.name}</span>
              <span className="block text-xs text-gray-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-gray-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4 text-gray-500" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 max-w-xs bg-white/80 backdrop-blur-md h-full z-50">
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E7EB]">
              <span className="font-display text-2xl font-bold text-[#059669]">🌿 Verda</span>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="text-gray-500 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-md p-1"
                aria-label="Close sidebar"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                    activeTab === link.id
                      ? "bg-emerald-50 text-[#059669]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E5E7EB] bg-gray-50/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <span className="block text-sm font-semibold text-gray-900 truncate">{user?.name}</span>
                  <span className="block text-xs text-gray-500 truncate">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-gray-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <LogOut className="h-4 w-4 text-gray-500" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 w-full border-b border-[#E5E7EB] bg-white/60 backdrop-blur-md md:hidden">
          <div className="flex h-16 items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-md p-1"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <span className="font-display text-2xl font-bold text-[#059669]">🌿 Verda</span>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-xs">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:py-12 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
                    Welcome back, {user?.name || "Green Champion"}!
                  </h1>
                  <p className="mt-2 text-lg text-gray-500">
                    Here's the current state of your zero-friction carbon twin.
                  </p>
                </div>

                {/* Magic Input voice/text log section */}
                <div className="mb-10">
                  <MagicInput onActivityLogged={() => {
                    // Reload the page window to pull fresh activity stats and budget states from Prisma
                    window.location.reload();
                  }} />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Column 1: Profile and Baseline Benchmark */}
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-white/75 backdrop-blur-md p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-100">
                      <h2 className="text-lg font-bold text-[#111827] mb-4">🌍 Profile & Location</h2>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Selected City</span>
                          <span className="font-semibold text-[#059669]">{user?.city || "Not selected"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Daily Carbon Budget</span>
                          <span className="font-semibold text-gray-800">{user?.dailyBudgetKg} kg CO₂</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-gray-500">Created At</span>
                          <span className="text-gray-800">
                            {mounted && user ? new Date().toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <BaselineBenchmark todayEmissionsKg={todayEmissionsKg} cityName={user?.city} />

                    <GreenStreak />
                  </div>

                  {/* Column 2: Carbon Twin and Carbon Receipt */}
                  <div className="space-y-6">
                    <CarbonTwin
                      todayEmissionsKg={todayEmissionsKg}
                      dailyBudgetKg={user?.dailyBudgetKg ?? 5.0}
                    />

                    <CarbonReceipt
                      activities={initialActivities}
                      dailyBudgetKg={user?.dailyBudgetKg ?? 5.0}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "simulator" && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Header Title */}
                <div className="mb-6">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
                    🌿 What-If Carbon Simulator
                  </h1>
                  <p className="mt-2 text-lg text-gray-500">
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
              </motion.div>
            )}

            {activeTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Header Title */}
                <div className="mb-6">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
                    ✨ On-Demand AI Insights
                  </h1>
                  <p className="mt-2 text-lg text-gray-500">
                    Generate live-streamed, personalized carbon twin feedback powered by Google Gemini.
                  </p>
                </div>

                <InsightsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-gray-100 bg-white/90 backdrop-blur-md p-8 shadow-card relative transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 p-3 text-2xl mb-4">
                🌍
              </span>
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                Select your city
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                To calibrate your carbon twin and city benchmark averages, please select your primary city.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">Featured Cities</span>
              {cities.map((city) => (
                <button
                  key={city.name}
                  disabled={loading}
                  onClick={() => handleCitySelect(city.name)}
                  className={`w-full flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white/80 backdrop-blur-sm p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#059669] hover:shadow-md cursor-pointer ${
                    selectedCity === city.name ? "border-[#059669] bg-emerald-50/20" : ""
                  }`}
                >
                  <div>
                    <span className="block font-semibold text-[#111827]">{city.name}</span>
                    <span className="block text-xs text-gray-400 mt-0.5">{city.desc}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-semibold text-[#047857]">
                      {city.baseline} avg
                    </span>
                  </div>
                </button>
              ))}

              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="mx-3 flex-shrink text-[10px] font-extrabold text-gray-400 uppercase tracking-widest bg-white/90 backdrop-blur-md px-2 rounded-full">or</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => {
                      setCustomCity(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customCity.trim() && !loading) {
                        handleCitySelect(customCity.trim());
                      }
                    }}
                    placeholder="Type city (e.g. Guwahati)"
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-200 bg-white/80 p-4 pl-12 text-sm font-semibold text-[#111827] focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!customCity.trim()) {
                      setError("Please enter a valid city name");
                      return;
                    }
                    handleCitySelect(customCity.trim());
                  }}
                  disabled={loading || !customCity.trim()}
                  className="px-6 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0"
                >
                  Go
                </button>
              </div>
            </div>

            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#059669] border-t-transparent" />
                <span className="mt-3 text-sm font-semibold text-[#059669]">Calibrating twin...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
