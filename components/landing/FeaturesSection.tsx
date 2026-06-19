"use client";

import { Mic, TreePine, Sparkles, Receipt, Flame, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Mic className="h-6 w-6 text-[#059669]" />,
      title: "Voice Logging",
      description: "Log your daily commutes, meals, and energy in plain English or Hindi. No sheets or complex forms.",
    },
    {
      icon: <TreePine className="h-6 w-6 text-[#059669]" />,
      title: "Carbon Twin",
      description: "A living virtual tree that visualizes your impact. Thrives when you save, wilts when you go over.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-[#059669]" />,
      title: "AI Insights",
      description: "Personalized recommendations streamed instantly from Gemini, designed for your local city baseline.",
    },
    {
      icon: <Receipt className="h-6 w-6 text-[#059669]" />,
      title: "Carbon Receipt",
      description: "Get a detailed breakdown of your emissions after every log and compare with your city average.",
    },
    {
      icon: <Flame className="h-6 w-6 text-[#059669]" />,
      title: "Green Streak",
      description: "Build momentum with our premium activity grid. Maintain your eco-streak and see your progress.",
    },
    {
      icon: <SlidersHorizontal className="h-6 w-6 text-[#059669]" />,
      title: "What-If Simulator",
      description: "Play with interactive sliders to visualize instantly how lifestyle changes impact your carbon footprint.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <section className="bg-transparent py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-16 md:mb-24">
          <h2 className="font-display text-base font-semibold leading-7 text-[#059669]">
            Engineered for Change
          </h2>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to live greener
          </p>
          <p className="mt-4 text-lg text-gray-500">
            We've stripped away the complexity of carbon tracking so you can focus on making an impact.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="relative flex flex-col rounded-2xl border border-[#E5E7EB] bg-white/75 backdrop-blur-md p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
