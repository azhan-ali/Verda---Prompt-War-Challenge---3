"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <section className="bg-transparent py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-[#D1FAE5]/65 backdrop-blur-md px-8 py-16 text-center shadow-sm border border-emerald-100 md:px-16"
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent)] pointer-events-none" />

          <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to change your habits?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-800">
            Join other conscious citizens today. Start voice logging your daily habits and growing your carbon twin.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => signIn()}
              className="rounded-full bg-[#059669] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#047857] hover:shadow-lg cursor-pointer"
            >
              Start Tracking for Free
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
