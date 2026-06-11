import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Shield, Sparkles, Zap, Wallet, BadgeCheck, ArrowRight,
  FileBadge, Search, QrCode, Hexagon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillChain — Own Your Skills. Verify Instantly. Get Hired Faster." },
      { name: "description", content: "Blockchain-powered skill passport. Upload skills, mint credential NFTs on Polygon, and share a verifiable public profile recruiters trust." },
      { property: "og:title", content: "SkillChain — Verifiable Skill Passport" },
      { property: "og:description", content: "Mint credential NFTs on Polygon. Prove your skills on-chain." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#recruiters" className="hover:text-foreground">For recruiters</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live on Polygon · Web3 credentials, zero gas for users
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Own your skills. <br />
            <span className="text-gradient">Verify instantly.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            SkillChain turns your certificates into on-chain credentials. Mint NFT badges,
            share a verifiable passport, and let recruiters trust you in one scan.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow gap-2 h-12 px-7">
              <Link to="/auth">
                Mint your passport <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 glass">
              <Link to="/recruiter">I'm a recruiter</Link>
            </Button>
          </div>

          {/* Floating cred card */}
          <div className="relative mt-16 mx-auto max-w-3xl">
            <div className="glass-strong rounded-2xl p-6 md:p-8 text-left animate-float">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                    <Hexagon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Credential NFT</div>
                    <div className="font-display text-lg font-semibold">Advanced React Developer</div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-success/10 text-success border border-success/30 inline-flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <Field label="Issuer" value="Meta" />
                <Field label="Chain" value="Polygon" />
                <Field label="Token ID" value="#0x4a8…f29" mono />
                <Field label="Tx Hash" value="0x9b1c…e0a2" mono />
                <Field label="Issued" value="Jun 11, 2026" />
                <Field label="Holder" value="0x82…9cD1" mono />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { k: "12,847", v: "Credentials minted" },
          { k: "3,210", v: "Active students" },
          { k: "486", v: "Recruiters onboard" },
          { k: "100%", v: "On-chain verified" },
        ].map((s) => (
          <div key={s.v} className="glass rounded-xl p-5 text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-gradient">{s.k}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Features</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold">Everything your career needs, on-chain.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 grid place-items-center mb-4 group-hover:animate-pulse-glow">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">How it works</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold">Three steps to a trustworthy passport.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="glass rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 font-display text-8xl font-bold text-foreground/5">{i + 1}</div>
              <s.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recruiter CTA */}
      <section id="recruiters" className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass-strong rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <Search className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-2xl mx-auto">
              Hire faster. Trust every credential.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Verify any candidate's certificate in one click. Scan a QR. Download a signed report.
            </p>
            <Button asChild size="lg" className="mt-8 bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
              <Link to="/auth">Start verifying <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
          <Logo />
          <div>© 2026 SkillChain · Built on Polygon</div>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-primary" : "font-medium"}`}>{value}</div>
    </div>
  );
}

const features = [
  { icon: Sparkles, title: "Skill management", desc: "Add, level, and categorize your skills with endorsement scores." },
  { icon: FileBadge, title: "Certificate upload", desc: "Drop any PDF or image. We hash it client-side and anchor it on-chain." },
  { icon: Hexagon, title: "NFT credentials", desc: "Mint each verified credential as an NFT on Polygon — own it forever." },
  { icon: Wallet, title: "MetaMask wallet", desc: "Connect your wallet to claim ownership of your skill passport." },
  { icon: QrCode, title: "QR verification", desc: "Share a single QR. Recruiters verify instantly, no logins." },
  { icon: Shield, title: "Reputation score", desc: "A composite signal recruiters trust — minted, verified, endorsed." },
];

const steps = [
  { icon: Zap, title: "Sign up & connect", desc: "Create your passport, connect MetaMask in 30 seconds." },
  { icon: FileBadge, title: "Upload credentials", desc: "Add skills and certificates. We hash & anchor each one." },
  { icon: BadgeCheck, title: "Mint & share", desc: "Mint NFT badges and share a public, verifiable link." },
];
