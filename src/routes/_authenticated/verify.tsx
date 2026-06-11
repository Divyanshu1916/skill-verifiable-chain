import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Search, BadgeCheck, XCircle, ExternalLink } from "lucide-react";
import { explorerUrl } from "@/lib/web3";

export const Route = createFileRoute("/_authenticated/verify")({
  head: () => ({ meta: [{ title: "Verify credential — SkillChain" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; title?: string; issuer?: string; tx?: string; minted?: boolean }>(null);
  const [busy, setBusy] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setResult(null);
    const { data } = await supabase
      .from("credentials")
      .select("title,issuer,tx_hash,minted,verified")
      .or(`file_hash.eq.${q},tx_hash.eq.${q},id.eq.${q.length === 36 ? q : "00000000-0000-0000-0000-000000000000"}`)
      .limit(1)
      .maybeSingle();
    setBusy(false);
    if (!data) { setResult({ ok: false }); return; }
    setResult({ ok: data.verified, title: data.title, issuer: data.issuer, tx: data.tx_hash ?? undefined, minted: data.minted });
  };

  return (
    <AppShell title="Credential verification">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="glass rounded-2xl p-8 text-center">
          <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold">Verify any credential</h2>
          <p className="text-sm text-muted-foreground mt-1">Paste a file hash, transaction hash, or credential ID.</p>
          <form onSubmit={run} className="mt-6 flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="0x... or credential ID" className="font-mono" required />
            <Button disabled={busy} className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"><Search className="h-4 w-4" /> Verify</Button>
          </form>
        </div>

        {result && (
          <div className={`glass rounded-2xl p-6 border ${result.ok ? "border-success/40" : "border-destructive/40"}`}>
            {result.ok ? (
              <>
                <div className="flex items-center gap-2 text-success font-medium"><BadgeCheck className="h-5 w-5" /> Authentic credential</div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <Field label="Title" value={result.title!} />
                  <Field label="Issuer" value={result.issuer!} />
                  {result.tx && <Field label="Tx" value={<a className="text-primary inline-flex gap-1 items-center" href={explorerUrl(result.tx)} target="_blank" rel="noreferrer">{result.tx.slice(0,14)}… <ExternalLink className="h-3 w-3" /></a>} />}
                  <Field label="NFT" value={result.minted ? "Minted" : "Not minted"} />
                </div>
                <Button size="sm" variant="outline" className="mt-5" onClick={() => downloadReport(result)}>Download verification report</Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-destructive font-medium"><XCircle className="h-5 w-5" /> No matching credential found</div>
            )}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Want to scan a QR? Visit <Link to="/" className="text-primary">/verify/&lt;credential-id&gt;</Link> directly.
        </p>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function downloadReport(r: { title?: string; issuer?: string; tx?: string; minted?: boolean }) {
  const blob = new Blob(
    [`SkillChain Verification Report\n==========================\nTitle: ${r.title}\nIssuer: ${r.issuer}\nTx Hash: ${r.tx}\nNFT: ${r.minted ? "Minted" : "Not minted"}\nDate: ${new Date().toISOString()}\n`],
    { type: "text/plain" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `skillchain-report-${Date.now()}.txt`;
  a.click(); URL.revokeObjectURL(url);
}
