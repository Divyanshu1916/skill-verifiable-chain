import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WelcomeCelebration } from "./WelcomeCelebration";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

const TRIGGER_FLAG = "skillchain:welcome";        // set on successful auth event
const SESSION_FLAG = "skillchain:welcomeShown";   // per browser session (cleared on close)
const MIN_MS = 5000;

export function triggerWelcome() {
  try {
    sessionStorage.setItem(TRIGGER_FLAG, "1");
  } catch {}
}

export function WelcomeOverlay() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState<"new" | "returning">("new");
  const [name, setName] = useState("there");
  const [shownAt, setShownAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading || !user) return;

    const freshAuth = sessionStorage.getItem(TRIGGER_FLAG) === "1";
    const alreadyShown = sessionStorage.getItem(SESSION_FLAG) === "1";

    let nextVariant: "new" | "returning" | null = null;
    if (freshAuth) {
      sessionStorage.removeItem(TRIGGER_FLAG);
      nextVariant = "new";
    } else if (!alreadyShown) {
      // Returning authenticated user: browser/app reopen with existing session
      nextVariant = "returning";
    }

    if (!nextVariant) return;

    sessionStorage.setItem(SESSION_FLAG, "1");
    setVariant(nextVariant);
    setShow(true);
    setShownAt(Date.now());

    const meta = (user.user_metadata?.full_name as string | undefined) ?? "";
    if (meta) setName(meta.split(" ")[0]);
    supabase
      .from("profiles")
      .select("full_name,username")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const n = data?.full_name || data?.username;
        if (n) setName(String(n).split(" ")[0]);
      });
  }, [user?.id, loading]);

  // Lock body scroll & block interaction while overlay is shown
  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [show]);

  const handleContinue = () => {
    if (shownAt && Date.now() - shownAt < MIN_MS) return;
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <WelcomeCelebration
          key="welcome"
          variant={variant}
          userName={name}
          onContinue={handleContinue}
          autoNavigateMs={5000}
        />
      )}
    </AnimatePresence>
  );
}
