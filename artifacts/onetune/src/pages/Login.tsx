import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";
import { supabase } from "@/lib/supabase";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (isSignUp && !name.trim()) { setError("Please enter your name."); return; }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() },
          },
        });
        if (signUpError) throw signUpError;
        setVerificationSent(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        // App.tsx onAuthStateChange will detect the new session automatically
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      // Make common Supabase error messages more friendly
      if (msg.includes("Invalid login credentials")) {
        setError("Wrong email or password.");
      } else if (msg.includes("already registered") || msg.includes("User already registered")) {
        setError("This email is already registered. Try signing in.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Please check your email and click the verification link first.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // After sign-up: show "check your inbox" screen
  if (verificationSent) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background">
        <OrbsBackground />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm mx-4"
        >
          <div className="glass-panel p-8 rounded-[2rem] flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                We sent a verification email to <span className="text-white font-medium">{email}</span>.<br />
                Click the link to activate your account, then come back to sign in.
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
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background">
      <OrbsBackground />

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
                  key="name-input"
                  data-testid="input-name"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
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
                  if (!email.trim()) { setError("Enter your email above first."); return; }
                  setIsLoading(true);
                  await supabase.auth.resetPasswordForEmail(email.trim());
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
    </div>
  );
}

function OrbsBackground() {
  return (
    <>
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff006b 0%, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[110px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff390d 0%, transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b00ff 0%, transparent 70%)" }}
        animate={{ x: [0, 50, -50, 0], y: [0, 50, 100, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </>
  );
}
