"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  isLand: boolean;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });
  const rotationRef = useRef({ y: 0, targetY: 0, x: 0.3, targetX: 0.3 }); // Tilt and rotation state

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Handle resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = Math.min(parent.clientWidth, 550);
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Pre-generate 3D globe points (Fibonacci Sphere algorithm)
    const points: Point3D[] = [];
    const numPoints = 900;
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = 0.505 * i * Math.PI; // golden angle increment

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      // Simulated organic landmass contours
      const landNoise =
        Math.sin(x * 3.5) * Math.cos(y * 3.5) +
        Math.sin(z * 4.5) * Math.sin(x * 2.5) +
        Math.cos(y * 5) * Math.cos(z * 3);
      const isLand = landNoise > -0.2;

      points.push({ x, y, z, isLand });
    }

    // Orbit paths setup (e.g. leaf, cloud, recycle, tree)
    const satellites = [
      { char: "🌿", orbitRadius: 1.5, angle: 0, speed: 0.015, tilt: 0.4 },
      { char: "☁️", orbitRadius: 1.6, angle: Math.PI * 0.5, speed: -0.01, tilt: -0.25 },
      { char: "♻️", orbitRadius: 1.4, angle: Math.PI, speed: 0.012, tilt: 0.5 },
      { char: "🌳", orbitRadius: 1.7, angle: Math.PI * 1.5, speed: -0.008, tilt: -0.35 },
    ];

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const globeRadius = Math.min(width, height) * 0.32;

      // Inertial mouse rotation logic
      if (mouseRef.current.isHovering) {
        rotationRef.current.targetY = mouseRef.current.x * 1.5;
        rotationRef.current.targetX = mouseRef.current.y * 1.2 + 0.3; // Base axial tilt of ~17 degrees (0.3 rad)
      } else {
        // Auto rotate when mouse is away
        rotationRef.current.targetY += 0.003;
      }

      // Smooth damp rotation transitions
      rotationRef.current.y += (rotationRef.current.targetY - rotationRef.current.y) * 0.08;
      rotationRef.current.x += (rotationRef.current.targetX - rotationRef.current.x) * 0.08;

      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      // 1. Draw subtle 3D background atmosphere ring
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        globeRadius * 0.9,
        centerX,
        centerY,
        globeRadius * 1.3
      );
      glowGrad.addColorStop(0, "rgba(209, 250, 229, 0.3)");
      glowGrad.addColorStop(1, "rgba(209, 250, 229, 0)");
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // 2. Project & Draw Globe Points
      const projectedPoints = points.map((p) => {
        // Rotate around Y-axis (spin)
        const rx1 = p.x * cosY - p.z * sinY;
        const rz1 = p.x * sinY + p.z * cosY;

        // Rotate around X-axis (tilt)
        const ry = p.y * cosX - rz1 * sinX;
        const rz = p.y * sinX + rz1 * cosX;

        return {
          sx: centerX + rx1 * globeRadius,
          sy: centerY + ry * globeRadius,
          sz: rz, // depth metric
          isLand: p.isLand,
        };
      });

      // Sort points back-to-front for correct transparency overlays (painter's algorithm)
      projectedPoints.sort((a, b) => a.sz - b.sz);

      projectedPoints.forEach((p) => {
        const sx = p.sx;
        const sy = p.sy;
        const rz = p.sz;

        // Render dot characteristics based on depth (rz goes from 1.0 at front to -1.0 at back)
        const alpha = rz > 0 ? 0.35 + rz * 0.45 : 0.12;
        const size = rz > 0 ? (p.isLand ? 3.8 : 1.8) : (p.isLand ? 1.8 : 1.0);
        
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);

        if (p.isLand) {
          ctx.fillStyle = `rgba(5, 150, 105, ${alpha})`; // Vibrant Emerald for land
        } else {
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.3})`; // Subtle translucent green for oceans
        }
        ctx.fill();
      });

      // 3. Project & Draw Revolving Satellite Satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed;

        // Calculate raw 3D position
        let sx = Math.cos(sat.angle) * sat.orbitRadius;
        let sz = Math.sin(sat.angle) * sat.orbitRadius;
        let sy = 0;

        // Apply orbit tilt
        const cosTilt = Math.cos(sat.tilt);
        const sinTilt = Math.sin(sat.tilt);
        const tmpY = sy * cosTilt - sz * sinTilt;
        const tmpZ = sy * sinTilt + sz * cosTilt;
        sy = tmpY;
        sz = tmpZ;

        // Apply standard Y-rotation (spin alignment)
        const rxRot = sx * cosY - sz * sinY;
        const rzRot = sx * sinY + sz * cosY;

        // Apply axial X-rotation (tilt alignment)
        const ryFinal = sy * cosX - rzRot * sinX;
        const rzFinal = sy * sinX + rzRot * cosX;

        const screenX = centerX + rxRot * globeRadius;
        const screenY = centerY + ryFinal * globeRadius;

        // Depth buffer check: if satellite is behind the globe, draw at lower opacity
        const isBehind = rzFinal < -0.2;
        ctx.font = isBehind ? "13px Arial" : "24px Arial";
        ctx.globalAlpha = isBehind ? 0.3 : 1.0;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sat.char, screenX, screenY);
      });
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(draw);
    };
    draw();

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cxVal = rect.width / 2;
      const cyVal = rect.height / 2;
      const rawX = e.clientX - rect.left - cxVal;
      const rawY = e.clientY - rect.top - cyVal;
      mouseRef.current.x = rawX / cxVal;
      mouseRef.current.y = rawY / cyVal;
    };

    const handleMouseEnter = () => {
      mouseRef.current.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-transparent flex items-center pt-24 pb-16 md:py-0">

      {/* Radial soft mask to add depth without hiding the body grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,rgba(255,255,255,0.15)_95%)] pointer-events-none" />

      {/* Premium ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,#d1fae5,transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_80%,#ecfdf5,transparent)] pointer-events-none" />

      {/* Floating decorative blobs */}
      <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-emerald-50/70 blur-2xl pointer-events-none animate-pulse duration-[8s]" />

      {/* Two-Column Responsive Grid */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Core pitch messages */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col justify-center text-left"
        >
          {/* Eyebrow tag */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="self-start mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm"
          >
            🌿 Zero-friction carbon intelligence
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-display text-5xl font-bold leading-[1.15] text-gray-900 md:text-7xl tracking-tight"
          >
            Track less.
            <br />
            <span className="text-[#059669]">Live greener.</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-6 max-w-xl text-lg text-gray-600 md:text-xl leading-relaxed font-sans"
          >
            Verda turns your daily habits into a carbon footprint — with just your voice. 
            No sheets. No complex calculation forms. Just instant, personalized results.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <button
              onClick={() => signIn()}
              className="rounded-full bg-[#059669] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#047857] hover:shadow-xl cursor-pointer"
            >
              Start for Free
            </button>
            <a
              href="#how-it-works"
              className="rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300 flex items-center justify-center cursor-pointer"
            >
              See How It Works
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column: Globe Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="lg:col-span-5 flex justify-center items-center relative"
        >
          {/* Glassmorphic card frame container for globe */}
          <div className="relative rounded-3xl p-6 bg-white/30 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden w-full max-w-[480px]">
            {/* Soft inner glow behind canvas */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(209,250,229,0.2),transparent)] pointer-events-none" />
            <canvas ref={canvasRef} className="block mx-auto max-w-full cursor-grab active:cursor-grabbing" />
          </div>
        </motion.div>
      </div>

      {/* Scroll hint icon at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-300 pointer-events-none hidden lg:flex">
        <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400">Scroll</span>
        <div className="h-8 w-px bg-gray-200 animate-pulse" />
      </div>
    </section>
  );
}
