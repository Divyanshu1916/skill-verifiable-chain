import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { BadgeCheck, Hexagon, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { explorerUrl } from "@/lib/web3";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify/$credentialId")({
  head: () => ({ meta: [{ title: "Credential verification — SkillChain" }] }),
  loader: async ({ params }) => {
    const isUuid = /^[0-9a-f]{8}-/.test(params.credentialId);
    const q = supabase
      .from("credentials")
      .select("*, profiles!credentials_user_id_fkey(full_name, username, wallet_address)");
    const { data } = await (isUuid
      ? q.eq("id", params.credentialId).maybeSingle()
      : q.eq("credential_id", params.credentialId).maybeSingle());
    if (!data) throw notFound();
    return { credential: data };
  },
  component: VerifyOne,
  errorComponent: ({ error }) => <Bad msg={error.message} />,
  notFoundComponent: () => <Bad msg="Credential not found in the registry." />,
});

function VerifyOne() {
  const { credential: c } = Route.useLoaderData() as any;
  const owner = c.profiles;
  const ok = c.verified;
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 glass">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <span className="text-xs font-mono text-muted-foreground">QR · on-chain check</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className={`glass-strong rounded-3xl p-8 border ${ok ? "border-success/50" : "border-destructive/50"}`}>
          <div className="flex items-center gap-3 mb-6">
            {ok ? <BadgeCheck className="h-10 w-10 text-success" /> : <XCircle className="h-10 w-10 text-destructive" />}
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{ok ? "Authentic credential" : "Unverified"}</div>
              <h1 className="font-display text-2xl font-bold">{c.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Row label="Issuer" value={c.issuer} />
            <Row label="Issued" value={c.issued_at ?? "—"} />
            <Row label="Holder" value={owner?.full_name ?? owner?.username ?? "—"} />
            <Row label="Chain" value="Polygon" />
            {c.file_hash && <Row label="File hash" value={<span className="font-mono text-[11px]">{c.file_hash.slice(0, 22)}…</span>} />}
            {c.tx_hash && (
              <Row label="Tx hash" value={
                <a href={explorerUrl(c.tx_hash)} target="_blank" rel="noreferrer" className="text-primary font-mono text-[11px] inline-flex items-center gap-1">
                  {c.tx_hash.slice(0, 22)}… <ExternalLink className="h-3 w-3" />
                </a>
              } />
            )}
            <Row label="NFT" value={c.minted ? <span className="inline-flex items-center gap-1 text-accent"><Hexagon className="h-3 w-3" /> {c.nft_token_id}</span> : "Not minted"} />
            <Row label="Status" value={<span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="h-3 w-3" /> Verified</span>} />
          </div>

          {owner?.username && (
            <Button asChild className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Link to="/passport/$username" params={{ username: owner.username }}>View full skill passport</Link>
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          This page anchors a content hash and transaction reference on Polygon. Anyone can verify independently via the explorer link above.
        </p>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function Bad({ msg }: { msg: string }) {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="glass rounded-2xl p-10 text-center max-w-md">
        <XCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h1 className="font-display text-xl font-semibold">Verification failed</h1>
        <p className="text-sm text-muted-foreground mt-2">{msg}</p>
        <Button asChild className="mt-5"><Link to="/">Back to home</Link></Button>
      </div>
    </div>
  );
}
