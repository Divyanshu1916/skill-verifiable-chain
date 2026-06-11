import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Hexagon, BadgeCheck, ExternalLink, Copy, ArrowLeft, ShieldCheck, QrCode } from "lucide-react";
import { explorerUrl, shortAddress } from "@/lib/web3";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/nft/$id")({
  head: () => ({ meta: [{ title: "NFT Detail — SkillChain" }] }),
  component: NFTDetail,
});

type Cred = {
  id: string; credential_id: string | null; title: string; issuer: string; description: string | null;
  tx_hash: string | null; nft_token_id: string | null; nft_id: string | null;
  file_hash: string | null; minted: boolean; verified: boolean; issued_at: string | null;
  chain: string | null; user_id: string;
};

function NFTDetail() {
  const { id } = useParams({ from: "/_authenticated/nft/$id" });
  const [c, setC] = useState<Cred | null>(null);
  const [owner, setOwner] = useState<{ username: string | null; wallet_address: string | null; full_name: string | null } | null>(null);

  useEffect(() => {
    supabase.from("credentials").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setC(data as Cred);
      if (data) {
        const { data: p } = await supabase.from("profiles").select("username,wallet_address,full_name").eq("id", (data as Cred).user_id).maybeSingle();
        setOwner(p as any);
      }
    });
  }, [id]);

  if (!c) return <AppShell title="NFT"><div className="glass rounded-2xl p-12 text-center text-muted-foreground">Loading…</div></AppShell>;

  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };
  const hue = (c.title.charCodeAt(0) % 12) * 25;

  return (
    <AppShell title="NFT Detail">
      <div className="max-w-5xl space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-2"><Link to="/nft"><ArrowLeft className="h-4 w-4" /> Back to gallery</Link></Button>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Visual */}
          <div className="lg:col-span-2">
            <div className="glass-strong rounded-2xl p-5">
              <div className="relative aspect-square rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, oklch(0.55 0.2 ${195 + hue}), oklch(0.5 0.22 ${305 + hue}))` }}>
                <div className="absolute inset-0 grid-bg opacity-40" />
                <Hexagon className="absolute inset-0 m-auto h-32 w-32 text-white/90 drop-shadow-2xl animate-float" strokeWidth={1.2} />
                <div className="absolute top-3 left-3 text-[10px] font-mono uppercase text-white/90 bg-black/30 backdrop-blur px-2 py-1 rounded">{c.nft_token_id || "#PENDING"}</div>
                {c.verified && <div className="absolute top-3 right-3 text-[10px] inline-flex items-center gap-1 bg-success/90 text-success-foreground px-2 py-1 rounded"><BadgeCheck className="h-3 w-3" /> Verified</div>}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Credential NFT</div>
              <h1 className="font-display text-3xl font-bold mt-1">{c.title}</h1>
              <p className="text-muted-foreground mt-1">Issued by {c.issuer}</p>
              {c.description && <p className="mt-4 text-sm">{c.description}</p>}
            </div>

            <div className="glass rounded-2xl p-6 space-y-3">
              <h3 className="font-display font-semibold mb-2">Metadata</h3>
              <Row label="Token ID" value={c.nft_token_id ?? "—"} mono onCopy={() => c.nft_token_id && copy(c.nft_token_id)} />
              <Row label="Credential ID" value={c.credential_id ?? "—"} mono onCopy={() => c.credential_id && copy(c.credential_id)} />
              <Row label="Chain" value={(c.chain ?? "polygon").toUpperCase()} />
              <Row label="Issued on" value={c.issued_at ?? "—"} />
              <Row label="File hash (SHA-256)" value={c.file_hash ? c.file_hash.slice(0, 22) + "…" : "—"} mono onCopy={() => c.file_hash && copy(c.file_hash)} />
              <Row
                label="Transaction"
                value={c.tx_hash ? shortAddress(c.tx_hash) : "—"}
                mono
                href={c.tx_hash ? explorerUrl(c.tx_hash) : undefined}
                onCopy={() => c.tx_hash && copy(c.tx_hash)}
              />
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-3">Owner</h3>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{owner?.full_name || owner?.username || "—"}</div>
                  <div className="text-xs text-muted-foreground font-mono">{owner?.wallet_address ? shortAddress(owner.wallet_address) : "No wallet linked"}</div>
                </div>
                {owner?.username && (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link to="/passport/$username" params={{ username: owner.username }}><ExternalLink className="h-4 w-4" /> View passport</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {c.credential_id && (
                <>
                  <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
                    <Link to="/verify/$credentialId" params={{ credentialId: c.credential_id }}>
                      <ShieldCheck className="h-4 w-4" /> Verify NFT
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link to="/qr" search={{ id: c.credential_id }}><QrCode className="h-4 w-4" /> Show QR</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, mono, href, onCopy }: { label: string; value: string; mono?: boolean; href?: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm border-b border-border/40 pb-2 last:border-0">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className={`${mono ? "font-mono" : ""} text-primary truncate hover:underline`}>{value}</a>
        ) : (
          <span className={`${mono ? "font-mono" : ""} truncate`}>{value}</span>
        )}
        {onCopy && <button onClick={onCopy} className="text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>}
      </div>
    </div>
  );
}
