export function GradientOrb({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <div className="aurora h-full w-full rounded-full animate-spin-slow" />
    </div>
  );
}
