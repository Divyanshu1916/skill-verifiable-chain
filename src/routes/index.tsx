import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { GradientOrb } from "@/components/GradientOrb";
import {
  Shield, Sparkles, Zap, Wallet, BadgeCheck, ArrowRight,
  FileBadge, Search, QrCode, Hexagon, BarChart3, PlayCircle, Star, Globe,
} from "lucide-react";
import { HeroBackground } from "@/components/HeroBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillChain — Own Your Skills. Verify Instantly. Get Hired Faster." },
      { name: "description", content: "Blockchain-powered skill passport. Mint credential NFTs on Polygon, share a verifiable profile, and let recruiters trust you in one scan." },
      { property: "og:title", content: "SkillChain — Verifiable Skill Passport" },
      { property: "og:description", content: "Mint credential NFTs on Polygon. Prove your skills on-chain." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Aurora background */}
      <GradientOrb className="top-[-200px] left-1/2 -translate-x-1/2 h-[600px] w-[1000px]" />
      <GradientOrb className="top-[40%] right-[-150px] h-[400px] w-[400px]" />

      {/* Nav */}
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#nfts" className="hover:text-foreground transition">NFT Credentials</a>
            <a href="#recruiters" className="hover:text-foreground transition">Recruiters</a>
            <Link to="/feedback" className="hover:text-foreground transition">Feedback</Link>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-3 sm:px-6 pt-6 md:pt-10">
        <div className="relative max-w-7xl mx-auto rounded-[28px] border border-white/10 shadow-[0_30px_120px_-30px_oklch(0.5_0.22_295_/_0.55)] overflow-hidden">
          <HeroBackground />

          {/* Content */}
          <div className="relative px-5 sm:px-8 md:px-12 pt-16 md:pt-24 pb-12 md:pb-16 text-center">
            <Link to="/demo" className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-white/80 mb-8 hover:text-white transition">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live on Polygon · Try the demo dashboard
              <ArrowRight className="h-3 w-3" />
            </Link>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.02] text-white animate-fade-up">
              Own your skills. <br />
              <span className="text-gradient">Verify instantly.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
              SkillChain turns your certificates into on-chain credentials. Mint NFT badges,
              share a verifiable passport, and let recruiters trust you in one scan.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow gap-2 h-12 px-7">
                <Link to="/signup">Get started <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 glass gap-2 text-white border-white/20 hover:text-white">
                <Link to="/demo"><PlayCircle className="h-4 w-4" /> View demo</Link>
              </Button>
            </div>

            {/* Floating credential NFT */}
            <div className="relative mt-16 mx-auto max-w-3xl animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/nft" className="relative block">
                <div className="glass-strong rounded-2xl p-6 md:p-8 text-left animate-float hover:border-primary/40 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shrink-0 glow">
                        <Hexagon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-white/70 uppercase tracking-wider">Credential NFT</div>
                        <div className="font-display text-lg font-semibold truncate text-white">Advanced React Developer</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md bg-success/10 text-success border border-success/30 inline-flex items-center gap-1 shrink-0">
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
              </Link>
            </div>

            {/* Stats inside hero */}
            <div className="relative mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { k: "12,847", v: "Credentials minted", to: "/analytics" as const },
                { k: "3,210", v: "Active students", to: "/analytics" as const },
                { k: "486", v: "Recruiters onboard", to: "/recruiter" as const },
                { k: "100%", v: "On-chain verified", to: "/nft" as const },
              ].map((s) => (
                <Link to={s.to} key={s.v} className="glass rounded-xl p-4 sm:p-5 text-center hover:border-primary/40 hover:-translate-y-0.5 transition group">
                  <div className="font-display text-2xl md:text-3xl font-bold text-gradient">{s.k}</div>
                  <div className="text-[11px] sm:text-xs text-white/70 mt-1 group-hover:text-white">{s.v} →</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Features bento */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Features</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold">Everything your career needs, on-chain.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <Link to={f.to} key={f.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 grid place-items-center mb-4 group-hover:animate-pulse-glow">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              <div className="mt-4 text-xs text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NFT gallery preview */}
      <section id="nfts" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">NFT Credentials</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold">Own them. Show them. Prove them.</h2>
          </div>
          <Button asChild variant="outline" className="glass gap-2"><Link to="/nft">Explore gallery <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleNFTs.map((n, i) => (
            <Link to="/nft" key={n.title} className="group">
              <div className="glass-strong rounded-2xl p-4 hover:border-primary/40 hover:-translate-y-1 transition">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3" style={{ background: `linear-gradient(135deg, oklch(0.55 0.2 ${195 + i * 30}), oklch(0.5 0.22 ${305 + i * 20}))` }}>
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <Hexagon className="absolute inset-0 m-auto h-16 w-16 text-white/90 animate-float" strokeWidth={1.2} />
                </div>
                <div className="font-semibold text-sm truncate">{n.title}</div>
                <div className="text-xs text-muted-foreground truncate">{n.issuer}</div>
              </div>
            </Link>
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
          <GradientOrb className="-top-32 -right-32 h-96 w-96" />
          <div className="relative">
            <Search className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-5xl font-bold max-w-2xl mx-auto">
              Hire faster. Trust every credential.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Verify any candidate's certificate in one click. Scan a QR. Download a signed report.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
                <Link to="/recruiter">Open recruiter dashboard <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass gap-2">
                <Link to="/qr"><QrCode className="h-4 w-4" /> Try QR verification</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / trust strip */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="glass rounded-2xl p-6 flex flex-wrap items-center justify-around gap-6 text-xs text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Polygon Native</span>
          <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Zero-Knowledge Ready</span>
          <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Public Verification</span>
          <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Reputation Engine</span>
        </div>
      </section>

      <footer className="border-t border-border/40 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-muted-foreground">
          <Logo />
          <div className="flex items-center gap-3">
            <SocialLink href="https://github.com/Divyanshu1916" label="GitHub" icon={<GitHubIcon />} />
            <SocialLink href="https://www.linkedin.com/in/divyanshu-kumar11" label="LinkedIn" icon={<LinkedInIcon />} />
            <SocialLink href="https://x.com/ITS_Divyansh_u" label="X" icon={<XIcon />} />
            <SocialLink href="https://discordapp.com/users/1507933325598392430" label="Discord" icon={<DiscordIcon />} />
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="outline" className="border-primary/40 hover:border-primary/70">
              <Link to="/feedback">⭐ Rate SkillChain</Link>
            </Button>
            <span>© 2026 SkillChain · Built on Polygon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-10 w-10 rounded-xl glass grid place-items-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
    >
      {icon}
    </a>
  );
}

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M15 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M7.5 5.5C4.5 6.5 3 9 3 9l3.5 2.5" />
      <path d="M16.5 5.5c3 1 4.5 3.5 4.5 3.5l-3.5 2.5" />
      <path d="M18 18c-1.5 1-3.5 1.5-6 1.5s-4.5-.5-6-1.5" />
      <path d="M3 9v7.5a2.5 2.5 0 0 0 2.5 2.5h13a2.5 2.5 0 0 0 2.5-2.5V9" />
    </svg>
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
  { icon: Sparkles, title: "Skill management", desc: "Add, level, and categorize your skills with endorsement scores.", to: "/skills" as const },
  { icon: FileBadge, title: "Certificate upload", desc: "Drop any PDF or image. We hash it client-side and anchor it on-chain.", to: "/certificates" as const },
  { icon: Hexagon, title: "NFT credentials", desc: "Mint each verified credential as an NFT on Polygon — own it forever.", to: "/nft" as const },
  { icon: Wallet, title: "MetaMask wallet", desc: "Connect your wallet to claim ownership of your skill passport.", to: "/wallet" as const },
  { icon: QrCode, title: "QR verification", desc: "Share a single QR. Recruiters verify instantly, no logins.", to: "/qr" as const },
  { icon: BarChart3, title: "Reputation score", desc: "A composite signal recruiters trust — minted, verified, endorsed.", to: "/reputation" as const },
];

const steps = [
  { icon: Zap, title: "Sign up & connect", desc: "Create your passport, connect MetaMask in 30 seconds." },
  { icon: FileBadge, title: "Upload credentials", desc: "Add skills and certificates. We hash & anchor each one." },
  { icon: BadgeCheck, title: "Mint & share", desc: "Mint NFT badges and share a public, verifiable link." },
];

const sampleNFTs = [
  { title: "Advanced React", issuer: "Meta" },
  { title: "Solidity Pro", issuer: "Alchemy" },
  { title: "AWS Architect", issuer: "Amazon" },
  { title: "Figma Master", issuer: "Figma" },
];
