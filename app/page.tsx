"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WorkflowSection from "@/components/landing/WorkflowSection";
import PreviewSection from "@/components/landing/PreviewSection";
import CTABanner from "@/components/landing/CTABanner";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Showcase */}
      <FeaturesSection />

      {/* Workflow Section */}
      <WorkflowSection />

      {/* You vs City Benchmark Preview */}
      <PreviewSection />

      {/* Sage Green CTA Banner */}
      <CTABanner />

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full py-12 text-center text-xs text-gray-400 border-t border-gray-100 bg-white/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Verda. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
