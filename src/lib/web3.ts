// MetaMask + Polygon Amoy testnet helpers.
// Blockchain transactions are simulated client-side for demo purposes.

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, cb: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
    };
  }
}

// Polygon Amoy testnet
export const POLYGON_AMOY = {
  chainIdHex: "0x13882",
  chainIdDec: 80002,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};

export const KNOWN_NETWORKS: Record<string, string> = {
  "0x1": "Ethereum Mainnet",
  "0x89": "Polygon Mainnet",
  "0x13882": "Polygon Amoy",
  "0xaa36a7": "Sepolia",
};

export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
}

export function hasEthereum(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function connectWallet(): Promise<string> {
  if (!hasEthereum()) {
    throw new Error("MetaMask not detected. Install MetaMask to continue.");
  }
  const accounts = (await window.ethereum!.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts?.length) throw new Error("No account returned");
  // Best-effort switch to Polygon Amoy
  try {
    await switchToAmoy();
  } catch {
    /* user can switch later */
  }
  return accounts[0];
}

export async function switchToAmoy(): Promise<void> {
  if (!hasEthereum()) throw new Error("MetaMask not detected");
  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_AMOY.chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: POLYGON_AMOY.chainIdHex,
            chainName: POLYGON_AMOY.chainName,
            nativeCurrency: POLYGON_AMOY.nativeCurrency,
            rpcUrls: POLYGON_AMOY.rpcUrls,
            blockExplorerUrls: POLYGON_AMOY.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export async function getChainId(): Promise<string | null> {
  if (!hasEthereum()) return null;
  try {
    return (await window.ethereum!.request({ method: "eth_chainId" })) as string;
  } catch {
    return null;
  }
}

export async function getCurrentAccount(): Promise<string | null> {
  if (!hasEthereum()) return null;
  try {
    const accs = (await window.ethereum!.request({ method: "eth_accounts" })) as string[];
    return accs?.[0] ?? null;
  } catch {
    return null;
  }
}

export function networkLabel(chainId?: string | null): string {
  if (!chainId) return "Unknown";
  return KNOWN_NETWORKS[chainId.toLowerCase()] ?? `Chain ${parseInt(chainId, 16)}`;
}

export function shortAddress(addr?: string | null): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

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
  return `${POLYGON_AMOY.blockExplorerUrls[0]}/tx/${tx}`;
}

export const METAMASK_INSTALL_URL = "https://metamask.io/download/";
