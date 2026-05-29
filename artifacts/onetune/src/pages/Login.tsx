import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters."); return; }
    if (isSignUp && !name.trim()) { setError("Please enter your name."); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    const username = isSignUp ? name.trim() : email.split("@")[0];
    onLogin(username);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-background" />

      {/* Orbs */}
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

      {/* Card */}
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
              style={{ filter: "drop-shadow(0 0 14px rgba(255,0,107,0.7))" }}
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
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!isSignUp ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              data-testid="button-signup-tab"
              type="button"
              onClick={() => { setIsSignUp(true); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isSignUp ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
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
                  initial={{ opacity: 0, height: 0 }}
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
                autoComplete="current-password"
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

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            data-testid="button-guest-access"
            type="button"
            onClick={() => onLogin("Guest")}
            className="mt-3 w-full py-3 rounded-xl glass-button text-white/40 hover:text-white text-sm font-medium transition-all border border-white/10"
          >
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
