import { useEffect, useState } from "react";
import { Wallet, CheckCircle2, AlertTriangle, Download, Copy, Power, Hexagon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  connectWallet,
  shortAddress,
  isMetaMaskInstalled,
  hasEthereum,
  getCurrentAccount,
  getChainId,
  networkLabel,
  switchToAmoy,
  POLYGON_AMOY,
  METAMASK_INSTALL_URL,
} from "@/lib/web3";
import { toast } from "sonner";

export function WalletCard({ nftCount = 0 }: { nftCount?: number }) {
  const { user } = useAuth();
  const [addr, setAddr] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const installed = isMetaMaskInstalled();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (hasEthereum()) {
        const [a, c] = await Promise.all([getCurrentAccount(), getChainId()]);
        if (!mounted) return;
        if (a) setAddr(a);
        setChainId(c);
      }
      if (user) {
        const { data } = await supabase.from("profiles").select("wallet_address").eq("id", user.id).maybeSingle();
        if (mounted && data?.wallet_address) setAddr((cur) => cur ?? data.wallet_address);
      }
    })();
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    const onAcc = (a: unknown) => setAddr((a as string[])?.[0] ?? null);
    const onChain = (c: unknown) => setChainId(c as string);
    eth?.on?.("accountsChanged", onAcc);
    eth?.on?.("chainChanged", onChain);
    return () => {
      mounted = false;
      eth?.removeListener?.("accountsChanged", onAcc);
      eth?.removeListener?.("chainChanged", onChain);
    };
  }, [user?.id]);

  const connect = async () => {
    setBusy(true);
    try {
      const a = await connectWallet();
      setAddr(a);
      setChainId(await getChainId());
      if (user) await supabase.from("profiles").update({ wallet_address: a }).eq("id", user.id);
      toast.success("Wallet connected");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (user) await supabase.from("profiles").update({ wallet_address: null }).eq("id", user.id);
    setAddr(null);
    toast.success("Wallet disconnected");
  };

  const onAmoy = chainId?.toLowerCase() === POLYGON_AMOY.chainIdHex;

  if (!installed) {
    return (
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold">MetaMask not detected</div>
              <p className="text-sm text-muted-foreground mt-1">
                Install the MetaMask browser extension or app to connect your wallet and mint credential NFTs on Polygon Amoy.
              </p>
            </div>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 shrink-0">
            <a href={METAMASK_INSTALL_URL} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" /> Install MetaMask
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" /> MetaMask Wallet
          </div>
          {addr ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-success/10 text-success border border-success/30">
              <CheckCircle2 className="h-3 w-3" /> CONNECTED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-muted text-muted-foreground border border-border">
              DISCONNECTED
            </span>
          )}
        </div>

        {addr ? (
          <>
            <div className="font-mono text-lg md:text-xl font-semibold break-all">{shortAddress(addr)}</div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg border border-border/50 bg-card/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Network</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-1">
                  {onAmoy ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                  )}
                  {networkLabel(chainId)}
                </div>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">NFT Credentials</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-1">
                  <Hexagon className="h-3 w-3 text-accent" /> {nftCount}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(addr);
                  toast.success("Address copied");
                }}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
              {!onAmoy && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={async () => {
                    try {
                      await switchToAmoy();
                      setChainId(await getChainId());
                      toast.success("Switched to Polygon Amoy");
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  <Wallet className="h-4 w-4" /> Switch to Amoy
                </Button>
              )}
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a
                  href={`${POLYGON_AMOY.blockExplorerUrls[0]}/address/${addr}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" /> Explorer
                </a>
              </Button>
              <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground" onClick={disconnect}>
                <Power className="h-4 w-4" /> Disconnect
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Connect MetaMask to anchor credentials on Polygon Amoy and prove ownership of your skill passport.
            </p>
            <Button
              onClick={connect}
              disabled={busy}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 shrink-0"
            >
              <Wallet className="h-4 w-4" /> {busy ? "Connecting…" : "Connect MetaMask"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
