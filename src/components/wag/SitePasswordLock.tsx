import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight, AlertCircle, Sparkles, CheckCircle2, UserPlus, ChevronRight } from "lucide-react";
import bhoiLogo from "@/assets/Bhoi.png";

interface SitePasswordLockProps {
  onUnlock: () => void;
}

// Allowed default passwords
const DEFAULT_PASSWORDS = ["123456", "united2026", "samaj2026", "admin123"];

export function SitePasswordLock({ onUnlock }: SitePasswordLockProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [remember, setRemember] = useState(true);

  // Read site access password strictly from environment variable (.env)
  const envPassword = (import.meta.env.VITE_SITE_ACCESS_PASSWORD || "123456").trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter the site password");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (password.trim() === envPassword) {
        setIsSuccess(true);
        if (remember) {
          localStorage.setItem("site_access_unlocked", "true");
        } else {
          sessionStorage.setItem("site_access_unlocked", "true");
        }
        setTimeout(() => {
          onUnlock();
        }, 700);
      } else {
        setIsSubmitting(false);
        setError("Incorrect site password. Check your .env file!");
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      {!isSuccess ? (
        <motion.div
          key="lockscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-[#1C100B] via-[#2D1B13] to-[#0D0705] p-4 text-white overflow-y-auto"
        >
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#F97316]/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-10 left-10 w-64 h-64 bg-orange-600/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Floating Subtle Diamond Mesh Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Main Glassmorphic Lock Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)] text-center overflow-hidden"
          >
            {/* Top Security Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
              <span>Protected Portal Access</span>
            </div>

            {/* Brand Logo & Tagline */}
            <div className="mx-auto mb-6 flex flex-col items-center justify-center gap-1 group">
              <img src={bhoiLogo} alt="BHOI Logo" className="h-16 w-auto object-contain drop-shadow-md group-hover:scale-[1.02] transition-transform" />
              <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider leading-none">
                Connect. Empower. Grow.
              </span>
            </div>

            {/* Description Banner */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-6 text-left flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-white/80 leading-relaxed">
                Direct access is restricted. Please enter the authorized password to view this website.
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5 ml-1">
                  Site Access Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter access password..."
                    autoFocus
                    className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/10 border ${
                      error ? "border-red-500 ring-2 ring-red-500/30 animate-shake" : "border-white/20 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/30"
                    } text-white placeholder-white/40 text-sm font-medium transition focus:outline-none backdrop-blur-md`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-300 bg-red-500/20 border border-red-500/40 px-3 py-2 rounded-lg text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Remember checkbox & Hint */}
              <div className="flex items-center justify-between text-xs text-white/70 px-1 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#F97316] focus:ring-[#F97316]"
                  />
                  <span>Remember on this browser</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C] text-white font-bold text-sm shadow-lg shadow-[#F97316]/30 hover:shadow-[#F97316]/50 hover:scale-[1.02] active:scale-[0.98] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Unlock Website</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Are you a Bhoi? Direct Registration Box */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#F97316]/20 to-orange-600/15 border border-[#F97316]/40 text-left relative overflow-hidden group hover:border-[#F97316]/70 transition-all shadow-md">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#F97316]/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-4 h-4 text-[#F97316]" />
                <h4 className="font-bold text-xs text-amber-200 uppercase tracking-wider">Are you a Bhoi member?</h4>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-normal">
                Register yourself now to join our global community network & access all features!
              </p>
              <Link
                to="/register"
                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#F97316] text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#F97316]/30 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <span>Register Yourself Here</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Footer Notice */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-white/50 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
              <span>BHOI &copy; {new Date().getFullYear()} — Secured Portal</span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* Success Animation */
        <motion.div
          key="unlocksuccess"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1C100B] text-white p-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4 text-emerald-400 shadow-2xl shadow-emerald-500/30"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Access Granted!</h2>
          <p className="text-sm text-emerald-300 mt-1 font-medium">Unlocking BHOI...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
