import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star, Send, Sparkles, ShieldCheck, Hexagon, QrCode, Wallet, TrendingUp, User, MessageSquare, Search, Download, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { GradientOrb } from "@/components/GradientOrb";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — SkillChain" },
      { name: "description", content: "Rate SkillChain and help shape the future of verifiable Web3 credentials." },
    ],
  }),
  component: FeedbackPage,
});

type Feedback = {
  id: string;
  name: string | null;
  email: string | null;
  overall_rating: number;
  skill_passport_rating: number | null;
  nft_rating: number | null;
  qr_verification_rating: number | null;
  recruiter_dashboard_rating: number | null;
  wallet_login_rating: number | null;
  reputation_score_rating: number | null;
  public_profile_rating: number | null;
  user_experience_rating: number | null;
  liked_most: string | null;
  most_useful_feature: string | null;
  improvements: string | null;
  suggestions: string | null;
  comments: string | null;
  reactions: string[];
  created_at: string;
};

const FEATURES = [
  { key: "skill_passport_rating", label: "Skill Passport", icon: ShieldCheck },
  { key: "nft_rating", label: "NFT Credentials", icon: Hexagon },
  { key: "qr_verification_rating", label: "QR Verification", icon: QrCode },
  { key: "recruiter_dashboard_rating", label: "Recruiter Dashboard", icon: Search },
  { key: "wallet_login_rating", label: "Wallet Login", icon: Wallet },
  { key: "reputation_score_rating", label: "Reputation Score", icon: TrendingUp },
  { key: "public_profile_rating", label: "Public Profile", icon: User },
  { key: "user_experience_rating", label: "Overall User Experience", icon: Sparkles },
] as const;

const REACTIONS = [
  { emoji: "🚀", label: "Innovative" },
  { emoji: "🔗", label: "Blockchain Powered" },
  { emoji: "🏆", label: "Hiring Ready" },
  { emoji: "⭐", label: "Easy to Use" },
  { emoji: "💼", label: "Recruiter Friendly" },
  { emoji: "🎓", label: "Student Friendly" },
];

function StarRow({ value, onChange, size = 24 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={active ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}
            />
          </button>
        );
      })}
    </div>
  );
}

