import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface Props {
  userName: string;
  onContinue: () => void;
  autoNavigateMs?: number;
  variant?: "new" | "returning";
}

const GOLD_COLORS = ["#FFD700", "#FFC107", "#F5A623", "#FFEFB0", "#FFFFFF"];

export function WelcomeCelebration({ userName, onContinue, autoNavigateMs = 5000, variant = "new" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti bursts
  useEffect(() => {
    if (!canvasRef.current) return;
    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const fire = (particleRatio: number, opts: confetti.Options) => {
      myConfetti({
        origin: { x: 0.5, y: 0.55 },
        colors: GOLD_COLORS,
        particleCount: Math.floor(220 * particleRatio),
        ...opts,
      });
    };

    // initial big burst
    fire(0.25, { spread: 26, startVelocity: 55, scalar: 1.2 });
    fire(0.2, { spread: 60, scalar: 1 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.1 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    // streamers
    setTimeout(() => {
      myConfetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: GOLD_COLORS,
        scalar: 1.4,
      });
      myConfetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: GOLD_COLORS,
        scalar: 1.4,
      });
    }, 600);

    // continuous twinkle
    const interval = setInterval(() => {
      myConfetti({
        particleCount: 6,
        startVelocity: 15,
        spread: 360,
        ticks: 120,
        gravity: 0.3,
        decay: 0.94,
        scalar: 0.7,
        origin: { x: Math.random(), y: Math.random() * 0.6 },
        colors: ["#FFD700", "#FFFFFF", "#FFEFB0"],
      });
    }, 350);

    const timer = setTimeout(onContinue, autoNavigateMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      myConfetti.reset();
    };
  }, [autoNavigateMs, onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, #4a1d6e 0%, #2a0f44 40%, #15052a 100%)",
      }}
    >
      {/* Center golden burst glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.55] }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(255,215,0,0.55) 0%, rgba(255,165,50,0.25) 30%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Soft purple side glows */}
      <div
        className="absolute -left-40 top-1/3 h-96 w-96 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, #7c2db8 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="absolute -right-40 bottom-1/4 h-96 w-96 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, #b537c9 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      {/* Twinkling background stars */}
      <BackgroundStars />

      {/* Lens flare shimmer */}
      <motion.div
        animate={{ opacity: [0.2, 0.6, 0.2], rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{
          width: 800,
          height: 6,
          background:
            "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)",
          filter: "blur(2px)",
        }}
      />

      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-xl">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, type: "spring", bounce: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
          style={{
            background: "rgba(255,215,0,0.1)",
            border: "1px solid rgba(255,215,0,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Sparkles className="h-4 w-4" style={{ color: "#FFD700" }} />
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "#FFEFB0" }}>
            {variant === "returning" ? "Welcome back" : "Welcome aboard"}
          </span>
        </motion.div>

        <motion.h1
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.9, type: "spring", bounce: 0.3 }}
          className="font-display text-4xl md:text-6xl font-bold leading-tight"
          style={{
            background: "linear-gradient(135deg, #FFFFFF 0%, #FFD700 50%, #FFA500 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 40px rgba(255,215,0,0.4)",
          }}
        >
          {variant === "returning" ? (
            <>👋 Welcome Back,<br />{userName}!</>
          ) : (
            <>🎉 Welcome to SkillChain,<br />{userName}!</>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          className="mt-6 text-base md:text-lg text-white/80 max-w-md mx-auto"
        >
          Your learning journey starts here. Build skills, earn achievements, and grow with the community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="mt-10"
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="relative h-12 px-8 text-base font-semibold border-0 text-[#2a0f44] hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              boxShadow:
                "0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,165,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            Start Learning
            <ArrowRight className="ml-2 h-5 w-5" />
            <motion.span
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
              }}
            />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function BackgroundStars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
    gold: Math.random() > 0.5,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: s.gold ? "#FFD700" : "#FFFFFF",
            boxShadow: s.gold
              ? "0 0 6px rgba(255,215,0,0.9)"
              : "0 0 6px rgba(255,255,255,0.9)",
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
}
