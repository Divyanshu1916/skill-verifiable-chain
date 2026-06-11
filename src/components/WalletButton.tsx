import { useEffect, useState } from "react";
import { Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectWallet, shortAddress } from "@/lib/web3";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [addr, setAddr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("wallet_address")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setAddr(data?.wallet_address ?? null));
  }, [user?.id]);

  const onClick = async () => {
    setBusy(true);
    try {
      const a = await connectWallet();
      setAddr(a);
      if (user) {
        await supabase.from("profiles").update({ wallet_address: a }).eq("id", user.id);
      }
      toast.success("Wallet connected", { description: shortAddress(a) });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (addr) {
    return (
      <Button variant="outline" size={compact ? "sm" : "default"} className="gap-2 font-mono text-xs">
        <CheckCircle2 className="h-4 w-4 text-success" />
        {shortAddress(addr)}
      </Button>
    );
  }

  return (
    <Button onClick={onClick} disabled={busy} size={compact ? "sm" : "default"} className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
      <Wallet className="h-4 w-4" />
      {busy ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
