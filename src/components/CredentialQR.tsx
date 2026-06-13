import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Download,
  Share2,
  Copy,
  BadgeCheck,
  ShieldCheck,
  Hexagon,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { explorerUrl, shortAddress } from "@/lib/web3";

export type CredentialQRProps = {
  credentialId: string;
  title: string;
  issuer: string;
  candidateName?: string | null;
  verified: boolean;
  txHash?: string | null;
  minted?: boolean;
  nftTokenId?: string | null;
  compact?: boolean;
};

export function CredentialQR({
  credentialId,
  title,
  issuer,
  candidateName,
  verified,
  txHash,
  minted,
  nftTokenId,
  compact,
}: CredentialQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${origin}/verify/${credentialId}`;

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillchain-qr-${credentialId.replace(/[^a-z0-9_-]/gi, "_")}.png`;
    a.click();
    toast.success("QR code downloaded");
  };

  const shareQR = async () => {
    const shareData = {
      title: `${title} — SkillChain Verification`,
      text: `Verify ${title} issued by ${issuer} on SkillChain`,
      url: verifyUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(verifyUrl);
        toast.success("Verification link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Verification link copied");
  };

  const qrSize = compact ? 128 : 200;

  return (
    <div className={`glass rounded-2xl p-5 ${compact ? "" : "lg:p-6"}`}>
      <div className={`flex gap-5 ${compact ? "flex-col" : "flex-col lg:flex-row"}`}>
        {/* QR Code */}
        <div className="shrink-0">
          <Link
            to="/verify/$credentialId"
            params={{ credentialId }}
            className="block rounded-xl overflow-hidden bg-white p-2 hover:ring-2 hover:ring-primary/40 transition"
          >
            <QRCodeCanvas
              ref={canvasRef}
              value={verifyUrl}
              size={qrSize}
              bgColor="#ffffff"
              fgColor="#0a0a16"
              level="M"
            />
          </Link>
          <p className="text-[10px] text-center text-muted-foreground mt-1.5 font-mono uppercase tracking-wider">
            Scan to verify
          </p>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Candidate</div>
            <div className="font-semibold truncate">{candidateName || "—"}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Skill / Credential</div>
            <div className="font-semibold truncate">{title}</div>
            <div className="text-xs text-muted-foreground truncate">{issuer}</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {verified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-success/10 text-success border border-success/30">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-muted text-muted-foreground border border-border">
                <ShieldCheck className="h-3 w-3" /> Unverified
              </span>
            )}
            {minted && nftTokenId && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded bg-accent/10 text-accent border border-accent/30">
                <Hexagon className="h-3 w-3" /> {nftTokenId}
              </span>
            )}
          </div>

          {txHash && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Blockchain Proof</div>
              <a
                href={explorerUrl(txHash)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-primary inline-flex items-center gap-1 hover:underline"
              >
                {shortAddress(txHash)} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {txHash && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Transaction Hash</div>
              <div className="text-xs font-mono truncate" title={txHash}>
                {txHash}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button size="sm" variant="outline" className="gap-2 flex-1 min-w-[120px]" onClick={downloadQR}>
          <Download className="h-4 w-4" /> Download QR
        </Button>
        <Button size="sm" variant="outline" className="gap-2 flex-1 min-w-[120px]" onClick={shareQR}>
          <Share2 className="h-4 w-4" /> Share QR
        </Button>
        <Button size="sm" variant="outline" className="gap-2 flex-1 min-w-[120px]" onClick={copyLink}>
          <LinkIcon className="h-4 w-4" /> Copy Link
        </Button>
      </div>
    </div>
  );
}