function FeedbackPage() {
  const [overall, setOverall] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reactions, setReactions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [liked, setLiked] = useState("");
  const [useful, setUseful] = useState("");
  const [improvements, setImprovements] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [list, setList] = useState<Feedback[]>([]);
  const [query, setQuery] = useState("");

  async function load() {
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setList(data as Feedback[]);
  }
  useEffect(() => { load(); }, []);

  function toggleReaction(label: string) {
    setReactions((r) => (r.includes(label) ? r.filter((x) => x !== label) : [...r, label]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!overall) { toast.error("Please give an overall rating"); return; }
    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = {
      user_id: u.user?.id ?? null,
      name: name || null,
      email: email || null,
      overall_rating: overall,
      ...Object.fromEntries(FEATURES.map((f) => [f.key, ratings[f.key] ?? null])),
      liked_most: liked || null,
      most_useful_feature: useful || null,
      improvements: improvements || null,
      suggestions: suggestions || null,
      comments: comments || null,
      reactions,
    };
    const { error } = await supabase.from("feedback").insert(payload);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks for the feedback! 🎉");
    setOverall(0); setRatings({}); setReactions([]);
    setName(""); setEmail(""); setLiked(""); setUseful("");
    setImprovements(""); setSuggestions(""); setComments("");
    load();
  }

  const stats = useMemo(() => {
    if (!list.length) return null;
    const avg = list.reduce((s, f) => s + f.overall_rating, 0) / list.length;
    const dist = [1, 2, 3, 4, 5].map((star) => ({
      star: `${star}★`,
      count: list.filter((f) => f.overall_rating === star).length,
    }));
    const featureAvg = FEATURES.map((f) => {
      const vals = list.map((x) => x[f.key as keyof Feedback] as number | null).filter((v): v is number => !!v);
      const a = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
      return { label: f.label, key: f.key, avg: a, count: vals.length };
    });
    const highest = [...featureAvg].sort((a, b) => b.avg - a.avg)[0];
    const reactionTally: Record<string, number> = {};
    list.forEach((f) => f.reactions?.forEach((r) => { reactionTally[r] = (reactionTally[r] || 0) + 1; }));
    const mostLoved = Object.entries(reactionTally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { avg, dist, featureAvg, highest, mostLoved };
  }, [list]);

  const filtered = useMemo(() => {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((f) =>
      [f.name, f.email, f.liked_most, f.improvements, f.suggestions, f.comments]
        .filter(Boolean).some((t) => t!.toLowerCase().includes(q)));
  }, [list, query]);

  function exportCsv() {
    const headers = ["created_at","overall","name","email","liked","improvements","suggestions","comments","reactions"];
    const rows = list.map((f) => [
      f.created_at, f.overall_rating, f.name ?? "", f.email ?? "",
      f.liked_most ?? "", f.improvements ?? "", f.suggestions ?? "", f.comments ?? "",
      (f.reactions || []).join("|"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `skillchain-feedback-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientOrb className="top-[-200px] left-1/2 -translate-x-1/2 h-[500px] w-[900px]" />
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/">Home</Link></Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Link to="/dashboard">Open App</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-6">
          <MessageSquare className="h-3.5 w-3.5" /> We read every response
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
          Help shape <span className="text-gradient">SkillChain</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Rate the experience, react with your vibe, and tell us what to build next.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* Form */}
        <form onSubmit={submit} className="glass-strong rounded-2xl p-6 md:p-8 space-y-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Overall Rating *</div>
            <StarRow value={overall} onChange={setOverall} size={32} />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Feature Ratings</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div key={f.key} className="glass rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <f.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{f.label}</span>
                  </div>
                  <StarRow value={ratings[f.key] ?? 0} onChange={(v) => setRatings((r) => ({ ...r, [f.key]: v }))} size={18} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Quick Reactions</div>
            <div className="flex flex-wrap gap-2">
              {REACTIONS.map((r) => {
                const active = reactions.includes(r.label);
                return (
                  <button
                    type="button"
                    key={r.label}
                    onClick={() => toggleReaction(r.label)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      active
                        ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50 text-foreground"
                        : "glass border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className="mr-1">{r.emoji}</span>{r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Textarea placeholder="What did you like most about SkillChain?" value={liked} onChange={(e) => setLiked(e.target.value)} />
            <Textarea placeholder="Which feature was most useful?" value={useful} onChange={(e) => setUseful(e.target.value)} />
            <Textarea placeholder="What can be improved?" value={improvements} onChange={(e) => setImprovements(e.target.value)} />
            <Textarea placeholder="Suggestions for future features" value={suggestions} onChange={(e) => setSuggestions(e.target.value)} />
          </div>
          <Textarea placeholder="Additional comments" value={comments} onChange={(e) => setComments(e.target.value)} />

          <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>

        {/* Analytics sidebar */}
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Average rating</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-gradient">{stats?.avg.toFixed(1) ?? "—"}</span>
              <span className="text-muted-foreground">/ 5</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{list.length} review{list.length === 1 ? "" : "s"}</div>
            <div className="mt-4 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dist ?? []}>
                  <XAxis dataKey="star" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {(stats?.dist ?? []).map((_, i) => (
                      <Cell key={i} fill={`oklch(0.78 0.17 ${180 + i * 12})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Most loved</div>
              <div className="mt-1 font-medium text-sm">{stats?.mostLoved ?? "—"}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Highest rated</div>
              <div className="mt-1 font-medium text-sm">{stats?.highest?.label ?? "—"} {stats?.highest ? `· ${stats.highest.avg.toFixed(1)}★` : ""}</div>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Feature scores</div>
            </div>
            <div className="space-y-2">
              {(stats?.featureAvg ?? FEATURES.map((f) => ({ label: f.label, avg: 0, count: 0 }))).map((f) => (
                <div key={f.label} className="flex items-center gap-3 text-sm">
                  <div className="w-40 truncate text-muted-foreground">{f.label}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(f.avg / 5) * 100}%` }} />
                  </div>
                  <div className="w-10 text-right tabular-nums">{f.avg ? f.avg.toFixed(1) : "—"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Input placeholder="Search reviews..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button type="button" variant="outline" size="icon" onClick={exportCsv} aria-label="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 max-h-80 overflow-auto pr-1">
              {filtered.length === 0 && <div className="text-sm text-muted-foreground">No reviews yet — be the first ✨</div>}
              {filtered.slice(0, 20).map((f) => (
                <div key={f.id} className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{f.name || "Anonymous"}</div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < f.overall_rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                      ))}
                    </div>
                  </div>
                  {(f.liked_most || f.comments) && (
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.liked_most || f.comments}</div>
                  )}
                  {f.reactions?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.reactions.map((r) => <span key={r} className="text-[10px] px-2 py-0.5 rounded-full glass">{r}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Link to="/admin/feedback" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Open admin analytics <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
