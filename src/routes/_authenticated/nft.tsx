import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { NFTCard, type NFTCardData } from "@/components/NFTCard";
import { Hexagon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/nft")({
  head: () => ({ meta: [{ title: "NFT Gallery — SkillChain" }] }),
  component: NFTGallery,
});

function NFTGallery() {
  const { user } = useAuth();
  const [items, setItems] = useState<NFTCardData[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.from("credentials").select("id,title,issuer,tx_hash,nft_token_id,minted,verified,issued_at")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as NFTCardData[]) ?? []));
  }, [user?.id]);

  const minted = items.filter((i) => i.minted);
  const pending = items.filter((i) => !i.minted);

  return (
    <AppShell title="NFT Gallery">
      <div className="max-w-7xl space-y-8">
        <div className="glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Your credential NFTs</h2>
            <p className="text-sm text-muted-foreground">{minted.length} minted · {pending.length} ready to mint</p>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2">
            <Link to="/certificates"><Sparkles className="h-4 w-4" /> Upload & mint new</Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <Hexagon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No credentials yet. Upload one to mint your first NFT.</p>
            <Button asChild className="mt-4" onClick={() => nav({ to: "/certificates" })}>
              <Link to="/certificates">Get started</Link>
            </Button>
          </div>
        ) : (
          <>
            {minted.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-4">Minted</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {minted.map((c, i) => <NFTCard key={c.id} c={c} hue={i * 25} />)}
                </div>
              </div>
            )}
            {pending.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-4">Ready to mint</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                  {pending.map((c, i) => <NFTCard key={c.id} c={c} hue={i * 25 + 50} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
