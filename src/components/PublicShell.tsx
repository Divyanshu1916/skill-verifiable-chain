import { Link, useRouter } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, LogIn, ArrowLeft } from "lucide-react";

export function PublicShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else router.navigate({ to: "/" });
  };
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b border-border/40 glass sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={goBack} aria-label="Go back" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/"><Logo /></Link>
        </div>
        {title && <h1 className="hidden md:block font-display text-lg font-semibold text-muted-foreground">{title}</h1>}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" variant="outline" className="gap-2"><Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link></Button>
          ) : (
            <Button asChild size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"><Link to="/auth"><LogIn className="h-4 w-4" /> Sign in</Link></Button>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
