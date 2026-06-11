// Lightweight Web3 helpers — MetaMask connect + content hashing.
// Blockchain transactions are simulated client-side for demo purposes;
// in production these would be wired to Thirdweb + Polygon.

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, cb: (...args: unknown[]) => void) => void;
    };
  }
}

export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected. Install MetaMask to continue.");
  }
  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts?.length) throw new Error("No account returned");
  return accounts[0];
}

export function shortAddress(addr?: string | null): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** SHA-256 hex digest of a file's contents. */
export async function sha256File(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return (
    "0x" +
    Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Deterministic-ish fake transaction hash for demo. */
export function fakeTxHash(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return (
    "0x" +
    (hex + crypto.randomUUID().replace(/-/g, "")).slice(0, 64).padEnd(64, "0")
  );
}

export function explorerUrl(tx: string): string {
  return `https://polygonscan.com/tx/${tx}`;
}
