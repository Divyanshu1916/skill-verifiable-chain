import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WelcomeCelebration } from "@/components/WelcomeCelebration";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — SkillChain" }] }),
  component: WelcomePage,
});

function WelcomePage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [name, setName] = useState("there");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }
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
  }, [user, loading, nav]);

  return (
    <WelcomeCelebration
      userName={name}
      onContinue={() => nav({ to: "/dashboard" })}
    />
  );
}
