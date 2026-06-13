import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileBadge, Hexagon, ExternalLink, Trash2, BadgeCheck, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { sha256File, fakeTxHash, explorerUrl } from "@/lib/web3";
import { CredentialQR } from "@/components/CredentialQR";

export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({ meta: [{ title: "Certificates — SkillChain" }] }),
  component: CertsPage,
});

type Cred = {
  id: string; title: string; issuer: string; description: string | null;
  file_url: string | null; file_hash: string | null; tx_hash: string | null;
  nft_token_id: string | null; minted: boolean; verified: boolean; issued_at: string | null;
  credential_id: string | null;
};

function CertsPage() {
  const { user } = useAuth();
  const [creds, setCreds] = useState<Cred[]>([]);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [title, setTitle] = useState(""); const [issuer, setIssuer] = useState("");
  const [issuedAt, setIssuedAt] = useState(""); const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    if (!user) return;
    const [{ data }, { data: pf }] = await Promise.all([
      supabase.from("credentials").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    ]);
    setCreds((data as Cred[]) ?? []);
    setProfileName(pf?.full_name ?? null);
  };
  useEffect(() => { refresh(); }, [user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      let file_url: string | null = null;
      let file_hash: string | null = null;
      if (file) {
        file_hash = await sha256File(file);
        const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("certificates").upload(path, file);
        if (upErr) throw upErr;
        file_url = path;
      }
      const tx_hash = fakeTxHash((file_hash ?? title) + user.id);
      const nft_token_id = "#" + Math.floor(Math.random() * 999999).toString(16).padStart(6, "0").toUpperCase();
      const { error } = await supabase.from("credentials").insert({
        user_id: user.id, title, issuer, description: desc || null,
        issued_at: issuedAt || null, file_url, file_hash, tx_hash,
        verified: true, minted: true, nft_token_id,
      });
      if (error) throw error;
      toast.success("Verified · NFT minted", { description: `Token ${nft_token_id} · ${tx_hash.slice(0, 12)}…` });
      setTitle(""); setIssuer(""); setDesc(""); setIssuedAt(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const mint = async (c: Cred) => {
    const token = "#" + Math.floor(Math.random() * 99999).toString(16).padStart(5, "0");
    await supabase.from("credentials").update({ minted: true, nft_token_id: token }).eq("id", c.id);
    toast.success("Credential NFT minted", { description: `Token ${token} · Polygon` });
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("credentials").delete().eq("id", id);
    refresh();
  };

  return (
    <AppShell title="Certificates">
      <div className="grid lg:grid-cols-5 gap-6 max-w-7xl">
        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4 lg:col-span-2 h-fit">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Upload certificate</h3>
          <div className="space-y-2"><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Advanced React Developer" /></div>
          <div className="space-y-2"><Label>Issuer</Label><Input required value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Meta · Coursera · etc." /></div>
          <div className="space-y-2"><Label>Issued on</Label><Input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>File (PDF / image)</Label>
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition p-6 text-center">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-xs mt-2 text-muted-foreground">{file ? file.name : "Click to upload — hashed client-side"}</div>
              <input ref={fileRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <Button disabled={busy} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Anchoring…</> : <><BadgeCheck className="h-4 w-4" /> Anchor on Polygon</>}
          </Button>
        </form>

        <div className="lg:col-span-3 space-y-3">
          {creds.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <FileBadge className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No credentials yet. Upload your first to anchor it on-chain.</p>
            </div>
          ) : creds.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{c.title}</h4>
                    {c.verified && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-success/10 text-success border border-success/30">VERIFIED</span>}
                    {c.minted && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/30">NFT {c.nft_token_id}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.issuer}{c.issued_at ? ` · ${c.issued_at}` : ""}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
                {c.file_hash && (
                  <Meta label="File hash" value={c.file_hash.slice(0, 14) + "…"} mono />
                )}
                {c.tx_hash && (
                  <Meta label="Tx hash" value={
                    <a className="text-primary hover:underline inline-flex items-center gap-1" target="_blank" rel="noreferrer" href={explorerUrl(c.tx_hash)}>
                      {c.tx_hash.slice(0, 14)}… <ExternalLink className="h-3 w-3" />
                    </a>
                  } />
                )}
                <Meta label="Chain" value="Polygon" />
              </div>
              <div className="mt-4 flex gap-2">
                {!c.minted ? (
                  <Button size="sm" onClick={() => mint(c)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
                    <Hexagon className="h-4 w-4" /> Mint NFT badge
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="gap-2"><Hexagon className="h-4 w-4 text-accent" /> Minted</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Meta({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-primary" : ""}`}>{value}</div>
    </div>
  );
}
