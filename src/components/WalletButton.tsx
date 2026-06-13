import { useEffect, useState } from "react";
import { Wallet, CheckCircle2, Download, AlertTriangle, Power, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletButton({ compact = false }: { compact?: boolean }) {
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
        const { data } = await supabase
          .from("profiles")
          .select("wallet_address")
          .eq("id", user.id)
          .maybeSingle();
        if (mounted && data?.wallet_address) setAddr((cur) => cur ?? data.wallet_address);
      }
    })();

    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    const onAccounts = (accs: unknown) => {
      const a = (accs as string[])?.[0] ?? null;
      setAddr(a);
      if (user) supabase.from("profiles").update({ wallet_address: a }).eq("id", user.id);
    };
    const onChain = (cid: unknown) => setChainId(cid as string);
    eth?.on?.("accountsChanged", onAccounts);
    eth?.on?.("chainChanged", onChain);
    return () => {
      mounted = false;
      eth?.removeListener?.("accountsChanged", onAccounts);
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
      toast.success("Wallet connected", { description: shortAddress(a) });
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

  const switchNet = async () => {
    try {
      await switchToAmoy();
      setChainId(await getChainId());
      toast.success("Switched to Polygon Amoy");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!installed) {
    return (
      <Button
        asChild
        size={compact ? "sm" : "default"}
        variant="outline"
        className="gap-2"
      >
        <a href={METAMASK_INSTALL_URL} target="_blank" rel="noreferrer">
          <Download className="h-4 w-4" /> Install MetaMask
        </a>
      </Button>
    );
  }

  if (addr) {
    const onAmoy = chainId?.toLowerCase() === POLYGON_AMOY.chainIdHex;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={compact ? "sm" : "default"} className="gap-2 font-mono text-xs">
            {onAmoy ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )}
            {shortAddress(addr)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Network</div>
            <div className="text-sm font-medium">{networkLabel(chainId)}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(addr);
              toast.success("Address copied");
            }}
          >
            <Copy className="h-4 w-4 mr-2" /> Copy address
          </DropdownMenuItem>
          {!onAmoy && (
            <DropdownMenuItem onClick={switchNet}>
              <Wallet className="h-4 w-4 mr-2" /> Switch to Polygon Amoy
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={disconnect}>
            <Power className="h-4 w-4 mr-2" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={busy}
      size={compact ? "sm" : "default"}
      className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
    >
      <Wallet className="h-4 w-4" />
      {busy ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
