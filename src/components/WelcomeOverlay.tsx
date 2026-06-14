import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WelcomeCelebration } from "./WelcomeCelebration";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

const FLAG = "skillchain:welcome";

export function triggerWelcome() {
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {}
}

export function WelcomeOverlay() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("there");

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    if (sessionStorage.getItem(FLAG) !== "1") return;
    sessionStorage.removeItem(FLAG);
    setShow(true);

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

  return (
    <AnimatePresence>
      {show && (
        <WelcomeCelebration
          key="welcome"
          userName={name}
          onContinue={() => setShow(false)}
          autoNavigateMs={5000}
        />
      )}
    </AnimatePresence>
  );
}
