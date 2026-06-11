import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Hexagon, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recruiter")({
  head: () => ({ meta: [{ title: "Recruiter — SkillChain" }] }),
  component: Recruiter,
});

type Profile = {
  id: string; full_name: string | null; username: string | null;
  headline: string | null; reputation_score: number; location: string | null;
};

function Recruiter() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Profile[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const query = supabase.from("profiles").select("id,full_name,username,headline,reputation_score,location").order("reputation_score", { ascending: false }).limit(24);
      if (q.trim()) query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,headline.ilike.%${q}%`);
      const { data } = await query;
      setList((data as Profile[]) ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <AppShell title="Recruiter search">
      <div className="max-w-6xl space-y-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-2xl font-bold">Find verified talent</h2>
          <p className="text-sm text-muted-foreground mt-1">Every candidate's credentials are on-chain. Search and verify in one click.</p>
          <div className="relative mt-5">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, username, skill, role…" className="pl-9 h-11" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <Link key={p.id} to="/passport/$username" params={{ username: p.username ?? "" }} className="glass rounded-2xl p-5 hover:border-primary/40 transition group">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold truncate">{p.full_name || p.username}</div>
                  <div className="text-xs text-muted-foreground truncate">@{p.username}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-muted-foreground">Score</div>
                  <div className="font-display text-xl font-bold text-gradient">{p.reputation_score}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-3 line-clamp-2">{p.headline || "No headline yet"}</div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-success/10 text-success border border-success/30 inline-flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Verified</span>
                <span className="px-2 py-1 rounded bg-accent/10 text-accent border border-accent/30 inline-flex items-center gap-1"><Hexagon className="h-3 w-3" /> On-chain</span>
                <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center md:col-span-2 lg:col-span-3 text-muted-foreground">
              No profiles match that search yet.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
