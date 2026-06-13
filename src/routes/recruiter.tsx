import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/PublicShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Hexagon, BadgeCheck, Download, History, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/recruiter")({
  head: () => ({ meta: [
    { title: "Recruiter Verification Portal — SkillChain" },
    { name: "description", content: "Search and verify on-chain professional credentials. No account required." },
  ] }),
  component: Recruiter,
});

type Profile = { id: string; full_name: string | null; username: string | null; headline: string | null; reputation_score: number; location: string | null };
type HistoryItem = { username: string; name: string; at: string; score: number };

const HKEY = "skillchain.verify.history";
const loadHistory = (): HistoryItem[] => {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HKEY) || "[]"); } catch { return []; }
};

function Recruiter() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Profile[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => { setHistory(loadHistory()); }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      const query = supabase.from("profiles").select("id,full_name,username,headline,reputation_score,location").order("reputation_score", { ascending: false }).limit(24);
      if (q.trim()) query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,headline.ilike.%${q}%`);
      const { data } = await query;
      setList((data as Profile[]) ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const verify = (p: Profile) => {
    if (!p.username) return;
    const item: HistoryItem = { username: p.username, name: p.full_name || p.username, at: new Date().toISOString(), score: p.reputation_score };
    const next = [item, ...history.filter((h) => h.username !== p.username)].slice(0, 20);
    setHistory(next); localStorage.setItem(HKEY, JSON.stringify(next));
    toast.success("Verification logged", { description: p.full_name || p.username });
  };

  const report = async (p: Profile) => {
    const { default: jsPDF } = await import("jspdf");
    const [{ data: skills }, { data: creds }] = await Promise.all([
      supabase.from("skills").select("*").eq("user_id", p.id),
      supabase.from("credentials").select("*").eq("user_id", p.id),
    ]);
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("SkillChain Verification Report", 20, 22);
    doc.setFontSize(11); doc.setTextColor(120); doc.text(`Generated ${new Date().toLocaleString()}`, 20, 30);
    doc.setTextColor(0); doc.setFontSize(14); doc.text(p.full_name || p.username || "—", 20, 45);
    doc.setFontSize(10); doc.text(`@${p.username} · Reputation ${p.reputation_score}/100`, 20, 52);
    if (p.headline) doc.text(p.headline, 20, 59);
    doc.setFontSize(12); doc.text("Skills", 20, 72);
    doc.setFontSize(10); (skills ?? []).slice(0, 25).forEach((s: any, i: number) => doc.text(`• ${s.name} — Lvl ${s.level}/5`, 22, 80 + i * 5));
    let y = 80 + Math.min(25, (skills ?? []).length) * 5 + 8;
    doc.setFontSize(12); doc.text("Credentials", 20, y); y += 7; doc.setFontSize(9);
    (creds ?? []).forEach((c: any) => {
      doc.text(`• ${c.title} — ${c.issuer} ${c.verified ? "[VERIFIED]" : ""}${c.minted ? " [NFT]" : ""}`, 22, y); y += 5;
      if (c.tx_hash) { doc.setTextColor(120); doc.text(`  ${c.tx_hash.slice(0, 60)}`, 22, y); doc.setTextColor(0); y += 5; }
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.setFontSize(8); doc.setTextColor(150); doc.text("Signed by SkillChain · on-chain verified · Polygon", 20, 292);
    doc.save(`${p.username}-report.pdf`);
    verify(p);
  };

  return (
    <PublicShell title="Recruiter portal">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr,320px] gap-6">
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3 w-3 text-success" /> Public verification · no account required</div>
            <h2 className="font-display text-2xl font-bold mt-2">Find verified talent</h2>
            <p className="text-sm text-muted-foreground mt-1">Every candidate's credentials are anchored on-chain. Search, view passports, and download signed reports.</p>
            <div className="relative mt-5">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, username, role…" className="pl-9 h-11" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {list.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-5 hover:border-primary/40 transition group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold truncate">{p.full_name || p.username}</div>
                    <div className="text-xs text-muted-foreground truncate">@{p.username}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase text-muted-foreground">Score</div>
                    <div className="font-display text-xl font-bold text-gradient">{p.reputation_score}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-3 line-clamp-2">{p.headline || "No headline yet"}</div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-success/10 text-success border border-success/30 inline-flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Verified</span>
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent border border-accent/30 inline-flex items-center gap-1"><Hexagon className="h-3 w-3" /> On-chain</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.username && <Button asChild size="sm" variant="outline" className="gap-1 flex-1"><Link to="/passport/$username" params={{ username: p.username }} onClick={() => verify(p)}><ExternalLink className="h-3 w-3" /> Profile</Link></Button>}
                  <Button size="sm" className="gap-1 flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={() => report(p)}><Download className="h-3 w-3" /> Report</Button>
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="glass rounded-2xl p-12 text-center md:col-span-2 text-muted-foreground">No profiles match that search yet.</div>}
          </div>
        </div>

        <aside className="glass rounded-2xl p-5 h-fit lg:sticky lg:top-24">
          <h3 className="font-display font-semibold flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Verification history</h3>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-3">Candidates you verify will appear here.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.map((h, i) => (
                <li key={i} className="text-xs flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
                  <Link to="/passport/$username" params={{ username: h.username }} className="min-w-0 hover:text-primary">
                    <div className="font-medium truncate">{h.name}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(h.at).toLocaleDateString()} · score {h.score}</div>
                  </Link>
                  <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </PublicShell>
  );
}
