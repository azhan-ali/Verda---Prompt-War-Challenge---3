// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorks from "../components/landing/HowItWorks";
import PreviewSection from "../components/landing/PreviewSection";
import CTABanner from "../components/landing/CTABanner";
import React from "react";

// Mock IntersectionObserver for Framer Motion viewport options in jsdom
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Landing Page Components", () => {
  it("renders Navbar with brand logo", () => {
    render(<Navbar />);
    expect(screen.getByText("🌿 Verda")).toBeDefined();
  });

  it("renders Hero with main tagline", () => {
    render(<Hero />);
    expect(screen.getByText("Track less.")).toBeDefined();
    expect(screen.getByText("Live greener.")).toBeDefined();
  });

  it("renders FeaturesSection with core details", () => {
    render(<FeaturesSection />);
    expect(screen.getByText("Voice Logging")).toBeDefined();
    expect(screen.getByText("Carbon Twin")).toBeDefined();
    expect(screen.getByText("AI Insights")).toBeDefined();
  });

  it("renders HowItWorks section steps", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Connect Account")).toBeDefined();
    expect(screen.getByText("Speak or Type")).toBeDefined();
    expect(screen.getByText("Grow Your Twin")).toBeDefined();
  });

  it("renders PreviewSection with city average", () => {
    render(<PreviewSection />);
    expect(screen.getByText("Baseline Benchmark")).toBeDefined();
    expect(screen.getByText("City Average (Bangalore)")).toBeDefined();
  });

  it("renders CTABanner description and button", () => {
    render(<CTABanner />);
    expect(screen.getByText("Ready to change your habits?")).toBeDefined();
    expect(screen.getByText("Start Tracking for Free")).toBeDefined();
  });
});
