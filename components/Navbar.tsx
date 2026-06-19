"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [activeTabFromUrl, setActiveTabFromUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActiveTabFromUrl(params.get("tab") || "");
    }
  }, [pathname]);

  const isActive = (path: string, tab?: string) => {
    if (tab !== undefined) {
      return pathname === path && activeTabFromUrl === tab;
    }
    return pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        {/* Left: Brand logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display text-2xl font-bold text-[#059669] transition-transform duration-200 group-hover:scale-105">
            🌿 Verda
          </span>
        </Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/dashboard"
            className={`transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 focus-visible:outline-none rounded-md ${
              isActive("/dashboard", "")
                ? "text-[#059669] font-semibold"
                : "text-[#374151] hover:text-[#059669]"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/simulator"
            className={`transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 focus-visible:outline-none rounded-md ${
              isActive("/simulator")
                ? "text-[#059669] font-semibold"
                : "text-[#374151] hover:text-[#059669]"
            }`}
          >
            Simulator
          </Link>
          <Link
            href="/dashboard?tab=insights"
            className={`transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 focus-visible:outline-none rounded-md ${
              isActive("/dashboard", "insights")
                ? "text-[#059669] font-semibold"
                : "text-[#374151] hover:text-[#059669]"
            }`}
          >
            Insights
          </Link>
        </div>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#059669] px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#047857] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Go to App
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-[#E5E7EB] bg-white px-5 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="rounded-full bg-[#059669] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#047857] hover:shadow-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
