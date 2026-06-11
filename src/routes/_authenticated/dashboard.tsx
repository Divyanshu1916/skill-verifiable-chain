import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, FileBadge, ShieldCheck, Hexagon, ArrowRight, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SkillChain" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [skills, setSkills] = useState(0);
  const [creds, setCreds] = useState<{ total: number; minted: number; verified: number }>({ total: 0, minted: 0, verified: 0 });
  const [profile, setProfile] = useState<{ full_name: string | null; username: string | null; reputation_score: number } | null>(null);
  const [recent, setRecent] = useState<{ id: string; title: string; issuer: string; tx_hash: string | null; minted: boolean }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: sc }, { data: cd }, { data: pf }] = await Promise.all([
        supabase.from("skills").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("credentials").select("id,title,issuer,tx_hash,minted,verified").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("full_name,username,reputation_score").eq("id", user.id).maybeSingle(),
      ]);
      setSkills(sc ?? 0);
      const list = cd ?? [];
      setCreds({ total: list.length, minted: list.filter((c) => c.minted).length, verified: list.filter((c) => c.verified).length });
      setRecent(list.slice(0, 5));
      setProfile(pf);
    })();
  }, [user?.id]);

  const reputation = Math.min(100, (creds.minted * 15) + (creds.verified * 10) + (skills * 4));
  const passportUrl = profile?.username ? `${typeof window !== "undefined" ? window.location.origin : ""}/passport/${profile.username}` : "";

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6 max-w-6xl">
        {/* Greeting */}
        <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</div>
              <h2 className="font-display text-3xl font-bold mt-1">{profile?.full_name || "Student"}</h2>
              <p className="text-muted-foreground mt-1 text-sm">Your skill passport is live. Keep shipping credentials.</p>
            </div>
            {profile?.username && (
              <div className="flex gap-2">
                <Button asChild variant="outline" className="gap-2"><Link to="/passport/$username" params={{ username: profile.username }}><ExternalLink className="h-4 w-4" /> View passport</Link></Button>
                <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(passportUrl); toast.success("Link copied"); }}><Copy className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Sparkles} label="Skills" value={skills} to="/skills" />
          <Stat icon={FileBadge} label="Credentials" value={creds.total} to="/certificates" />
          <Stat icon={Hexagon} label="Minted NFTs" value={creds.minted} accent />
          <Stat icon={ShieldCheck} label="Verified" value={creds.verified} accent />
        </div>

        {/* Reputation */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Reputation score</div>
              <div className="font-display text-3xl font-bold text-gradient mt-1">{reputation}<span className="text-muted-foreground text-lg">/100</span></div>
            </div>
            <div className="text-xs text-muted-foreground text-right max-w-xs">
              Built from minted NFTs, verified credentials, and added skills.
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${reputation}%` }} />
          </div>
        </div>

        {/* Recent credentials */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Recent credentials</h3>
            <Button asChild size="sm" variant="ghost" className="gap-1"><Link to="/certificates">View all <ArrowRight className="h-3 w-3" /></Link></Button>
          </div>
          {recent.length === 0 ? (
            <EmptyHint />
          ) : (
            <ul className="space-y-2">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.issuer}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.minted && <span className="text-[10px] font-mono px-2 py-1 rounded bg-accent/10 text-accent border border-accent/30">NFT</span>}
                    {c.verified && <span className="text-[10px] font-mono px-2 py-1 rounded bg-success/10 text-success border border-success/30">VERIFIED</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, to, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; to?: string; accent?: boolean }) {
  const inner = (
    <div className={`glass rounded-xl p-5 transition hover:border-primary/40 ${to ? "cursor-pointer" : ""}`}>
      <Icon className={`h-5 w-5 ${accent ? "text-accent" : "text-primary"}`} />
      <div className="font-display text-3xl font-bold mt-3">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function EmptyHint() {
  return (
    <div className="text-center py-10 border border-dashed border-border rounded-xl">
      <FileBadge className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">No credentials yet. Upload your first certificate.</p>
      <Button asChild size="sm" className="mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground"><Link to="/certificates">Upload certificate</Link></Button>
    </div>
  );
}
