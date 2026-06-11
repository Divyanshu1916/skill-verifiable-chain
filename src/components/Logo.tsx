import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shadow-[0_0_20px_oklch(0.82_0.17_200/0.5)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L3 7v6c0 5 4 9 9 10 5-1 9-5 9-10V7l-9-5z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Skill<span className="text-gradient">Chain</span>
      </span>
    </Link>
  );
}
