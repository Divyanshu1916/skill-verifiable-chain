import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Download, Trash2, Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  component: AdminFeedbackPage,
});

const FEATURES = [
  { key: "skill_passport_rating", label: "Skill Passport" },
  { key: "nft_rating", label: "NFT Credentials" },
  { key: "qr_verification_rating", label: "QR Verification" },
  { key: "recruiter_dashboard_rating", label: "Recruiter Dashboard" },
  { key: "wallet_login_rating", label: "Wallet Login" },
  { key: "reputation_score_rating", label: "Reputation Score" },
  { key: "public_profile_rating", label: "Public Profile" },
  { key: "user_experience_rating", label: "Overall UX" },
] as const;

type Feedback = any;

function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [q, setQ] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  async function load() {
    const { data } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
    }
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setItems((x) => x.filter((f) => f.id !== id));
  }

  const stats = useMemo(() => {
    const total = items.length;
    const avg = total ? items.reduce((s, f) => s + (f.overall_rating || 0), 0) / total : 0;
    const dist = [1, 2, 3, 4, 5].map((s) => ({ star: `${s}★`, count: items.filter((f) => f.overall_rating === s).length }));
    const featureAvg = FEATURES.map((f) => {
      const vals = items.map((x) => x[f.key]).filter((v) => typeof v === "number");
      return { label: f.label, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, count: vals.length };
    });
    const reactionTally: Record<string, number> = {};
    items.forEach((f) => (f.reactions || []).forEach((r: string) => { reactionTally[r] = (reactionTally[r] || 0) + 1; }));
    const reactions = Object.entries(reactionTally).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

    // Timeline by day
    const byDay: Record<string, { date: string; count: number; avg: number; sum: number }> = {};
    items.forEach((f) => {
      const d = new Date(f.created_at).toISOString().slice(0, 10);
      byDay[d] ||= { date: d, count: 0, avg: 0, sum: 0 };
      byDay[d].count++;
      byDay[d].sum += f.overall_rating;
    });
    const timeline = Object.values(byDay).map((d) => ({ ...d, avg: d.sum / d.count })).sort((a, b) => a.date.localeCompare(b.date));

    const suggestions = items.map((f) => f.suggestions).filter(Boolean);
    return { total, avg, dist, featureAvg, reactions, timeline, suggestions };
  }, [items]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter((f) => [f.name, f.email, f.liked_most, f.improvements, f.suggestions, f.comments].filter(Boolean).some((t) => String(t).toLowerCase().includes(s)));
  }, [items, q]);

  function exportCsv() {
    const headers = ["created_at", "overall", "name", "email", ...FEATURES.map((f) => f.key), "liked", "useful", "improvements", "suggestions", "comments", "reactions"];
    const rows = items.map((f) => [
      f.created_at, f.overall_rating, f.name ?? "", f.email ?? "",
      ...FEATURES.map((x) => f[x.key] ?? ""),
      f.liked_most ?? "", f.most_useful_feature ?? "", f.improvements ?? "", f.suggestions ?? "", f.comments ?? "",
      (f.reactions || []).join("|"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[headers.join(",")].concat(rows).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `feedback-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="Feedback Analytics">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">Feedback Dashboard</h2>
            <p className="text-sm text-muted-foreground">Live ratings, suggestions, and reactions from users</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/feedback">Public form</Link></Button>
            <Button size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Total reviews" value={stats.total.toString()} />
          <StatCard icon={Star} label="Avg rating" value={stats.avg.toFixed(2)} />
          <StatCard icon={TrendingUp} label="Top reaction" value={stats.reactions[0]?.label ?? "—"} />
          <StatCard icon={MessageSquare} label="Suggestions" value={stats.suggestions.length.toString()} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-strong rounded-2xl p-5">
            <div className="font-medium mb-3">Rating distribution</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dist}>
                  <XAxis dataKey="star" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="oklch(0.78 0.17 200)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="font-medium mb-3">Submissions over time</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="count" stroke="oklch(0.78 0.17 200)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="avg" stroke="oklch(0.78 0.17 280)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-strong rounded-2xl p-5">
            <div className="font-medium mb-3">Average feature scores</div>
            <div className="space-y-2">
              {stats.featureAvg.map((f) => (
                <div key={f.label} className="flex items-center gap-3 text-sm">
                  <div className="w-44 truncate text-muted-foreground">{f.label}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(f.avg / 5) * 100}%` }} />
                  </div>
                  <div className="w-16 text-right tabular-nums">{f.avg ? f.avg.toFixed(2) : "—"}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-strong rounded-2xl p-5">
            <div className="font-medium mb-3">Top reactions</div>
            <div className="flex flex-wrap gap-2">
              {stats.reactions.length === 0 && <div className="text-sm text-muted-foreground">No reactions yet</div>}
              {stats.reactions.map((r) => (
                <span key={r.label} className="px-3 py-1.5 rounded-full glass text-sm">
                  {r.label} <span className="text-muted-foreground ml-1">×{r.count}</span>
                </span>
              ))}
            </div>
            <div className="font-medium mt-6 mb-2">Recent suggestions</div>
            <div className="space-y-2 max-h-48 overflow-auto pr-1">
              {stats.suggestions.length === 0 && <div className="text-sm text-muted-foreground">No suggestions yet</div>}
              {stats.suggestions.slice(0, 10).map((s, i) => (
                <div key={i} className="glass rounded-lg p-2 text-sm text-muted-foreground">{s}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or content..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-auto pr-1">
            {filtered.length === 0 && <div className="text-sm text-muted-foreground">No matching feedback</div>}
            {filtered.map((f) => (
              <div key={f.id} className="glass rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{f.name || "Anonymous"}</span>
                      {f.email && <span className="text-xs text-muted-foreground truncate">· {f.email}</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < f.overall_rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-2">{new Date(f.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button size="icon" variant="ghost" onClick={() => remove(f.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {(f.liked_most || f.improvements || f.suggestions || f.comments) && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
                    {f.liked_most && <Field label="Liked" value={f.liked_most} />}
                    {f.most_useful_feature && <Field label="Most useful" value={f.most_useful_feature} />}
                    {f.improvements && <Field label="Improve" value={f.improvements} />}
                    {f.suggestions && <Field label="Suggestions" value={f.suggestions} />}
                    {f.comments && <Field label="Comments" value={f.comments} />}
                  </div>
                )}
                {f.reactions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {f.reactions.map((r: string) => <span key={r} className="text-[10px] px-2 py-0.5 rounded-full glass">{r}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass-strong rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-foreground/90">{value}</div>
    </div>
  );
}
