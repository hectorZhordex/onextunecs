import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Music2, Headphones, Radio, Mic2 } from "lucide-react";
import logoImg from "@assets/dotcom_one_(4)_1780057221014.png";
import { supabase } from "@/lib/supabase";

/* ─── Floating music icon particle ─── */
function FloatingIcon({ icon: Icon, x, y, delay, duration, size }: {
  icon: React.ElementType; x: number; y: number; delay: number; duration: number; size: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none text-white/10"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: [0, 0.4, 0.2, 0.5, 0],
        y: [-10, -60, -40, -80, -120],
        rotate: [0, 15, -10, 20, -5],
        x: [0, 20, -15, 10, -20],
        scale: [0.8, 1.1, 0.9, 1.2, 0.7],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon size={size} />
    </motion.div>
  );
}

/* ─── Animated orb ─── */
function Orb({ color, size, x, y, xAnim, yAnim, duration, delay, opacity, blur }: {
  color: string; size: number; x: string; y: string;
  xAnim: number[]; yAnim: number[]; duration: number; delay: number; opacity: number; blur: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: x, top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
      animate={{ x: xAnim, y: yAnim, scale: [1, 1.15, 0.9, 1.1, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── Aurora shimmer strip ─── */
function Aurora() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <motion.div
        className="absolute h-[2px] left-0 right-0"
        style={{
          top: "35%",
          background: "linear-gradient(90deg, transparent 0%, #ff006b 20%, #ff390d 50%, #8b00ff 80%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"], opacity: [0, 0.6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute h-[1px] left-0 right-0"
        style={{
          top: "65%",
          background: "linear-gradient(90deg, transparent 0%, #8b00ff 20%, #ff006b 60%, transparent 100%)",
        }}
        animate={{ x: ["100%", "-100%"], opacity: [0, 0.4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      />
    </motion.div>
  );
}

/* ─── Rotating glow ring around card ─── */
function GlowRing() {
  return (
    <motion.div
      className="absolute inset-[-2px] rounded-[2rem] pointer-events-none"
      style={{
        background: "conic-gradient(from 0deg, transparent 30%, #ff006b 50%, #ff390d 60%, transparent 80%)",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        padding: "1.5px",
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ─── Grid dots background ─── */
function GridDots() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{
        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    />
  );
}

const FLOAT_ICONS = [
  { icon: Music2,    x: 8,  y: 15, delay: 0,   duration: 7,  size: 18 },
  { icon: Headphones,x: 85, y: 10, delay: 1.5, duration: 9,  size: 22 },
  { icon: Radio,     x: 12, y: 70, delay: 3,   duration: 8,  size: 16 },
  { icon: Mic2,      x: 80, y: 65, delay: 0.8, duration: 10, size: 20 },
  { icon: Music2,    x: 50, y: 5,  delay: 2,   duration: 11, size: 14 },
  { icon: Headphones,x: 92, y: 40, delay: 4,   duration: 7,  size: 18 },
  { icon: Radio,     x: 5,  y: 45, delay: 1,   duration: 9,  size: 12 },
  { icon: Mic2,      x: 60, y: 90, delay: 3.5, duration: 8,  size: 16 },
];

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
  const prefersReducedMotion = useReducedMotion();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (isSignUp && !name.trim()) { setError("Please enter your name."); return; }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() } },
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
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background">
        <OrbsLayer reduced={!!prefersReducedMotion} />
        <GridDots />
        <Aurora />
        {FLOAT_ICONS.map((p, i) => <FloatingIcon key={i} {...p} />)}

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm mx-4"
        >
          <div className="relative glass-panel p-8 rounded-[2rem] overflow-hidden flex flex-col items-center text-center gap-5">
            <GlowRing />
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
            >
              <Mail className="w-7 h-7 text-primary" />
            </motion.div>
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
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background">
      {/* Background layers */}
      <OrbsLayer reduced={!!prefersReducedMotion} />
      <GridDots />
      <Aurora />

      {/* Floating music icons */}
      {!prefersReducedMotion && FLOAT_ICONS.map((p, i) => <FloatingIcon key={i} {...p} />)}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="relative glass-panel p-8 rounded-[2rem] overflow-hidden">
          <GlowRing />

          {/* Shimmer inside card */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,0,107,0.06) 0%, transparent 60%, rgba(255,57,13,0.04) 100%)",
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-7 gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="relative">
              <motion.img
                src={logoImg}
                alt="OneTune"
                className="w-14 h-14 object-contain relative z-10"
                animate={{ rotate: [0, 6, -6, 3, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Pulse rings */}
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary/30"
                  style={{ margin: `-${i * 8}px` }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
            </div>
            <div className="text-center">
              <motion.h1
                className="text-2xl font-bold text-white tracking-tight"
                animate={{ opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                OneTune
              </motion.h1>
              <p className="text-white/40 text-sm mt-0.5">Your music universe awaits</p>
            </div>
          </motion.div>

          {/* Toggle */}
          <motion.div
            className="flex bg-white/5 rounded-xl p-1 mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {["Sign In", "Create Account"].map((label, i) => {
              const active = i === 0 ? !isSignUp : isSignUp;
              return (
                <button
                  key={label}
                  data-testid={i === 0 ? "button-signin-tab" : "button-signup-tab"}
                  type="button"
                  onClick={() => { setIsSignUp(i === 1); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </motion.div>

          {/* Form fields — staggered */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AnimatePresence>
              {isSignUp && (
                <motion.input
                  key="name"
                  data-testid="input-name"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full glass-card px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-transparent transition-all"
                />
              )}
            </AnimatePresence>

            <motion.input
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && passwordRef.current?.focus()}
              placeholder="Email address"
              autoComplete="email"
              className="w-full glass-card px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-transparent transition-all"
            />

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
            >
              <input
                data-testid="input-password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full glass-card px-4 py-3 pr-11 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-transparent transition-all"
              />
              <button
                data-testid="button-toggle-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.4 }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              className="w-full mt-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-60 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #ff006b, #ff390d)" }}
            >
              {/* Button shimmer sweep */}
              {!isLoading && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)" }}
                  animate={{ x: ["-100%", "150%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                />
              )}
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </>
              )}
            </motion.button>
          </form>

          {!isSignUp && (
            <motion.p
              className="mt-4 text-center text-xs text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
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
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function OrbsLayer({ reduced }: { reduced: boolean }) {
  if (reduced) return <div className="absolute inset-0 bg-background" />;
  return (
    <>
      {/* Large primary orbs */}
      <Orb color="#ff006b" size={700} x="-15%" y="-20%" xAnim={[0, 80, -40, 0]} yAnim={[0, -60, 40, 0]} duration={18} delay={0} opacity={0.18} blur={140} />
      <Orb color="#ff390d" size={600} x="60%" y="55%" xAnim={[0, -60, 50, 0]} yAnim={[0, 60, -30, 0]} duration={22} delay={2} opacity={0.14} blur={130} />
      <Orb color="#8b00ff" size={500} x="25%" y="30%" xAnim={[0, 40, -60, 20, 0]} yAnim={[0, -40, 60, -20, 0]} duration={16} delay={4} opacity={0.12} blur={110} />

      {/* Smaller accent orbs */}
      <Orb color="#ff006b" size={300} x="75%" y="5%"  xAnim={[0, -30, 30, 0]} yAnim={[0, 40, -20, 0]} duration={12} delay={1} opacity={0.2} blur={80} />
      <Orb color="#ff390d" size={250} x="5%"  y="60%" xAnim={[0, 40, -20, 0]} yAnim={[0, -30, 30, 0]} duration={14} delay={3} opacity={0.18} blur={70} />
      <Orb color="#00d4ff" size={200} x="85%" y="75%" xAnim={[0, -20, 30, 0]} yAnim={[0, -40, 20, 0]} duration={10} delay={6} opacity={0.08} blur={60} />

      {/* Tiny sparkle orbs */}
      <Orb color="#ff006b" size={100} x="40%" y="80%" xAnim={[0, 20, -20, 0]} yAnim={[0, -30, 10, 0]} duration={8}  delay={0.5} opacity={0.3} blur={30} />
      <Orb color="#8b00ff" size={80}  x="60%" y="20%" xAnim={[0, -15, 25, 0]} yAnim={[0, 20, -30, 0]} duration={9}  delay={2.5} opacity={0.25} blur={25} />
    </>
  );
}
