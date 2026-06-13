import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, ShieldCheck, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { CredentialQR } from "@/components/CredentialQR";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/_authenticated/qr")({
  head: () => ({ meta: [{ title: "QR Verification — SkillChain" }] }),
  validateSearch: searchSchema,
  component: QRPage,
});

function QRPage() {
  const { user } = useAuth();
  const { id } = useSearch({ from: "/_authenticated/qr" });
  const nav = useNavigate();
  const [creds, setCreds] = useState<{ id: string; credential_id: string | null; title: string }[]>([]);
  const [picked, setPicked] = useState<string | null>(id ?? null);
  const [scanInput, setScanInput] = useState("");
  const [pickedDetail, setPickedDetail] = useState<{
    credential_id: string;
    title: string;
    issuer: string;
    verified: boolean;
    tx_hash: string | null;
    minted: boolean;
    nft_token_id: string | null;
    full_name: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("credentials").select("id,credential_id,title").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      const list = (data as any[]) ?? [];
      setCreds(list);
      if (!picked && list[0]) setPicked(list[0].credential_id);
    });
  }, [user?.id]);

  useEffect(() => {
    if (!picked) { setPickedDetail(null); return; }
    supabase
      .from("credentials")
      .select("credential_id,title,issuer,verified,tx_hash,minted,nft_token_id,user_id")
      .eq("credential_id", picked)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) { setPickedDetail(null); return; }
        const { data: pf } = await supabase.from("profiles").select("full_name").eq("id", data.user_id).maybeSingle();
        setPickedDetail({
          credential_id: data.credential_id,
          title: data.title,
          issuer: data.issuer,
          verified: data.verified,
          tx_hash: data.tx_hash,
          minted: data.minted,
          nft_token_id: data.nft_token_id,
          full_name: pf?.full_name ?? null,
        });
      });
  }, [picked]);

  const scan = (e: React.FormEvent) => {
    e.preventDefault();
    const val = scanInput.trim();
    if (!val) return;
    const m = val.match(/verify\/([^/?#]+)/);
    const cid = m ? m[1] : val;
    nav({ to: "/verify/$credentialId", params: { credentialId: cid } });
  };

  return (
    <AppShell title="QR Verification">
      <div className="max-w-5xl grid lg:grid-cols-2 gap-6">
        {/* Generate */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2"><QrCode className="h-4 w-4 text-primary" /> Generate QR</h3>
          <p className="text-xs text-muted-foreground mt-1">Recruiters scan this to verify your credential.</p>
          <div className="mt-4 space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Credential</label>
            <select value={picked ?? ""} onChange={(e) => setPicked(e.target.value)} className="w-full h-10 rounded-md bg-input/50 border border-border px-3 text-sm">
              {creds.length === 0 && <option value="">No credentials — upload one first</option>}
              {creds.filter((c) => c.credential_id).map((c) => <option key={c.id} value={c.credential_id!}>{c.title}</option>)}
            </select>
          </div>

          {pickedDetail && (
            <div className="mt-6">
              <CredentialQR
                credentialId={pickedDetail.credential_id}
                title={pickedDetail.title}
                issuer={pickedDetail.issuer}
                candidateName={pickedDetail.full_name}
                verified={pickedDetail.verified}
                txHash={pickedDetail.tx_hash}
                minted={pickedDetail.minted}
                nftTokenId={pickedDetail.nft_token_id}
              />
            </div>
          )}
          {picked && !pickedDetail && (
            <div className="mt-6 rounded-2xl bg-white p-6 grid place-items-center">
              <div className="h-[200px] w-[200px] bg-muted animate-pulse rounded-xl" />
            </div>
          )}
          {creds.length === 0 && (
            <Button asChild className="mt-4 w-full" variant="outline"><Link to="/certificates">Upload a certificate</Link></Button>
          )}
        </div>

        {/* Scan */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2"><ScanLine className="h-4 w-4 text-primary" /> Scan / Paste</h3>
          <p className="text-xs text-muted-foreground mt-1">Paste a credential ID or scanned verification URL.</p>
          <form onSubmit={scan} className="mt-4 space-y-3">
            <Input value={scanInput} onChange={(e) => setScanInput(e.target.value)} placeholder="cred_… or https://…/verify/cred_…" />
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
              <ShieldCheck className="h-4 w-4" /> Verify on-chain
            </Button>
          </form>
          <div className="mt-6 text-xs text-muted-foreground">
            Tip — every credential has a unique <span className="font-mono text-primary">credential_id</span> anchored on Polygon. A scan resolves the hash and proves ownership without contacting the issuer.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
