import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Sparkles, FileBadge, Hexagon, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — SkillChain" }] }),
  component: Analytics,
});

type Activity = { id: string; title: string; created_at: string; minted: boolean; verified: boolean };

function Analytics() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<{ name: string; category: string | null; level: number }[]>([]);
  const [creds, setCreds] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("skills").select("name,category,level").eq("user_id", user.id),
      supabase.from("credentials").select("id,title,created_at,minted,verified").eq("user_id", user.id).order("created_at"),
    ]).then(([{ data: s }, { data: c }]) => { setSkills((s as any) ?? []); setCreds((c as any) ?? []); });
  }, [user?.id]);

  const byCategory = Object.entries(skills.reduce<Record<string, number>>((a, s) => { const k = s.category || "Other"; a[k] = (a[k] || 0) + 1; return a; }, {})).map(([name, value]) => ({ name, value }));
  const credTimeline = (() => {
    const map: Record<string, number> = {};
    creds.forEach((c) => { const k = c.created_at.slice(0, 7); map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  })();
  const credBreakdown = [
    { name: "Minted", value: creds.filter((c) => c.minted).length },
    { name: "Verified", value: creds.filter((c) => c.verified && !c.minted).length },
    { name: "Pending", value: creds.filter((c) => !c.verified).length },
  ];
  const colors = ["oklch(0.84 0.16 195)", "oklch(0.66 0.23 305)", "oklch(0.76 0.18 155)", "oklch(0.8 0.16 80)", "oklch(0.66 0.24 22)"];

  return (
    <AppShell title="Analytics">
      <div className="max-w-7xl space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <Tile icon={Sparkles} label="Total skills" value={skills.length} />
          <Tile icon={FileBadge} label="Credentials" value={creds.length} />
          <Tile icon={Hexagon} label="NFTs minted" value={creds.filter((c) => c.minted).length} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Skills by category">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 270 / 0.3)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 260)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "oklch(0.17 0.035 270)", border: "1px solid oklch(0.3 0.04 270)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="oklch(0.84 0.16 195)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Credential status">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={credBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {credBreakdown.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.17 0.035 270)", border: "1px solid oklch(0.3 0.04 270)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs mt-2">
              {credBreakdown.map((d, i) => <span key={d.name} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} /> {d.name} ({d.value})</span>)}
            </div>
          </Card>

          <Card title="Credentials over time" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={credTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 270 / 0.3)" />
                <XAxis dataKey="month" stroke="oklch(0.7 0.03 260)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "oklch(0.17 0.035 270)", border: "1px solid oklch(0.3 0.04 270)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="oklch(0.66 0.23 305)" strokeWidth={2} dot={{ fill: "oklch(0.84 0.16 195)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Activity timeline">
          <ol className="relative border-l border-border/60 ml-2 space-y-4">
            {creds.slice(-10).reverse().map((c) => (
              <li key={c.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-gradient-to-r from-primary to-accent" />
                <div className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" /> {new Date(c.created_at).toLocaleString()}</div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.minted ? "Minted as NFT" : c.verified ? "Verified on-chain" : "Pending verification"}</div>
              </li>
            ))}
            {creds.length === 0 && <div className="text-sm text-muted-foreground ml-4">No activity yet.</div>}
          </ol>
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <h3 className="font-display font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
function Tile({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Icon className="h-4 w-4 text-primary" /> {label}</div>
      <div className="font-display text-3xl font-bold text-gradient mt-2">{value}</div>
    </div>
  );
}
