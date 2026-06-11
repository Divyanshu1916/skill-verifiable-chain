import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/AuthPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SkillChain" },
      { name: "description", content: "Sign in to your SkillChain account." },
    ],
  }),
  component: () => <AuthPage mode="signin" />,
});
