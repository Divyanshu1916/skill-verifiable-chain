import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck, Hexagon, ExternalLink, Sparkles, MapPin, ShieldCheck, Copy,
  Share2, Download, QrCode, Linkedin, Clock, Wallet, Award, ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { explorerUrl, shortAddress } from "@/lib/web3";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScoreRing } from "@/components/ScoreRing";

type Profile = {
  id: string; full_name: string | null; username: string | null; headline: string | null;
  bio: string | null; location: string | null; wallet_address: string | null;
  avatar_url: string | null; reputation_score: number;
};
type Skill = { id: string; name: string; level: number; category: string | null; endorsements: number; created_at: string };
type Cred = {
  id: string; credential_id: string | null; title: string; issuer: string; description: string | null;
  minted: boolean; verified: boolean; tx_hash: string | null; nft_token_id: string | null;
  issued_at: string | null; chain: string | null; created_at: string; file_url: string | null;
};

export const Route = createFileRoute("/passport/$username")({
  head: ({ loaderData }: { loaderData?: { profile: Profile } }) => ({
    meta: [
      { title: `${loaderData?.profile.full_name ?? loaderData?.profile.username ?? "Skill Passport"} — SkillChain` },
      { name: "description", content: loaderData?.profile.headline ?? loaderData?.profile.bio ?? "Verifiable skill passport on Polygon." },
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
  const navigate = useNavigate();
  const { profile, skills, credentials } = Route.useLoaderData() as {
    profile: Profile; skills: Skill[]; credentials: Cred[];
  };
  const minted = credentials.filter((c) => c.minted).length;
  const verifiedCount = credentials.filter((c) => c.verified).length;
  const endorsements = skills.reduce((a, s) => a + (s.endorsements || 0), 0);
  const score = profile.reputation_score || Math.min(100, minted * 15 + verifiedCount * 10 + skills.length * 4);
  const passportUrl = typeof window !== "undefined" ? window.location.href : "";

  const [openSkill, setOpenSkill] = useState<Skill | null>(null);
  const [openNft, setOpenNft] = useState<Cred | null>(null);
  const [openTx, setOpenTx] = useState<Cred | null>(null);

  const timeline = useMemo(() =>
    [...credentials]
      .filter((c) => c.verified || c.minted)
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .slice(0, 8),
  [credentials]);

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: `${profile.full_name || profile.username} — SkillChain`, url: passportUrl }); return; } catch {}
    }
    navigator.clipboard.writeText(passportUrl); toast.success("Link copied to clipboard");
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(passportUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copy = (text: string, label = "Copied") => {
    navigator.clipboard.writeText(text); toast.success(label);
  };

  const downloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text(profile.full_name || profile.username || "Passport", 20, 25);
    doc.setFontSize(11); doc.setTextColor(120);
    doc.text(`@${profile.username} · Reputation ${score}/100`, 20, 33);
    if (profile.headline) doc.text(profile.headline, 20, 41);
    doc.setTextColor(0); doc.setFontSize(14); doc.text("Skills", 20, 55);
    doc.setFontSize(10);
    skills.slice(0, 20).forEach((s, i) => doc.text(`• ${s.name} (Lvl ${s.level}/5)${s.category ? " — " + s.category : ""}${s.endorsements ? `  ★ ${s.endorsements}` : ""}`, 22, 63 + i * 6));
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

  const initials = (profile.full_name || profile.username || "?").slice(0, 1).toUpperCase();

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
        <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full aurora pointer-events-none" />
          <div className="relative grid md:grid-cols-[auto,1fr,auto] gap-6 items-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || profile.username || "Avatar"} className="h-24 w-24 rounded-2xl object-cover shrink-0 border border-border" />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-3xl font-display font-bold text-primary-foreground shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-3xl md:text-4xl font-bold truncate">{profile.full_name || profile.username}</h1>
                <VerifiedBadgeDialog profile={profile} minted={minted} verifiedCount={verifiedCount} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">@{profile.username}</div>
              {profile.headline && <p className="mt-3 text-foreground/80">{profile.headline}</p>}
              {profile.bio && <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.location}</span>}
                {profile.wallet_address && (
                  <button onClick={() => copy(profile.wallet_address!, "Wallet copied")} className="font-mono inline-flex items-center gap-1 hover:text-primary transition">
                    <Wallet className="h-3 w-3" /> {shortAddress(profile.wallet_address)} <Copy className="h-3 w-3" />
                  </button>
                )}
                <span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="h-3 w-3" /> Verified on Polygon</span>
              </div>
            </div>
            <ScoreBreakdownDialog score={score} minted={minted} verifiedCount={verifiedCount} skills={skills.length} endorsements={endorsements} />
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => copy(passportUrl, "Public URL copied")}><Copy className="h-4 w-4" /> Copy URL</Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={downloadPDF}><Download className="h-4 w-4" /> Download PDF</Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={shareLinkedIn}><Linkedin className="h-4 w-4" /> LinkedIn</Button>
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

          {/* Quick stats */}
          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Reputation" value={`${score}/100`} />
            <Stat label="Verified" value={verifiedCount} />
            <Stat label="NFT credentials" value={minted} />
            <Stat label="Endorsements" value={endorsements} />
          </div>
        </div>

        {/* Skills */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-primary" /> Skills</h2>
          {skills.length === 0 ? <p className="text-sm text-muted-foreground">No skills listed yet.</p> : (
            <div className="space-y-4">
              {Object.entries(groupBy(skills, (s) => s.category || "General")).map(([cat, items]) => (
                <div key={cat}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setOpenSkill(s)}
                        className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-2 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                      >
                        {s.name}
                        <span className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < s.level ? "bg-primary" : "bg-muted"}`} />
                          ))}
                        </span>
                        {s.endorsements > 0 && <span className="text-[10px] text-accent">★ {s.endorsements}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NFT Credentials Grid */}
        {minted > 0 && (
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><Hexagon className="h-5 w-5 text-accent" /> NFT Credentials</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {credentials.filter((c) => c.minted).map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setOpenNft(c)}
                  className="glass rounded-xl p-3 text-left hover:border-accent/50 hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className="relative aspect-[5/3] rounded-lg overflow-hidden mb-3"
                    style={{ background: `linear-gradient(135deg, oklch(0.55 0.2 ${195 + i * 30}), oklch(0.5 0.22 ${305 + i * 20}))` }}
                  >
                    <Hexagon className="absolute inset-0 m-auto h-12 w-12 text-white/90" strokeWidth={1.2} />
                    {c.nft_token_id && (
                      <span className="absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white">#{c.nft_token_id.slice(0, 6)}</span>
                    )}
                  </div>
                  <div className="font-semibold text-sm truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.issuer}</div>
                  <div className="mt-2 text-[10px] text-primary inline-flex items-center gap-1">View details <ChevronRight className="h-3 w-3" /></div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* All credentials */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><BadgeCheck className="h-5 w-5 text-accent" /> Certificates</h2>
          {credentials.length === 0 ? <p className="text-sm text-muted-foreground">No credentials yet.</p> : (
            <div className="grid sm:grid-cols-2 gap-3">
              {credentials.map((c) => (
                <div key={c.id} className="glass rounded-xl p-4 hover:border-primary/40 transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to="/verify/$credentialId"
                        params={{ credentialId: c.credential_id || c.id }}
                        className="font-semibold truncate block hover:text-primary"
                      >
                        {c.title}
                      </Link>
                      <div className="text-xs text-muted-foreground truncate">{c.issuer}</div>
                      {c.issued_at && <div className="text-[10px] text-muted-foreground mt-1">Issued {fmtDate(c.issued_at)}</div>}
                    </div>
                    {c.minted && <Hexagon className="h-5 w-5 text-accent shrink-0" />}
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap items-center">
                    {c.verified && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-success/10 text-success border border-success/30">VERIFIED</span>}
                    {c.minted && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/30">NFT</span>}
                    {c.tx_hash && (
                      <button
                        onClick={() => setOpenTx(c)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 inline-flex items-center gap-1 hover:bg-primary/20"
                      >
                        {c.tx_hash.slice(0, 10)}…
                      </button>
                    )}
                    <Link
                      to="/verify/$credentialId"
                      params={{ credentialId: c.credential_id || c.id }}
                      className="ml-auto text-[10px] text-primary inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      Verify <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Verification Timeline */}
        {timeline.length > 0 && (
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-primary" /> Verification History</h2>
            <ol className="relative border-l border-border/60 ml-2 space-y-4">
              {timeline.map((c) => (
                <li key={c.id} className="pl-6 relative">
                  <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-primary to-accent ring-4 ring-background" />
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Link
                      to="/verify/$credentialId"
                      params={{ credentialId: c.credential_id || c.id }}
                      className="font-medium text-sm hover:text-primary"
                    >
                      {c.title}
                    </Link>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(c.created_at)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.issuer}</div>
                  <div className="flex gap-1 mt-1">
                    {c.verified && <span className="text-[10px] text-success">✓ Verified</span>}
                    {c.minted && <span className="text-[10px] text-accent">✦ NFT minted</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="text-center text-xs text-muted-foreground py-6">
          Public skill passport · Powered by <Link to="/" className="text-primary">SkillChain</Link>
        </div>
      </main>

      {/* Skill detail dialog */}
      <Dialog open={!!openSkill} onOpenChange={(o) => !o && setOpenSkill(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {openSkill?.name}</DialogTitle>
            <DialogDescription>{openSkill?.category || "General"} skill</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <Row label="Level"><div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`h-2 w-6 rounded ${i < (openSkill?.level || 0) ? "bg-primary" : "bg-muted"}`} />)}</div></Row>
            <Row label="Endorsements"><span className="text-accent">★ {openSkill?.endorsements ?? 0}</span></Row>
            <Row label="Added"><span className="text-muted-foreground">{openSkill && fmtDate(openSkill.created_at)}</span></Row>
          </div>
        </DialogContent>
      </Dialog>

      {/* NFT detail dialog */}
      <Dialog open={!!openNft} onOpenChange={(o) => !o && setOpenNft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Hexagon className="h-4 w-4 text-accent" /> {openNft?.title}</DialogTitle>
            <DialogDescription>{openNft?.issuer}</DialogDescription>
          </DialogHeader>
          {openNft && (
            <div className="space-y-3 text-sm">
              <div
                className="aspect-[5/3] rounded-xl overflow-hidden relative"
                style={{ background: `linear-gradient(135deg, oklch(0.55 0.2 220), oklch(0.5 0.22 320))` }}
              >
                <Hexagon className="absolute inset-0 m-auto h-16 w-16 text-white/90" strokeWidth={1.2} />
              </div>
              {openNft.nft_token_id && <Row label="Token ID"><span className="font-mono text-xs">{openNft.nft_token_id}</span></Row>}
              {openNft.credential_id && <Row label="Credential"><span className="font-mono text-xs">{openNft.credential_id}</span></Row>}
              <Row label="Chain"><span className="capitalize">{openNft.chain || "polygon"}</span></Row>
              {openNft.issued_at && <Row label="Issued"><span>{fmtDate(openNft.issued_at)}</span></Row>}
              {openNft.tx_hash && (
                <Row label="Tx hash">
                  <button onClick={() => { setOpenNft(null); setOpenTx(openNft); }} className="font-mono text-xs text-primary hover:underline">
                    {openNft.tx_hash.slice(0, 16)}…
                  </button>
                </Row>
              )}
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <Link to="/verify/$credentialId" params={{ credentialId: openNft.credential_id || openNft.id }}>
                    <ShieldCheck className="h-4 w-4" /> Verify NFT
                  </Link>
                </Button>
                {openNft.tx_hash && (
                  <Button asChild size="sm" variant="outline">
                    <a href={explorerUrl(openNft.tx_hash)} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Blockchain proof modal */}
      <Dialog open={!!openTx} onOpenChange={(o) => !o && setOpenTx(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Blockchain Proof</DialogTitle>
            <DialogDescription>Anchored on {openTx?.chain || "polygon"} — tamper-evident.</DialogDescription>
          </DialogHeader>
          {openTx && (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Transaction hash</div>
                <div className="font-mono text-xs break-all glass rounded-lg p-3 mt-1">{openTx.tx_hash}</div>
              </div>
              {openTx.nft_token_id && (
                <Row label="Token"><span className="font-mono text-xs">{openTx.nft_token_id}</span></Row>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => copy(openTx.tx_hash || "", "Hash copied")}><Copy className="h-4 w-4" /> Copy</Button>
                <Button asChild size="sm" className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <a href={explorerUrl(openTx.tx_hash || "")} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open explorer</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}

function VerifiedBadgeDialog({ profile, minted, verifiedCount }: { profile: Profile; minted: number; verifiedCount: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button aria-label="Verification info" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/10 text-success border border-success/30 hover:bg-success/20 transition">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-success" /> Verification</DialogTitle>
          <DialogDescription>How this passport is trust-verified.</DialogDescription>
        </DialogHeader>
        <ul className="text-sm space-y-2 text-foreground/90">
          <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-success mt-0.5" /> {verifiedCount} credential{verifiedCount === 1 ? "" : "s"} hash-verified on Polygon.</li>
          <li className="flex items-start gap-2"><Hexagon className="h-4 w-4 text-accent mt-0.5" /> {minted} NFT credential{minted === 1 ? "" : "s"} minted to the owner's wallet.</li>
          {profile.wallet_address && <li className="flex items-start gap-2"><Wallet className="h-4 w-4 text-primary mt-0.5" /> Wallet ownership proven via signature.</li>}
          <li className="flex items-start gap-2"><Award className="h-4 w-4 text-primary mt-0.5" /> Issuer signatures cross-checked at verification time.</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function ScoreBreakdownDialog({ score, minted, verifiedCount, skills, endorsements }: { score: number; minted: number; verifiedCount: number; skills: number; endorsements: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button aria-label="Reputation breakdown" className="shrink-0 hover:scale-105 transition-transform">
          <ScoreRing value={score} size={120} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reputation breakdown</DialogTitle>
          <DialogDescription>Composite score recruiters trust.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-3"><ScoreRing value={score} size={140} /></div>
        <div className="space-y-2 text-sm">
          <Row label="NFT credentials"><span>{minted} × 15 = <span className="text-accent font-semibold">{minted * 15}</span></span></Row>
          <Row label="Verified hashes"><span>{verifiedCount} × 10 = <span className="text-success font-semibold">{verifiedCount * 10}</span></span></Row>
          <Row label="Skills listed"><span>{skills} × 4 = <span className="text-primary font-semibold">{skills * 4}</span></span></Row>
          <Row label="Endorsements"><span className="text-accent">★ {endorsements}</span></Row>
          <div className="border-t border-border/50 pt-2 mt-2 flex justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="font-display font-bold">{score}/100</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function groupBy<T>(arr: T[], key: (x: T) => string): Record<string, T[]> {
  return arr.reduce((acc, x) => {
    const k = key(x);
    (acc[k] ||= []).push(x);
    return acc;
  }, {} as Record<string, T[]>);
}

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return d; }
}
