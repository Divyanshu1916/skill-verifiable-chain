import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ScoreRing } from "@/components/ScoreRing";
import { Sparkles, FileBadge, Hexagon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/reputation")({
  head: () => ({ meta: [{ title: "Reputation — SkillChain" }] }),
  component: ReputationPage,
});

function ReputationPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ skills: 0, certs: 0, verified: 0, minted: 0, endorsements: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: sk }, { data: cd }] = await Promise.all([
        supabase.from("skills").select("endorsements").eq("user_id", user.id),
        supabase.from("credentials").select("minted,verified").eq("user_id", user.id),
      ]);
      const endorsements = (sk ?? []).reduce((a, s) => a + (s.endorsements ?? 0), 0);
      const verified = (cd ?? []).filter((c) => c.verified).length;
      const minted = (cd ?? []).filter((c) => c.minted).length;
      setStats({ skills: sk?.length ?? 0, certs: cd?.length ?? 0, verified, minted, endorsements });
      await supabase.from("profiles").update({ reputation_score: calcScore({ skills: sk?.length ?? 0, certs: cd?.length ?? 0, verified, minted, endorsements }) }).eq("id", user.id);
    })();
  }, [user?.id]);

  const skillsC = Math.min(30, stats.skills * 4 + stats.endorsements);
  const certsC = Math.min(35, stats.verified * 10 + (stats.certs - stats.verified) * 3);
  const nftC = Math.min(35, stats.minted * 15);
  const score = Math.min(100, skillsC + certsC + nftC);

  return (
    <AppShell title="Reputation">
      <div className="max-w-5xl space-y-6">
        <div className="glass-strong rounded-2xl p-8 grid md:grid-cols-[auto,1fr] gap-8 items-center">
          <ScoreRing value={score} size={180} />
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Composite reputation</div>
            <h2 className="font-display text-3xl font-bold mt-1">A signal recruiters trust</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md">
              Your score combines minted NFTs, verified certificates, and endorsed skills. Higher = more on-chain proof.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Contribution icon={Sparkles} label="Skills" sub={`${stats.skills} skills · ${stats.endorsements} endorsements`} value={skillsC} max={30} to="/skills" />
          <Contribution icon={FileBadge} label="Certificates" sub={`${stats.verified} verified · ${stats.certs} total`} value={certsC} max={35} to="/certificates" />
          <Contribution icon={Hexagon} label="NFT credentials" sub={`${stats.minted} minted`} value={nftC} max={35} to="/nft" />
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> How it's calculated</h3>
          <ul className="text-sm text-muted-foreground mt-3 space-y-1 font-mono">
            <li>Skills: min(30, skills × 4 + endorsements)</li>
            <li>Certificates: min(35, verified × 10 + unverified × 3)</li>
            <li>NFTs: min(35, minted × 15)</li>
            <li className="text-foreground pt-2">Total = min(100, skills + certs + nfts)</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function calcScore(s: { skills: number; certs: number; verified: number; minted: number; endorsements: number }) {
  const a = Math.min(30, s.skills * 4 + s.endorsements);
  const b = Math.min(35, s.verified * 10 + (s.certs - s.verified) * 3);
  const c = Math.min(35, s.minted * 15);
  return Math.min(100, a + b + c);
}

function Contribution({ icon: Icon, label, sub, value, max, to }: { icon: typeof Sparkles; label: string; sub: string; value: number; max: number; to: "/skills" | "/certificates" | "/nft" }) {
  const pct = (value / max) * 100;
  return (
    <Link to={to} className="glass rounded-2xl p-5 hover:border-primary/40 transition group">
      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> <span className="font-display font-semibold">{label}</span></div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      <div className="mt-4 flex items-end justify-between">
        <div className="font-display text-2xl font-bold text-gradient">+{value}</div>
        <div className="text-xs text-muted-foreground">/ {max}</div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
