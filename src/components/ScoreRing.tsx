export function ScoreRing({ value, size = 140, label = "Reputation" }: { value: number; size?: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.84 0.16 195)" />
            <stop offset="100%" stopColor="oklch(0.66 0.23 305)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.25 0.04 270)" strokeWidth={10} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ring)" strokeWidth={10} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold text-gradient">{v}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
