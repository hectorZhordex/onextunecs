import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Eye, EyeOff, ArrowRight, Headphones } from "lucide-react";

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

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (isSignUp && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);

    const username = isSignUp ? name.trim() : email.split("@")[0];
    onLogin(username);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 bg-background" />
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-25 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff006b 0%, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff390d 0%, transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff006b 0%, transparent 70%)" }}
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-panel p-8 rounded-[2rem]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Headphones className="w-8 h-8 text-white" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">OneTune</h1>
              <p className="text-white/40 text-sm mt-1">Your music universe awaits</p>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              data-testid="button-signin-tab"
              type="button"
              onClick={() => { setIsSignUp(false); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isSignUp
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              data-testid="button-signup-tab"
              type="button"
              onClick={() => { setIsSignUp(true); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isSignUp
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <input
                    data-testid="input-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full glass-card px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm bg-transparent"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && passwordRef.current?.focus()}
              placeholder="Email address"
              className="w-full glass-card px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm bg-transparent"
            />

            <div className="relative">
              <input
                data-testid="input-password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full glass-card px-4 py-3 pr-12 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm bg-transparent"
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

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm text-red-400/80 px-1"
                  data-testid="text-login-error"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              data-testid="button-submit-login"
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/20 text-xs">
              By continuing, you agree to OneTune&apos;s Terms &amp; Privacy Policy
            </p>
          </div>

          {/* Divider + quick access */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            data-testid="button-guest-access"
            type="button"
            onClick={() => onLogin("Guest")}
            className="mt-4 w-full py-3 rounded-xl glass-button text-white/50 hover:text-white text-sm font-medium transition-all duration-300 border border-white/10"
          >
            Continue as Guest
          </button>
        </div>

        {/* Floating music notes */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none text-primary/20 text-2xl select-none"
            style={{
              left: `${[10, 80, 20, 70][i]}%`,
              top: `${[15, 20, 75, 80][i]}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          >
            <Music className="w-5 h-5" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
