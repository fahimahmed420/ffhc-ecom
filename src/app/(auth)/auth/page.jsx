"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { loginUser, registerUser, loginWithGoogle } from "@/lib/firebase/auth";

const INPUT = "w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50 focus:bg-white/12 transition";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/";

  const saveUserToDB = async (user, name = "") => {
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, email: user.email, name: name || user.displayName || "", photo: user.photoURL || "" }),
      });
    } catch (err) { console.error(err); }
  };

  const getErrorMessage = (code) => {
    const map = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "This email is already registered.",
      "auth/invalid-email": "Please enter a valid email.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/popup-closed-by-user": "Google popup was closed.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/invalid-credential": "Invalid email or password.",
    };
    return map[code] || "Something went wrong. Please try again.";
  };

  const validate = () => {
    const errs = {};
    if (!form.email.includes("@")) errs.email = "Enter a valid email";
    if (form.password.length < 6) errs.password = "Minimum 6 characters";
    if (!isLogin) {
      if (!form.name.trim()) errs.name = "Name is required";
      if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    try {
      setLoading(true);
      if (isLogin) {
        await loginUser(form.email, form.password);
        toast.success("Logged in!");
      } else {
        const cred = await registerUser(form.email, form.password);
        await saveUserToDB(cred.user, form.name);
        toast.success("Account created!");
      }
      router.push(redirectPath);
    } catch (err) {
      toast.error(getErrorMessage(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const user = await loginWithGoogle();
      await saveUserToDB(user);
      toast.success("Logged in with Google!");
      router.push(redirectPath);
    } catch (err) {
      toast.error(getErrorMessage(err.code));
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#000]" />
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full" />

      {/* Back button */}
      <Link href="/" className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium transition">
        <ArrowLeft size={14} /> Home
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-white">Family Fashion Hub</h1>
          <p className="text-xs text-white/40 mt-1">Import from China. Sell Across Bangladesh.</p>
        </div>

        <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl">
          {/* Tab toggle */}
          <div className="flex bg-white/8 rounded-2xl p-1 mb-6">
            {["Login", "Sign Up"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(i === 0); setErrors({}); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                  isLogin === (i === 0) ? "bg-white text-gray-900 shadow-sm" : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <input type="text" placeholder="Full Name" className={INPUT} value={form.name} onChange={set("name")} />
                {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <input type="email" placeholder="Email" className={INPUT} value={form.email} onChange={set("email")} />
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  className={`${INPUT} pr-10`}
                  value={form.password}
                  onChange={set("password")}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <input type="password" placeholder="Confirm Password" className={INPUT} value={form.confirm} onChange={set("confirm")} />
                {errors.confirm && <p className="text-[11px] text-red-400 mt-1">{errors.confirm}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : isLogin ? "Log In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white/8 border border-white/15 rounded-xl text-sm font-semibold text-white hover:bg-white/15 transition disabled:opacity-50"
          >
            <Image src="/google-logo.svg" alt="Google" width={18} height={18} />
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          By continuing, you agree to our terms of service.
        </p>
      </div>
    </section>
  );
}
