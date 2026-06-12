import { Hexagon, Triangle, Sparkles } from "lucide-react";

/**
 * Animated, self-contained hero background.
 * All motion is clipped to the parent container via overflow-hidden.
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none" aria-hidden>
      {/* Base gradient (purple / blue / pink) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 20%, oklch(0.42 0.22 295 / 0.95), transparent 60%)," +
            "radial-gradient(110% 80% at 85% 30%, oklch(0.45 0.24 255 / 0.9), transparent 60%)," +
            "radial-gradient(120% 90% at 60% 100%, oklch(0.55 0.24 340 / 0.85), transparent 65%)," +
            "linear-gradient(135deg, oklch(0.16 0.08 285), oklch(0.13 0.06 260))",
        }}
      />

      {/* Soft grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Floating glowing orbs */}
      <div
        className="absolute -top-24 -left-20 h-[420px] w-[420px] rounded-full blur-3xl opacity-60 animate-orb-a"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.25 305 / 0.7), transparent 60%)" }}
      />
      <div
        className="absolute -bottom-32 -right-16 h-[480px] w-[480px] rounded-full blur-3xl opacity-55 animate-orb-b"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.22 255 / 0.7), transparent 60%)" }}
      />
      <div
        className="absolute top-1/3 right-1/3 h-[300px] w-[300px] rounded-full blur-3xl opacity-50 animate-orb-c"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.24 340 / 0.7), transparent 60%)" }}
      />

      {/* Floating geometric shapes */}
      <Hexagon
        className="absolute top-[18%] left-[10%] h-10 w-10 text-white/20 animate-shape-spin"
        strokeWidth={1.2}
        style={{ animationDuration: "24s" }}
      />
      <Triangle
        className="absolute top-[28%] right-[14%] h-8 w-8 text-white/15 animate-shape-spin"
        strokeWidth={1.2}
        style={{ animationDuration: "30s", animationDelay: "-6s" }}
      />
      <Sparkles
        className="absolute bottom-[22%] left-[18%] h-7 w-7 text-white/20 animate-float"
        strokeWidth={1.4}
        style={{ animationDelay: "-2s" }}
      />
      <Hexagon
        className="absolute bottom-[14%] right-[22%] h-6 w-6 text-white/15 animate-float"
        strokeWidth={1.2}
        style={{ animationDelay: "-4s" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-white/70"
            style={{
              left: `${p.x}%`,
              bottom: "-10px",
              width: p.size,
              height: p.size,
              filter: "blur(0.5px)",
              boxShadow: "0 0 8px oklch(0.9 0.15 305 / 0.8)",
              animation: `particle-rise ${p.dur}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Subtle vignette + top sheen for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0 0 0 / 0.05), transparent 30%, oklch(0 0 0 / 0.35))",
        }}
      />

      {/* Inner border glow */}
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-white/10 [box-shadow:inset_0_0_60px_oklch(0.7_0.22_305_/_0.18)]" />
    </div>
  );
}

const PARTICLES = [
  { x: 8, size: 3, dur: 14, delay: 0 },
  { x: 18, size: 2, dur: 18, delay: 3 },
  { x: 28, size: 4, dur: 16, delay: 1 },
  { x: 38, size: 2, dur: 20, delay: 5 },
  { x: 46, size: 3, dur: 15, delay: 2 },
  { x: 55, size: 2, dur: 19, delay: 6 },
  { x: 64, size: 3, dur: 17, delay: 0 },
  { x: 72, size: 4, dur: 14, delay: 4 },
  { x: 81, size: 2, dur: 21, delay: 2 },
  { x: 90, size: 3, dur: 16, delay: 7 },
];
