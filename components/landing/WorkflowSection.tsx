"use client";

import { motion } from "framer-motion";
import { Monitor, LogIn, Mic, LayoutDashboard, Sparkles } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      num: "1",
      title: "Welcome to Verda",
      desc: "Land on our premium hero section to start your green journey.",
      icon: <Monitor className="w-5 h-5 text-[#059669]" />,
    },
    {
      num: "2",
      title: "One-Click Sign In",
      desc: "Authenticate securely and instantly with your Google account.",
      icon: <LogIn className="w-5 h-5 text-[#059669]" />,
    },
    {
      num: "3",
      title: "Magic Input Logging",
      desc: "Tell us about your day via voice or text — no complex forms required.",
      icon: <Mic className="w-5 h-5 text-[#059669]" />,
    },
    {
      num: "4",
      title: "Real-Time Dashboard",
      desc: "Watch your Carbon Twin react, get a receipt, and track your Green Streak.",
      icon: <LayoutDashboard className="w-5 h-5 text-[#059669]" />,
    },
    {
      num: "5",
      title: "Actionable Insights",
      desc: "Explore AI-generated recommendations and the interactive What-If Simulator.",
      icon: <Sparkles className="w-5 h-5 text-[#059669]" />,
    },
  ];

  return (
    <section id="workflow" className="bg-transparent py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-20 md:mb-28 flex flex-col items-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl relative inline-block">
            How Verda Works
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-[#059669] rounded-full"></span>
          </h2>
          <p className="mt-10 text-lg text-gray-500 max-w-xl mx-auto">
            From your first click to becoming a climate champion, here is the exact journey you will experience.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Vertical connecting line */}
          <div className="absolute left-[40px] md:left-1/2 top-4 bottom-4 w-[2px] bg-emerald-200 -translate-x-1/2 z-0" />

          <div className="space-y-16">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className={`relative flex items-center md:justify-between w-full ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-[40px] md:left-1/2 w-10 h-10 md:w-12 md:h-12 -translate-x-1/2 rounded-full border-[3px] border-[#F9FAFB] bg-[#059669] flex items-center justify-center text-white font-bold shadow-sm z-10 text-sm md:text-base ring-4 ring-[#D1FAE5]">
                    {step.num}
                  </div>

                  {/* Empty space for the opposite side on desktop */}
                  <div className="hidden md:block md:w-5/12" />

                  {/* Content Card */}
                  <div className="ml-24 md:ml-0 md:w-5/12 w-full">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group hover:-translate-y-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          {step.icon}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
