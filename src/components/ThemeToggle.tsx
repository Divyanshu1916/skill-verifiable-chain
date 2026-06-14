import { Sun, Moon, Monitor, Check, Palette } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useTheme, type Theme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; icon: typeof Sun; emoji: string }[] = [
  { value: "light", label: "Light", icon: Sun, emoji: "☀️" },
  { value: "system", label: "System", icon: Monitor, emoji: "💻" },
  { value: "dark", label: "Dark", icon: Moon, emoji: "🌙" },
];

export function ThemeToggle({ compact = true }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const Active = resolvedTheme === "dark" ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={compact ? "icon" : "sm"}
          variant="ghost"
          aria-label="Toggle theme"
          className={cn("h-9", compact ? "w-9" : "gap-2 px-3", "text-muted-foreground hover:text-foreground")}
        >
          <Active className="h-5 w-5 transition-transform duration-300" />
          {!compact && <span>Theme</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 glass-strong border-border/60 rounded-xl p-1.5 animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
          <Palette className="h-3.5 w-3.5" /> Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        {options.map((opt) => {
          const active = theme === opt.value;
          const Icon = opt.icon;
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => setTheme(opt.value)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition-colors",
                active && "bg-gradient-to-r from-primary/15 to-accent/15 text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              <span className="flex-1">{opt.label}</span>
              <span aria-hidden className="text-xs opacity-70">{opt.emoji}</span>
              {active && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
