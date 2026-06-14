import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { triggerWelcome } from "@/components/WelcomeOverlay";

export function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [loading, user, nav]);

  const tabBase =
    "flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition";
  const tabActive = "bg-background text-foreground shadow-sm";
  const tabInactive = "text-muted-foreground hover:text-foreground";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual */}
      <div className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Your credentials, <br /><span className="text-gradient">truly yours.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Join thousands of students and pros minting verifiable skill NFTs on Polygon.
          </p>
        </div>
        <div className="relative text-xs text-muted-foreground font-mono">v1.0 · polygon-mainnet</div>
      </div>

      {/* Form */}
      <div className="min-h-screen flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex items-center justify-between gap-3">
            <Logo />
            <Link
              to="/"
              aria-label="Back to home"
              className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
          <Link
            to="/"
            aria-label="Back to home"
            className="hidden lg:inline-flex absolute top-4 left-4 items-center gap-1.5 rounded-full glass px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>


          {/* Tab switcher */}
          <div className="grid grid-cols-2 w-full glass rounded-lg p-1">
            <Link
              to="/login"
              className={`${tabBase} ${mode === "signin" ? tabActive : tabInactive}`}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className={`${tabBase} ${mode === "signup" ? tabActive : tabInactive}`}
            >
              Create account
            </Link>
          </div>

          {mode === "signin" ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  );
}

function GoogleButton() {
  const onClick = async () => {
    triggerWelcome();
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error("Google sign-in failed");
  };
  return (
    <Button type="button" variant="outline" onClick={onClick} className="w-full glass gap-2 h-11">
      <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/></svg>
      Continue with Google
    </Button>
  );
}

function SignInForm() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    triggerWelcome();
    nav({ to: "/dashboard" });
  };
  return (
    <form onSubmit={submit} className="mt-6 glass rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-xl font-semibold">Welcome back</h3>
      <GoogleButton />
      <Divider />
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
      </div>
      <Button disabled={busy} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground h-11">
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const nav = useNavigate();
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [pw, setPw] = useState(""); const [role, setRole] = useState<"student" | "recruiter">("student");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password: pw,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: name, role },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    triggerWelcome();
    nav({ to: "/dashboard" });
  };
  return (
    <form onSubmit={submit} className="mt-6 glass rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-xl font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" /> Create your passport
      </h3>
      <GoogleButton />
      <Divider />
      <div className="space-y-2"><Label>Full name</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" /></div>
      <div className="space-y-2"><Label>Email</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <div className="space-y-2"><Label>Password</Label>
        <Input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" /></div>
      <div className="space-y-2">
        <Label>I'm a</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["student", "recruiter"] as const).map((r) => (
            <button type="button" key={r} onClick={() => setRole(r)}
              className={`rounded-lg border px-3 py-2.5 text-sm capitalize transition ${
                role === r ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
              }`}>{r}</button>
          ))}
        </div>
      </div>
      <Button disabled={busy} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground h-11">
        {busy ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function Divider() {
  return (
    <div className="relative my-1">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-card px-2 text-muted-foreground">or</span></div>
    </div>
  );
}
