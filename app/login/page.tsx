"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] overflow-hidden">
      {/* Premium ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,#d1fae5,transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_80%,#ecfdf5,transparent)] pointer-events-none" />

      {/* Floating decorative blobs */}
      <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-emerald-50/70 blur-2xl pointer-events-none animate-pulse duration-[8s]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2rem] p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100/50 p-4 rounded-full">
              <Leaf className="w-10 h-10 text-[#059669]" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight font-display">
            Welcome to Verda
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed text-sm">
            Zero-friction carbon tracking. Sign in to meet your AI Carbon Twin and start living greener.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 px-4 rounded-2xl shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:bg-gray-50 transition-all duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            
            {process.env.NODE_ENV !== "production" && (
              <button
                onClick={() => signIn("credentials", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 text-gray-500 font-medium py-3.5 px-4 rounded-2xl hover:bg-gray-100 transition-all duration-200"
              >
                Mock Credentials (Dev Only)
              </button>
            )}
          </div>

          <p className="mt-8 text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
