import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Masuk — Pentol Berkah Ma'nyuss" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        console.log("[Auth] signInWithPassword →", { email });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log("[Auth] login result:", { user: data?.user?.id, session: !!data?.session, error });
        if (error) throw error;
        toast.success("Selamat datang kembali! 🔥");
        navigate({ to: "/" });
      } else if (mode === "register") {
        console.log("[Auth] signUp →", { email, name });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        console.log("[Auth] signup result:", { user: data?.user?.id, session: !!data?.session, error });
        if (error) throw error;
        if (data.session) {
          toast.success("Akun dibuat & langsung masuk! 🔥");
          navigate({ to: "/" });
        } else {
          toast.success("Akun dibuat! Silakan login.");
          setMode("login");
        }
      } else {
        console.log("[Auth] resetPasswordForEmail →", { email });
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Link reset password terkirim ke email!");
        setMode("login");
      }
    } catch (err: any) {
      console.error("[Auth] error:", err);
      toast.error(err?.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/` });
    if (result.error) {
      toast.error("Gagal masuk dengan Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
          <span className="font-display font-bold text-xl">
            Pentol <span className="text-gradient-flame">Berkah</span>
          </span>
        </Link>

        <div className="glass rounded-3xl p-8 shadow-card">
          <h1 className="font-display font-bold text-2xl mb-1">
            {mode === "login" ? "Selamat Datang" : mode === "register" ? "Buat Akun" : "Lupa Password"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Masuk untuk pesan favoritmu" : mode === "register" ? "Daftar gratis dalam sekejap" : "Kirim link reset ke email"}
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "register" && (
              <Field icon={User} type="text" placeholder="Nama lengkap" value={name} onChange={setName} required />
            )}
            <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} required />
            {mode !== "forgot" && (
              <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} required minLength={6} />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold glow-flame hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Masuk" : mode === "register" ? "Daftar" : "Kirim Link Reset"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">atau</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <button
                onClick={google}
                disabled={loading}
                className="w-full py-3 rounded-2xl glass font-semibold hover:bg-secondary/60 transition-colors flex items-center justify-center gap-2"
              >
                <GoogleIcon /> Lanjut dengan Google
              </button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("forgot")} className="hover:text-foreground">Lupa password?</button>
                <p>
                  Belum punya akun?{" "}
                  <button onClick={() => setMode("register")} className="text-primary font-medium">Daftar</button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p>
                Sudah punya akun?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-medium">Masuk</button>
              </p>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-primary font-medium">Kembali ke login</button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, onChange, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-secondary/40 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );
}
