import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Home, LayoutDashboard, Star, User as UserIcon, Settings, LogOut, Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { shortAddress } from "@/lib/web3";

type ProfileLite = {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  reputation_score: number | null;
};

const initials = (name?: string | null, email?: string | null) => {
  const base = (name || email || "U").trim();
  const parts = base.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || "U") + (parts[1]?.[0] || "")).toUpperCase();
};

export function UserMenu() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, username, avatar_url, wallet_address, reputation_score")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as ProfileLite | null));
  }, [user?.id, open]);

  if (!user) return null;

  const items = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { to: "/feedback" as const, label: "Rate Us", icon: Star },
  ];

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    nav({ to: "/" });
  };

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || (user.user_metadata?.avatar_url as string | undefined);
  const username = profile?.username;
  const wallet = profile?.wallet_address;
  const rep = profile?.reputation_score ?? 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Open menu" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] sm:w-[380px] p-0 glass-strong border-l border-border/60 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="font-display text-base tracking-wide text-muted-foreground">Menu</SheetTitle>
        </SheetHeader>

        <nav className="px-3 py-2 space-y-1">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-primary/15 to-accent/15 text-foreground border border-primary/20"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border/40 p-4 space-y-4 bg-card/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/30">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                {initials(displayName, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1.5 border-border/60">
              <Wallet className="h-3 w-3" />
              {wallet ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="font-mono text-[10px]">{shortAddress(wallet)}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Not connected</span>
              )}
            </Badge>
            <Badge className="gap-1.5 bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border border-primary/30">
              <TrendingUp className="h-3 w-3" />
              Rep {rep}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {username && (
              <Link
                to="/passport/$username"
                params={{ username }}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition"
              >
                <UserIcon className="h-4 w-4" /> View Profile
              </Link>
            )}
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition"
            >
              <Settings className="h-4 w-4" /> Account Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition text-left"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
