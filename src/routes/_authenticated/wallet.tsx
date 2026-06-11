import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { connectWallet, shortAddress, explorerUrl } from "@/lib/web3";
import { Wallet, ExternalLink, Copy, Power, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Wallet — SkillChain" }] }),
  component: WalletPage,
});

function WalletPage() {
  const { user } = useAuth();
  const [addr, setAddr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [txs, setTxs] = useState<{ id: string; title: string; tx_hash: string | null; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("wallet_address").eq("id", user.id).maybeSingle().then(({ data }) => setAddr(data?.wallet_address ?? null));
    supabase.from("credentials").select("id,title,tx_hash,created_at").eq("user_id", user.id).not("tx_hash", "is", null).order("created_at", { ascending: false }).then(({ data }) => setTxs((data as any) ?? []));
  }, [user?.id]);

  const connect = async () => {
    setBusy(true);
    try {
      const a = await connectWallet();
      setAddr(a);
      if (user) await supabase.from("profiles").update({ wallet_address: a }).eq("id", user.id);
      toast.success("Wallet connected");
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };
  const disconnect = async () => {
    if (user) await supabase.from("profiles").update({ wallet_address: null }).eq("id", user.id);
    setAddr(null);
    toast.success("Wallet disconnected");
  };

  return (
    <AppShell title="Wallet">
      <div className="max-w-4xl space-y-6">
        <div className="glass-strong rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full aurora" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Wallet className="h-4 w-4 text-primary" /> MetaMask · Polygon</div>
              {addr ? (
                <>
                  <div className="font-display text-2xl md:text-3xl font-bold mt-2 font-mono">{shortAddress(addr)}</div>
                  <div className="text-xs text-success mt-1 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</div>
                </>
              ) : (
                <>
                  <div className="font-display text-2xl font-bold mt-2">No wallet connected</div>
                  <div className="text-xs text-muted-foreground mt-1">Connect MetaMask to claim ownership of your passport.</div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {addr ? (
                <>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => { navigator.clipboard.writeText(addr); toast.success("Address copied"); }}><Copy className="h-4 w-4" /> Copy</Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={disconnect}><Power className="h-4 w-4" /> Disconnect</Button>
                </>
              ) : (
                <Button onClick={connect} disabled={busy} className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"><Wallet className="h-4 w-4" /> {busy ? "Connecting…" : "Connect MetaMask"}</Button>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-4">Blockchain transactions</h3>
          {txs.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No transactions yet. Anchor a certificate to see your tx history.</div>
          ) : (
            <div className="divide-y divide-border/40">
              {txs.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.title}</div>
                    <div className="text-xs font-mono text-muted-foreground truncate">{t.tx_hash}</div>
                  </div>
                  <a href={explorerUrl(t.tx_hash!)} target="_blank" rel="noreferrer" className="text-primary text-xs inline-flex items-center gap-1 shrink-0 hover:underline">View <ExternalLink className="h-3 w-3" /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
