import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type NotificationType =
  | "certificate_verified"
  | "nft_minted"
  | "wallet_connected"
  | "wallet_disconnected"
  | "recruiter_view"
  | "credential_verified"
  | "reputation_updated"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  href?: string;
  createdAt: number;
  read: boolean;
}

interface Ctx {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  add: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  remove: (id: string) => void;
}

const NotificationsContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "skillchain-notifications";

const seed = (): AppNotification[] => {
  const now = Date.now();
  const m = (n: number) => now - n * 60_000;
  return [
    { id: "n1", type: "certificate_verified", title: "Certificate Verified", description: "Your 'Advanced React' certificate is now verified on-chain.", href: "/certificates", createdAt: m(3), read: false },
    { id: "n2", type: "nft_minted", title: "NFT Credential Minted", description: "Skill passport NFT #1284 minted successfully.", href: "/nft", createdAt: m(18), read: false },
    { id: "n3", type: "recruiter_view", title: "Recruiter Viewed Profile", description: "A recruiter from Acme Labs viewed your passport.", href: "/reputation", createdAt: m(55), read: false },
    { id: "n4", type: "wallet_connected", title: "Wallet Connected", description: "0x9F…b21 linked to your SkillChain account.", href: "/wallet", createdAt: m(120), read: true },
    { id: "n5", type: "reputation_updated", title: "Reputation Score Updated", description: "Your on-chain reputation rose to 842 (+14).", href: "/reputation", createdAt: m(220), read: true },
    { id: "n6", type: "credential_verified", title: "Credential Verified", description: "Your Solidity credential was verified by 3 peers.", href: "/verify", createdAt: m(480), read: true },
    { id: "n7", type: "system", title: "Welcome to SkillChain", description: "Explore your dashboard to mint your first skill NFT.", href: "/dashboard", createdAt: m(1440), read: true },
  ];
};

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setNotifications(JSON.parse(raw));
      else setNotifications(seed());
    } catch {
      setNotifications(seed());
    }
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  const markRead = useCallback((id: string) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  }, []);
  const add = useCallback((n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((p) => [{ ...n, id: crypto.randomUUID(), createdAt: Date.now(), read: false }, ...p]);
  }, []);
  const remove = useCallback((id: string) => {
    setNotifications((p) => p.filter((n) => n.id !== id));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, add, remove }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

export function formatRelative(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
