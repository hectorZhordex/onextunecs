import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";
import { supabase } from "@/lib/supabase";

/* ─── Drifting smoke orbs ─── */
function SmokeOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 650, height: 650, left: "-15%", top: "-10%",
          background: "radial-gradient(circle, rgba(255,0,107,0.22) 0%, rgba(255,0,107,0.06) 50%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ x: [0, 60, 20, 80, 0], y: [0, 40, -20, 60, 0], scale: [1, 1.08, 0.95, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600, right: "-12%", bottom: "-15%",
          background: "radial-gradient(circle, rgba(255,57,13,0.2) 0%, rgba(255,57,13,0.06) 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, -50, -20, -70, 0], y: [0, -50, 20, -40, 0], scale: [1, 1.1, 0.92, 1.06, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500, left: "30%", top: "25%",
          background: "radial-gradient(circle, rgba(139,0,255,0.14) 0%, rgba(139,0,255,0.04) 50%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{ x: [0, 30, -40, 20, 0], y: [0, -30, 40, -20, 0], scale: [1, 0.9, 1.12, 0.97, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const year = new Date().getFullYear();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) { setError("Authentication is not configured."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (isSignUp && !name.trim()) { setError("Please enter your name."); return; }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (err) throw err;
        setVerificationSent(true);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      if (msg.includes("Invalid login credentials")) setError("Wrong email or password.");
      else if (msg.includes("already registered") || msg.includes("User already registered")) setError("Email already registered. Try signing in.");
      else if (msg.includes("Email not confirmed")) setError("Please verify your email first.");
      else setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (verificationSent) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-background">
        <SmokeOrbs />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm mx-4"
        >
          <div className="glass-panel p-8 rounded-[2rem] flex flex-col items-center text-center gap-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                We sent a verification link to{" "}
                <span className="text-white font-medium">{email}</span>.<br />
                Click it to activate your account, then sign in.
              </p>
            </div>
            <button
              onClick={() => { setVerificationSent(false); setIsSignUp(false); }}
              className="w-full py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              Back to Sign In
            </button>
          </div>
        </motion.div>
        <p className="relative z-10 mt-8 text-white/20 text-xs">
          © OneTune {year}. All Rights Reserved
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-background">
      <SmokeOrbs />

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="glass-panel p-8 rounded-[2rem]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-7 gap-3">
            <motion.img
              src={logoImg}
              alt="OneTune"
              className="w-14 h-14 object-contain"
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">OneTune</h1>
              <p className="text-white/40 text-sm mt-0.5">Your music universe awaits</p>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-5">
            <button
              data-testid="button-signin-tab"
              type="button"
              onClick={() => { setIsSignUp(false); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isSignUp ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              data-testid="button-signup-tab"
              type="button"
              onClick={() => { setIsSignUp(true); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isSignUp ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AnimatePresence>
              {isSignUp && (
                <motion.input
                  key="name"
                  data-testid="input-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full glass-card px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-transparent"
                />
              )}
            </AnimatePresence>

            <input
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && passwordRef.current?.focus()}
              placeholder="Email address"
              autoComplete="email"
              className="w-full glass-card px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-transparent"
            />

            <div className="relative">
              <input
                data-testid="input-password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full glass-card px-4 py-3 pr-11 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-transparent"
              />
              <button
                data-testid="button-toggle-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400/90 px-1"
                  data-testid="text-login-error"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              data-testid="button-submit-login"
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {!isSignUp && (
            <p className="mt-4 text-center text-xs text-white/30">
              Forgot password?{" "}
              <button
                type="button"
                onClick={async () => {
                  if (!supabase) { setError("Authentication is not configured."); return; }
                  if (!email.trim()) { setError("Enter your email above first."); return; }
                  setIsLoading(true);
                  await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: window.location.origin,
                  });
                  setIsLoading(false);
                  setError("");
                  alert(`Password reset email sent to ${email}`);
                }}
                className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
              >
                Reset it
              </button>
            </p>
          )}
        </div>
      </motion.div>

      <p className="relative z-10 mt-8 text-white/20 text-xs tracking-wide">
        © OneTune {year}. All Rights Reserved
      </p>
    </div>
  );
}
