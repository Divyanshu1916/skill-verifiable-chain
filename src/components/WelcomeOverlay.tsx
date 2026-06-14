import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WelcomeCelebration } from "./WelcomeCelebration";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

const FLAG = "skillchain:welcome";
const MIN_MS = 5000;

export function triggerWelcome() {
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {}
}

export function WelcomeOverlay() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("there");
  const [shownAt, setShownAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    if (sessionStorage.getItem(FLAG) !== "1") return;
    sessionStorage.removeItem(FLAG);
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
  }, [user?.id]);

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
    if (shownAt && Date.now() - shownAt < MIN_MS) return; // enforce minimum
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <WelcomeCelebration
          key="welcome"
          userName={name}
          onContinue={handleContinue}
          autoNavigateMs={5000}
        />
      )}
    </AnimatePresence>
  );
}
