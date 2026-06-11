import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Hexagon, ExternalLink, Sparkles, MapPin, ShieldCheck, Copy, Share2, Download, QrCode } from "lucide-react";
import { explorerUrl, shortAddress } from "@/lib/web3";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScoreRing } from "@/components/ScoreRing";

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
    const { data: profile } = await supabase.from("profiles").select("*").eq("username", params.username).maybeSingle();
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
  const { profile, skills, credentials } = Route.useLoaderData() as {
    profile: { id: string; full_name: string | null; username: string | null; headline: string | null; location: string | null; wallet_address: string | null; reputation_score: number };
    skills: { id: string; name: string; level: number; category: string | null }[];
    credentials: { id: string; credential_id: string | null; title: string; issuer: string; minted: boolean; verified: boolean; tx_hash: string | null; nft_token_id: string | null; issued_at: string | null }[];
  };
  const minted = credentials.filter((c) => c.minted).length;
  const score = profile.reputation_score || Math.min(100, minted * 15 + credentials.filter((c) => c.verified).length * 10 + skills.length * 4);
  const passportUrl = typeof window !== "undefined" ? window.location.href : "";

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `${profile.full_name || profile.username} — SkillChain`, url: passportUrl }); return; } catch {}
    }
    navigator.clipboard.writeText(passportUrl); toast.success("Link copied to clipboard");
  };

  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text(profile.full_name || profile.username || "Passport", 20, 25);
    doc.setFontSize(11); doc.setTextColor(120);
    doc.text(`@${profile.username} · Reputation ${score}/100`, 20, 33);
    if (profile.headline) doc.text(profile.headline, 20, 41);
    doc.setTextColor(0); doc.setFontSize(14); doc.text("Skills", 20, 55);
    doc.setFontSize(10); skills.slice(0, 20).forEach((s, i) => doc.text(`• ${s.name} (Lvl ${s.level}/5)${s.category ? " — " + s.category : ""}`, 22, 63 + i * 6));
    let y = 63 + Math.min(20, skills.length) * 6 + 8;
    doc.setFontSize(14); doc.text("Credentials", 20, y); y += 8;
    doc.setFontSize(10);
    credentials.forEach((c) => {
      doc.text(`• ${c.title} — ${c.issuer}${c.minted ? " (NFT " + (c.nft_token_id || "") + ")" : ""}`, 22, y); y += 5;
      if (c.tx_hash) { doc.setTextColor(120); doc.text(`  tx: ${c.tx_hash.slice(0, 42)}…`, 22, y); doc.setTextColor(0); y += 6; }
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Verify at ${passportUrl}`, 20, 290);
    doc.save(`${profile.username || "passport"}-skillchain.pdf`);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <Button asChild size="sm" variant="outline"><Link to="/signup">Build yours</Link></Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Hero */}
        <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full aurora" />
          <div className="relative grid md:grid-cols-[auto,1fr,auto] gap-6 items-center">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-3xl font-display font-bold text-primary-foreground shrink-0">
              {(profile.full_name || profile.username || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl md:text-4xl font-bold truncate">{profile.full_name || profile.username}</h1>
              <div className="text-sm text-muted-foreground mt-1">@{profile.username}</div>
              {profile.headline && <p className="mt-3 text-foreground/80">{profile.headline}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.location}</span>}
                {profile.wallet_address && (
                  <button onClick={() => { navigator.clipboard.writeText(profile.wallet_address!); toast.success("Wallet copied"); }} className="font-mono inline-flex items-center gap-1 hover:text-primary">
                    {shortAddress(profile.wallet_address)} <Copy className="h-3 w-3" />
                  </button>
                )}
                <span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="h-3 w-3" /> Verified on Polygon</span>
              </div>
            </div>
            <ScoreRing value={score} size={120} />
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => { navigator.clipboard.writeText(passportUrl); toast.success("Link copied"); }}><Copy className="h-4 w-4" /> Copy link</Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={downloadPDF}><Download className="h-4 w-4" /> Download PDF</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2"><QrCode className="h-4 w-4" /> Show QR</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Scan this passport</DialogTitle></DialogHeader>
                <div className="rounded-xl bg-white p-6 grid place-items-center">
                  <QRCodeSVG value={passportUrl} size={220} bgColor="#ffffff" fgColor="#0a0a16" level="M" />
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2 font-mono break-all">{passportUrl}</div>
              </DialogContent>
            </Dialog>
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

        {/* NFT Credentials Grid */}
        {credentials.filter((c) => c.minted).length > 0 && (
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><Hexagon className="h-5 w-5 text-accent" /> NFT Credentials</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {credentials.filter((c) => c.minted).map((c, i) => (
                <div key={c.id} className="glass rounded-xl p-3">
                  <div className="relative aspect-[5/3] rounded-lg overflow-hidden mb-3" style={{ background: `linear-gradient(135deg, oklch(0.55 0.2 ${195 + i * 30}), oklch(0.5 0.22 ${305 + i * 20}))` }}>
                    <Hexagon className="absolute inset-0 m-auto h-12 w-12 text-white/90" strokeWidth={1.2} />
                  </div>
                  <div className="font-semibold text-sm truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.issuer}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Credentials */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><BadgeCheck className="h-5 w-5 text-accent" /> All Credentials</h2>
          {credentials.length === 0 ? <p className="text-sm text-muted-foreground">No credentials yet.</p> : (
            <div className="grid sm:grid-cols-2 gap-3">
              {credentials.map((c) => (
                <Link key={c.id} to="/verify/$credentialId" params={{ credentialId: c.credential_id || c.id }} className="glass rounded-xl p-4 hover:border-primary/40 transition">
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
