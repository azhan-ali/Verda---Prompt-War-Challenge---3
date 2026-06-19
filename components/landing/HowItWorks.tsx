"use client";

import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Connect Account",
      desc: "Authenticate securely via Google OAuth in seconds.",
    },
    {
      num: "02",
      title: "Speak or Type",
      desc: "Log meals, rides, and energy in simple conversational phrases.",
    },
    {
      num: "03",
      title: "Grow Your Twin",
      desc: "Monitor your virtual tree and receive personalized insights.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-transparent py-24 sm:py-32 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-16 md:mb-24">
          <h2 className="font-display text-base font-semibold leading-7 text-[#059669]">
            The Verda Flow
          </h2>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simplicity at every level
          </p>
          <p className="mt-4 text-lg text-gray-500">
            A three-step cycle that helps you track your emissions automatically.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Horizontal connecting line for large screens */}
          <div className="absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 border-t border-dashed border-[#E5E7EB] z-0 hidden lg:block" />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                className="flex flex-col items-center text-center group"
              >
                {/* Number bubble */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-white/80 backdrop-blur-sm font-display text-2xl font-bold text-[#059669] shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-emerald-300">
                  {step.num}
                </div>
                <h3 className="mt-6 text-lg font-bold text-gray-900 group-hover:text-[#059669] transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-xs">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
