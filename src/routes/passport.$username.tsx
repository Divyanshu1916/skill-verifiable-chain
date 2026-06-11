import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Hexagon, ExternalLink, Sparkles, MapPin, ShieldCheck, Copy } from "lucide-react";
import { explorerUrl, shortAddress } from "@/lib/web3";
import { toast } from "sonner";

export const Route = createFileRoute("/passport/$username")({
  head: ({ loaderData }: { loaderData?: { profile: { full_name: string | null; username: string | null; headline: string | null } } }) => ({
    meta: [
      { title: `${loaderData?.profile.full_name ?? loaderData?.profile.username ?? "Skill Passport"} — SkillChain` },
      { name: "description", content: loaderData?.profile.headline ?? "Verifiable skill passport on Polygon." },
      { property: "og:title", content: `${loaderData?.profile.full_name ?? "Skill Passport"} — SkillChain` },
      { property: "og:description", content: loaderData?.profile.headline ?? "On-chain credentials." },
    ],
  }),
  loader: async ({ params }) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", params.username)
      .maybeSingle();
    if (!profile) throw notFound();
    const [{ data: skills }, { data: credentials }] = await Promise.all([
      supabase.from("skills").select("*").eq("user_id", profile.id).order("level", { ascending: false }),
      supabase.from("credentials").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
    ]);
    return { profile, skills: skills ?? [], credentials: credentials ?? [] };
  },
  component: Passport,
  errorComponent: ({ error }) => <div className="min-h-screen grid place-items-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="min-h-screen grid place-items-center text-muted-foreground">Passport not found.</div>,
});

function Passport() {
  const { profile, skills, credentials } = Route.useLoaderData();
  const minted = credentials.filter((c) => c.minted).length;
  const score = Math.min(100, minted * 15 + credentials.filter((c) => c.verified).length * 10 + skills.length * 4);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <Button asChild size="sm" variant="outline"><Link to="/auth">Build yours</Link></Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Hero card */}
        <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-3xl font-display font-bold text-primary-foreground shrink-0">
              {(profile.full_name || profile.username || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl md:text-4xl font-bold">{profile.full_name || profile.username}</h1>
              <div className="text-sm text-muted-foreground mt-1">@{profile.username}</div>
              {profile.headline && <p className="mt-3 text-foreground/80">{profile.headline}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.location}</span>}
                {profile.wallet_address && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(profile.wallet_address!); toast.success("Wallet copied"); }}
                    className="font-mono inline-flex items-center gap-1 hover:text-primary">
                    {shortAddress(profile.wallet_address)} <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-center md:text-right shrink-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Reputation</div>
              <div className="font-display text-5xl font-bold text-gradient">{score}</div>
              <div className="flex items-center gap-1 justify-center md:justify-end mt-1 text-xs text-success"><ShieldCheck className="h-3 w-3" /> Verified on Polygon</div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-primary" /> Skills</h2>
          {skills.length === 0 ? <p className="text-sm text-muted-foreground">No skills listed yet.</p> : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.id} className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-2">
                  {s.name}
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < s.level ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </span>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Credentials */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><BadgeCheck className="h-5 w-5 text-accent" /> Credentials</h2>
          {credentials.length === 0 ? <p className="text-sm text-muted-foreground">No credentials yet.</p> : (
            <div className="grid sm:grid-cols-2 gap-3">
              {credentials.map((c) => (
                <Link key={c.id} to="/verify/$credentialId" params={{ credentialId: c.id }} className="glass rounded-xl p-4 hover:border-primary/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.issuer}</div>
                    </div>
                    {c.minted && <Hexagon className="h-5 w-5 text-accent shrink-0" />}
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {c.verified && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-success/10 text-success border border-success/30">VERIFIED</span>}
                    {c.minted && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/30">NFT</span>}
                    {c.tx_hash && (
                      <a href={explorerUrl(c.tx_hash)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 inline-flex items-center gap-1">
                        {c.tx_hash.slice(0, 10)}… <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
