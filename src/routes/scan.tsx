import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, ShieldCheck, ScanLine, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "QR Verification — SkillChain" },
      { name: "description", content: "Verify any SkillChain credential instantly — no login required." },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const nav = useNavigate();
  const [scanInput, setScanInput] = useState("");

  const scan = (e: React.FormEvent) => {
    e.preventDefault();
    const val = scanInput.trim();
    if (!val) return;
    const m = val.match(/verify\/([^/?#]+)/);
    const cid = m ? m[1] : val;
    nav({ to: "/verify/$credentialId", params: { credentialId: cid } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-4">
            <QrCode className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">QR Verification</h1>
          <p className="text-muted-foreground mt-3">Paste a credential ID or scanned URL — no account needed.</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary" /> Scan / Paste
          </h2>
          <form onSubmit={scan} className="mt-4 space-y-3">
            <Input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="cred_… or https://…/verify/cred_…"
              autoFocus
            />
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
              <ShieldCheck className="h-4 w-4" /> Verify on-chain
            </Button>
          </form>
          <div className="mt-6 text-xs text-muted-foreground">
            Every credential has a unique <span className="font-mono text-primary">credential_id</span> anchored on Polygon.
            A scan resolves the hash and proves ownership without contacting the issuer.
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Want to generate your own QR?{" "}
          <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
        </div>
      </main>
    </div>
  );
}
