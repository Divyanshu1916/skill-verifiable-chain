import { Link } from "@tanstack/react-router";
import { Hexagon, BadgeCheck, ExternalLink } from "lucide-react";

export type NFTCardData = {
  id: string;
  title: string;
  issuer: string;
  tx_hash?: string | null;
  nft_token_id?: string | null;
  minted?: boolean;
  verified?: boolean;
  issued_at?: string | null;
};

export function NFTCard({ c, hue = 0 }: { c: NFTCardData; hue?: number }) {
  const grad = `linear-gradient(135deg, oklch(0.55 0.2 ${195 + hue}), oklch(0.5 0.22 ${305 + hue}))`;
  return (
    <Link to="/nft/$id" params={{ id: c.id }} className="group block">
      <div className="glass-strong rounded-2xl p-5 transition hover:border-primary/50 hover:-translate-y-1">
        <div className="relative aspect-[5/4] rounded-xl overflow-hidden mb-4" style={{ background: grad }}>
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Hexagon className="h-20 w-20 text-white/90 drop-shadow-2xl animate-float" strokeWidth={1.2} />
          </div>
          <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider text-white/90 bg-black/30 backdrop-blur px-2 py-1 rounded">
            {c.nft_token_id || "#PENDING"}
          </div>
          {c.verified && (
            <div className="absolute top-3 right-3 text-[10px] inline-flex items-center gap-1 bg-success/90 text-success-foreground px-2 py-1 rounded">
              <BadgeCheck className="h-3 w-3" /> Verified
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display font-semibold truncate">{c.title}</div>
            <div className="text-xs text-muted-foreground truncate">{c.issuer}</div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
        </div>
      </div>
    </Link>
  );
}
