import { Link, useRouterState, useNavigate, useRouter } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { LayoutDashboard, Sparkles, FileBadge, ShieldCheck, Search, LogOut, User as UserIcon, Hexagon, BarChart3, Wallet, QrCode, TrendingUp, MessageSquare, ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

const studentNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/skills", label: "Skills", icon: Sparkles },
  { to: "/certificates", label: "Certificates", icon: FileBadge },
  { to: "/nft", label: "NFTs", icon: Hexagon },
  { to: "/reputation", label: "Reputation", icon: TrendingUp },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/qr", label: "QR Verify", icon: QrCode },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
  { to: "/feedback", label: "Feedback", icon: MessageSquare },
];
const recruiterNav = [
  { to: "/recruiter", label: "Search", icon: Search },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
  { to: "/qr", label: "QR Verify", icon: QrCode },
  { to: "/feedback", label: "Feedback", icon: MessageSquare },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { role, user, signOut } = useAuth();
  const nav = useNavigate();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = role === "recruiter" ? recruiterNav : studentNav;
  const goBack = () => {
    if (pathname === "/dashboard" || pathname === "/recruiter") {
      nav({ to: "/" });
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else nav({ to: "/" });
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar/60 backdrop-blur-xl">
        <div className="px-5 py-5 border-b border-border/40">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {items.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-primary/15 to-accent/15 text-foreground border border-primary/20 shadow-[inset_0_0_20px_oklch(0.82_0.17_200/0.08)]"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/40 space-y-2">
          <div className="px-2 py-2 text-xs text-muted-foreground truncate">
            <UserIcon className="inline h-3 w-3 mr-1" />
            {user?.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={async () => {
              await signOut();
              nav({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/40 glass flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button size="icon" variant="ghost" onClick={goBack} aria-label="Go back" className="h-9 w-9 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="md:hidden">
              <Logo />
            </div>
            <h1 className="hidden md:block font-display text-xl font-semibold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Sign out"
              className="h-9 w-9 text-muted-foreground"
              onClick={async () => {
                await signOut();
                nav({ to: "/" });
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <WalletButton compact />
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border/40 grid grid-cols-4 px-2 py-2">
          {items.slice(0, 4).map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <it.icon className="h-5 w-5" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
