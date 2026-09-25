import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Key } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { dashHomeFor } from "@/components/wag/Navbar";
import { PageTransition } from "@/components/wag/primitives";
import { api } from "@/lib/api";
import loginVideo from "@/assets/login.mp4";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || "",
    };
  },
  head: () => ({ meta: [{ title: "Login — BHOI" }] }),
  component: App,
});

interface DemoAccount {
  u: string;
  p: string;
  label: string;
  name: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { u: "admin", p: "admin123", label: "Super Admin", name: "System Root" },
  { u: "mehul@samaj.org", p: "admin123", label: "Samaj Admin", name: "Mehul Solanki" },
  { u: "rohit@example.com", p: "admin123", label: "Samaj Member", name: "Rohit Patel" },
  { u: "rutvika@gmail.com", p: "Admin@123", label: "Samaj Admin", name: "Rutvika Jinjala" },
  { u: "ruta@gmail.com", p: "Admin@123", label: "Samaj Admin", name: "Ruta Ahir" },
  { u: "harshilshah_496", p: "Admin@123", label: "Samaj Member", name: "Harshil Shah" },
];

function App() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { loginWithApi } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // States for verification flow in login
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [isVerifyingLoginOtp, setIsVerifyingLoginOtp] = useState(false);

  // States for forgot password flow
  const [forgotStep, setForgotStep] = useState(0); // 0 = login, 1 = enter email, 2 = enter otp, 3 = reset password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Quick Demo Pre-fill state
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleDemoFill = (acc: DemoAccount) => {
    setEmail(acc.u);
    setPassword(acc.p);
    setIsDemoOpen(false);
    toast.success(`Prefilled as ${acc.label} (${acc.name})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email/phone and a valid password.");
      return;
    }

    setIsLoading(true);
    try {
      const u = await loginWithApi(email, password);
      toast.success("Success! Welcome back to BHOI.");
      setTimeout(() => {
        if (search?.redirect) {
          navigate({ to: search.redirect });
        } else {
          navigate({ to: dashHomeFor(u.role) });
        }
      }, 800);
    } catch (err: any) {
      const errMsg = err.message || "";
      if (errMsg.includes("Please verify your email before logging in.")) {
        try {
          await api.registerSendOTP(email);
          toast.info("A verification OTP has been sent to your email.");
        } catch (sendErr) {
          console.error("Failed to automatically send OTP: ", sendErr);
        }
        setUnverifiedEmail(email);
        toast.error("Please verify your email before logging in.");
      } else {
        toast.error(errMsg || "Authentication failed.");
      }
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-[100dvh] w-full text-white font-sans flex flex-col justify-between overflow-x-hidden selection:bg-orange-500 selection:text-white">
        {/* Background Video */}
        <video
          src={loginVideo}
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none scale-105"
        />

        {/* Video Overlay with ambient backdrop blur */}
        <div className="fixed inset-0 bg-gradient-to-tr from-black/95 via-black/80 to-[#1C0E06]/90 backdrop-blur-[2px] z-[1] pointer-events-none" />

        {/* TOP HEADER */}
        <header className="w-full max-w-7xl mx-auto px-6 pt-6 pb-2 z-20 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FB923C] to-[#EA580C] flex items-center justify-center shadow-[0_6px_24px_rgba(234,88,12,0.4)] border border-white/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="7" r="2.5" fill="currentColor" />
                <path d="M7.5 15.5C7.5 13 9.5 11.5 12 11.5C14.5 11.5 16.5 13 16.5 15.5" strokeLinecap="round" strokeWidth="1.8" />
                <circle cx="7.5" cy="9.5" r="1.8" fill="currentColor" className="opacity-80" />
                <path d="M4.5 16C4.5 14.2 5.8 13.2 7.5 13.2" strokeLinecap="round" strokeWidth="1.5" className="opacity-80" />
                <circle cx="16.5" cy="9.5" r="1.8" fill="currentColor" className="opacity-80" />
                <path d="M16.5 13.2C18.2 13.2 19.5 14.2 19.5 16" strokeLinecap="round" strokeWidth="1.5" className="opacity-80" />
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-white tracking-tight leading-none drop-shadow-md">
                BHOI
              </h1>
              <p className="text-[10px] text-orange-400 font-bold tracking-wider uppercase mt-0.5">
                Connect. Empower. Grow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDemoOpen(!isDemoOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-400/40 bg-orange-500/20 hover:bg-orange-500/30 text-xs font-bold text-orange-300 transition-all backdrop-blur-md shadow-sm active:scale-95 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-orange-400" />
              <span>Quick Accounts</span>
            </button>
            <Link
              to="/register"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all backdrop-blur-md shadow-lg active:scale-95"
            >
              Need an account? Register
            </Link>
          </div>
        </header>

        {/* MAIN BODY CONTENT DEPENDING ON FLOW */}
        {unverifiedEmail ? (
          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 z-10 flex items-center justify-center relative">
            <div className="bg-[#120703]/85 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] p-8 max-w-md w-full border border-white/20 text-center relative rounded-[32px]">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Verify Your Account</h2>
              <p className="text-white/70 text-xs sm:text-sm font-semibold mb-6">
                Your email is not verified yet. Enter the 6-digit OTP sent to your email.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (loginOtp.length !== 6 || !/^\d+$/.test(loginOtp)) {
                    toast.error("Please enter a valid 6-digit OTP.");
                    return;
                  }
                  setIsVerifyingLoginOtp(true);
                  try {
                    await api.registerVerifyOTP(unverifiedEmail, loginOtp);
                    toast.success("Email verified successfully! You can now log in.");
                    setUnverifiedEmail("");
                    setLoginOtp("");
                  } catch (err: any) {
                    toast.error(err.message || "Invalid OTP. Please try again.");
                  } finally {
                    setIsVerifyingLoginOtp(false);
                  }
                }}
                className="space-y-6 text-left"
              >
                <div>
                  <label className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">
                    Email Address
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={unverifiedEmail}
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-white/10 font-semibold text-white/70 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 bg-white/10 font-bold text-white text-center text-lg tracking-[0.5em] shadow-sm outline-none transition-all placeholder:text-white/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingLoginOtp}
                  className="relative w-full py-3.5 mt-8 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] focus:outline-none text-white font-extrabold text-[15px] tracking-wide shadow-xl shadow-orange-500/40 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isVerifyingLoginOtp ? "Verifying..." : "Verify & Activate Account"}
                </button>
              </form>

              <div className="mt-6 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.registerSendOTP(unverifiedEmail);
                      toast.success("A new verification OTP has been sent to your email.");
                    } catch (err: any) {
                      toast.error(err.message || "Failed to resend OTP.");
                    }
                  }}
                  className="font-extrabold text-orange-400 hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => setUnverifiedEmail("")}
                  className="font-bold text-white/70 hover:text-white hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </main>
        ) : forgotStep === 1 ? (
          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 z-10 flex items-center justify-center relative">
            <div className="bg-[#120703]/85 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] p-8 max-w-md w-full border border-white/20 text-center relative rounded-[32px]">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Forgot Password</h2>
              <p className="text-white/70 text-xs sm:text-sm font-semibold mb-6">
                Enter your registered email address to receive a 6-digit verification OTP code.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) {
                    toast.error("Please enter your registered email address.");
                    return;
                  }
                  setIsForgotLoading(true);
                  try {
                    await api.forgotPassword(forgotEmail);
                    toast.success("A secure 6-digit OTP code has been sent to your email.");
                    setForgotStep(2);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to initiate password recovery.");
                  } finally {
                    setIsForgotLoading(false);
                  }
                }}
                className="space-y-6 text-left"
              >
                <div>
                  <label className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 bg-white/10 font-bold text-white text-sm shadow-sm outline-none transition-all placeholder:text-white/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="relative w-full py-3.5 mt-8 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] focus:outline-none text-white font-extrabold text-[15px] tracking-wide shadow-xl shadow-orange-500/40 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isForgotLoading ? "Sending OTP..." : "Send Reset OTP"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setForgotStep(0)}
                  className="text-xs font-bold text-white/70 hover:text-white hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </main>
        ) : forgotStep === 2 ? (
          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 z-10 flex items-center justify-center relative">
            <div className="bg-[#120703]/85 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] p-8 max-w-md w-full border border-white/20 text-center relative rounded-[32px]">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-white/70 text-xs sm:text-sm font-semibold mb-6">
                A 6-digit OTP code has been sent to your email.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (forgotOtp.length !== 6 || !/^\d+$/.test(forgotOtp)) {
                    toast.error("Please enter a valid 6-digit OTP.");
                    return;
                  }
                  setIsForgotLoading(true);
                  try {
                    await api.verifyForgotOTP(forgotEmail, forgotOtp);
                    toast.success("OTP verified successfully. Please choose a new password.");
                    setForgotStep(3);
                  } catch (err: any) {
                    toast.error(err.message || "Invalid OTP or too many attempts. Please try again.");
                  } finally {
                    setIsForgotLoading(false);
                  }
                }}
                className="space-y-6 text-left"
              >
                <div>
                  <label className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">
                    Email Address
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={forgotEmail}
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-white/10 font-semibold text-white/70 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 bg-white/10 font-bold text-white text-center text-lg tracking-[0.5em] shadow-sm outline-none transition-all placeholder:text-white/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="relative w-full py-3.5 mt-8 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] focus:outline-none text-white font-extrabold text-[15px] tracking-wide shadow-xl shadow-orange-500/40 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isForgotLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              <div className="mt-6 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.forgotPassword(forgotEmail);
                      toast.success("A new 6-digit OTP code has been sent to your email.");
                    } catch (err: any) {
                      toast.error(err.message || "Failed to resend OTP.");
                    }
                  }}
                  className="font-extrabold text-orange-400 hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="font-bold text-white/70 hover:text-white hover:underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>
            </div>
          </main>
        ) : forgotStep === 3 ? (
          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 z-10 flex items-center justify-center relative">
            <div className="bg-[#120703]/85 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] p-8 max-w-md w-full border border-white/20 text-center relative rounded-[32px]">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-white/70 text-xs sm:text-sm font-semibold mb-6">
                Please enter a secure new password for your account.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newPassword) {
                    toast.error("Please enter a new password.");
                    return;
                  }
                  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                  if (!passwordRegex.test(newPassword)) {
                    toast.error("Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error("New Password and Confirm Password do not match.");
                    return;
                  }

                  setIsForgotLoading(true);
                  try {
                    await api.resetPassword(forgotEmail, forgotOtp, newPassword, confirmPassword);
                    toast.success("Password reset successfully. Please log in with your new password.");
                    setForgotStep(0);
                    setForgotEmail("");
                    setForgotOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to reset password.");
                  } finally {
                    setIsForgotLoading(false);
                  }
                }}
                className="space-y-6 text-left"
              >
                <div className="relative">
                  <label className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-4 pr-10 py-3 rounded-2xl border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 bg-white/10 font-bold text-white text-sm shadow-sm outline-none transition-all placeholder:text-white/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3.5 text-orange-300 hover:text-white transition-colors pointer-events-auto cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-2xl border border-white/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 bg-white/10 font-bold text-white text-sm shadow-sm outline-none transition-all placeholder:text-white/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="relative w-full py-3.5 mt-8 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] focus:outline-none text-white font-extrabold text-[15px] tracking-wide shadow-xl shadow-orange-500/40 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isForgotLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setForgotStep(0)}
                  className="text-xs font-bold text-[#FFFFFF]/70 hover:text-white hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </main>
        ) : (
          /* MAIN LOGIN VIEW */
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 flex flex-col justify-center relative">
            <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 items-center w-full">

              {/* LEFT COLUMN: FLOATING FORM FIELDS */}
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center w-full">
                <div className="mb-6">
                  <span className="text-orange-400 text-[11px] font-extrabold tracking-widest uppercase block">
                    Welcome Back
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold mt-1 drop-shadow-sm">
                    Sign In to BHOI
                  </h2>
                  <p className="text-xs text-white/70 font-medium mt-1">
                    Access your community directory, events, committee notices & services.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 w-full">
                  {/* EMAIL OR PHONE FIELD */}
                  <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-orange-400/50 rounded-2xl p-3.5 px-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 focus-within:bg-white/15 w-full backdrop-blur-md shadow-md">
                    <Mail className="w-5 h-5 text-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block leading-tight">
                        Email Address or Phone
                      </span>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-white font-bold p-0 focus:ring-0 mt-0.5 placeholder:text-white/40"
                        placeholder="Enter email or mobile number"
                      />
                    </div>
                  </div>

                  {/* PASSWORD FIELD */}
                  <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-orange-400/50 rounded-2xl p-3.5 px-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:border-orange-500 focus-within:bg-white/15 w-full backdrop-blur-md shadow-md">
                    <Lock className="w-5 h-5 text-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider block leading-tight">
                        Password
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-white font-bold p-0 focus:ring-0 mt-0.5 placeholder:text-white/40"
                        placeholder="Enter account password"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded-md text-orange-300 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto cursor-pointer shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* FORGOT PASSWORD LINK */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="font-extrabold text-xs text-orange-400 hover:text-orange-300 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* LOGIN BUTTON */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-3.5 mt-4 rounded-full bg-gradient-to-r from-[#F25C05] to-[#FFA74D] hover:from-[#E14D02] hover:to-[#FF952B] focus:outline-none text-white font-extrabold text-sm tracking-wide shadow-xl shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:cursor-not-allowed disabled:opacity-75 cursor-pointer"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {isLoading ? "Signing in..." : "Sign In to Account"}
                    </span>
                    {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />}
                  </button>

                  {/* NEED AN ACCOUNT FOOTER LINK */}
                  <div className="text-center mt-6 pt-4 border-t border-white/15 text-xs text-white/70">
                    Don't have an account yet?{" "}
                    <Link to="/register" className="font-extrabold text-orange-400 hover:underline">
                      Create new member profile
                    </Link>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: HIGH-IMPACT VIDEO SHOWCASE PANEL */}
              <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-center items-center w-full">
                <div className="relative w-full h-[540px] xl:h-[580px] rounded-[36px] overflow-hidden border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.7)] group backdrop-blur-xl bg-black/40">
                  {/* Embedded Video Player */}
                  <video
                    src={loginVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dark gradient overlay over right video frame */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                  {/* Top Badge */}
                  <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    <span>BHOI Portal Access</span>
                  </div>

                  {/* Bottom Showcase Info */}
                  <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest block mb-1">
                      Verified Member Network
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-white drop-shadow-md">
                      Empowering Community Relations
                    </h3>
                    <p className="text-xs text-white/80 mt-2 leading-relaxed font-medium">
                      Access your organization's directory, matrimony profiles, business ecosystem, and official committee updates in real-time.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/20 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 font-bold">✓</div>
                        <div>
                          <div className="font-extrabold text-white text-xs">Secure Auth</div>
                          <div className="text-[10px] text-white/60">Multi-Factor OTP</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 font-bold">🌐</div>
                        <div>
                          <div className="font-extrabold text-white text-xs">Live Directory</div>
                          <div className="text-[10px] text-white/60">Community Updates</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        )}

        {/* FOOTER */}
        <footer className="w-full max-w-7xl mx-auto px-6 py-4 z-20 flex flex-col md:flex-row justify-between items-center text-white/60 text-xs font-medium gap-2">
          <p>© 2026 BHOI. All rights reserved.</p>
          <p className="opacity-80 hidden md:block">Gujarati Community Network</p>
        </footer>

        {/* QUICK PRE-FILL SLIDE-OVER DRAWER */}
        <div className={`fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#120703]/95 backdrop-blur-2xl rounded-t-[32px] border-t border-white/20 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] z-50 p-6 md:p-8 transform transition-transform duration-500 ease-out pointer-events-auto text-white ${
          isDemoOpen ? "translate-y-0" : "translate-y-full"
        }`}>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
                <h3 className="font-serif text-xl font-bold text-white">Demo Credentials Quick-Access</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoOpen(false)}
                className="text-xs font-extrabold text-orange-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Select an official profile to prefill the login variables instantaneously:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.u}
                  type="button"
                  onClick={() => handleDemoFill(acc)}
                  className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-orange-400/60 text-left transition-all active:scale-95 group shadow-sm backdrop-blur-md cursor-pointer"
                >
                  <div className="text-xs font-bold text-orange-400 mb-1">{acc.label}</div>
                  <div className="text-[13px] font-extrabold text-white group-hover:text-orange-300 truncate">{acc.name}</div>
                  <div className="text-[11px] text-white/70 mt-2 truncate">{acc.u}</div>
                  <div className="text-[10px] text-white/50 font-medium">Password: {acc.p}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}