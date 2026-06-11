import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/AuthPage";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — SkillChain" },
      { name: "description", content: "Create your SkillChain skill passport." },
    ],
  }),
  component: () => <AuthPage mode="signup" />,
});
