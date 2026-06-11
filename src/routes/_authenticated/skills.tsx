import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "Skills — SkillChain" }] }),
  component: SkillsPage,
});

type Skill = { id: string; name: string; category: string | null; level: number; endorsements: number };

function SkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [name, setName] = useState(""); const [cat, setCat] = useState(""); const [level, setLevel] = useState(3);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("skills").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setSkills((data as Skill[]) ?? []);
  };
  useEffect(() => { refresh(); }, [user?.id]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("skills").insert({ user_id: user.id, name: name.trim(), category: cat || null, level });
    setBusy(false);
    if (error) return toast.error(error.message);
    setName(""); setCat(""); setLevel(3);
    toast.success("Skill added");
    refresh();
  };
  const remove = async (id: string) => {
    await supabase.from("skills").delete().eq("id", id);
    refresh();
  };

  return (
    <AppShell title="Skills">
      <div className="grid lg:grid-cols-3 gap-6 max-w-6xl">
        <form onSubmit={add} className="glass rounded-2xl p-6 space-y-4 lg:col-span-1 h-fit">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Add a skill</h3>
          <div className="space-y-2"><Label>Skill</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="React, Solidity, Figma…" required /></div>
          <div className="space-y-2"><Label>Category</Label><Input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Frontend, Blockchain…" /></div>
          <div className="space-y-2">
            <Label>Level: {level}/5</Label>
            <input type="range" min={1} max={5} value={level} onChange={(e) => setLevel(+e.target.value)} className="w-full accent-[oklch(0.82_0.17_200)]" />
          </div>
          <Button disabled={busy} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"><Plus className="h-4 w-4" /> {busy ? "Saving…" : "Add skill"}</Button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {skills.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No skills yet. Add your first one.</p>
            </div>
          ) : skills.map((s) => (
            <div key={s.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.category || "Uncategorized"} · {s.endorsements} endorsements</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-2 w-4 rounded-sm ${i < s.level ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"}`} />
                  ))}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
