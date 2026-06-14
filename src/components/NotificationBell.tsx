import { Bell, Check, CheckCheck, FileBadge, Hexagon, Wallet, Eye, ShieldCheck, TrendingUp, Megaphone, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, formatRelative, type NotificationType } from "@/lib/notifications-context";
import { cn } from "@/lib/utils";

const iconFor: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  certificate_verified: FileBadge,
  nft_minted: Hexagon,
  wallet_connected: Wallet,
  wallet_disconnected: Wallet,
  recruiter_view: Eye,
  credential_verified: ShieldCheck,
  reputation_updated: TrendingUp,
  system: Megaphone,
};

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className="relative h-9 w-9"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-semibold text-primary-foreground flex items-center justify-center shadow-[0_0_10px_oklch(0.82_0.17_200/0.5)] animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[360px] sm:w-[400px] p-0 glass-strong border-border/60 rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                {unreadCount} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all
          </Button>
        </div>

        <ScrollArea className="max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
              You're all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {notifications.map((n) => {
                const Icon = iconFor[n.type];
                const body = (
                  <div className="flex gap-3 px-4 py-3">
                    <div
                      className={cn(
                        "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border",
                        n.read
                          ? "bg-muted/40 border-border/40 text-muted-foreground"
                          : "bg-gradient-to-br from-primary/15 to-accent/15 border-primary/30 text-primary shadow-[0_0_14px_oklch(0.82_0.17_200/0.25)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className={cn("text-sm leading-snug truncate", n.read ? "text-foreground/80" : "font-semibold text-foreground")}>
                          {n.title}
                        </p>
                        {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0 shadow-[0_0_8px_oklch(0.82_0.17_200/0.8)]" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.description}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          {formatRelative(n.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {!n.read && (
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(n.id); }}
                              className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                              aria-label="Mark as read"
                            >
                              <Check className="h-3 w-3" /> Read
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(n.id); }}
                            className="text-muted-foreground/60 hover:text-destructive p-0.5"
                            aria-label="Dismiss"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                const classes = cn(
                  "block transition-colors hover:bg-accent/30",
                  !n.read && "bg-primary/[0.04]",
                );
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link to={n.href as string} className={classes} onClick={() => markRead(n.id)}>
                        {body}
                      </Link>
                    ) : (
                      <div className={classes}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="px-4 py-2 border-t border-border/40 text-center">
          <span className="text-[11px] text-muted-foreground">Realtime updates from your on-chain activity</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
