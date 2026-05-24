"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { loginUser, registerUser, loginWithGoogle } from "@/lib/firebase/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("from") || "/";

  // ======================================================
  // SAVE USER TO DATABASE
  // ======================================================

  const saveUserToDB = async (user, name = "") => {
    try {
      await fetch("/api/users", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: name || user.displayName || "",
          photo: user.photoURL || "",
        }),
      });
    } catch (err) {
      console.error("DB save error:", err);
    }
  };

  // ======================================================
  // FIREBASE ERROR HANDLER
  // ======================================================

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email.";

      case "auth/wrong-password":
        return "Incorrect password.";

      case "auth/email-already-in-use":
        return "This email is already registered.";

      case "auth/invalid-email":
        return "Please enter a valid email.";

      case "auth/weak-password":
        return "Password must be at least 6 characters.";

      case "auth/popup-closed-by-user":
        return "Google popup was closed.";

      case "auth/network-request-failed":
        return "Network error. Check your internet connection.";

      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";

      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase.";

      case "auth/invalid-credential":
        return "Invalid email or password.";

      default:
        return "Something went wrong. Please try again.";
    }
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validate = () => {
    let newErrors = {};

    if (!form.email.includes("@")) {
      newErrors.email = "Enter a valid email";
    }

    if (form.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    if (!isLogin) {
      if (!form.name.trim()) {
        newErrors.name = "Name required";
      }

      if (form.password !== form.confirm) {
        newErrors.confirm = "Passwords do not match";
      }
    }

    return newErrors;
  };

  // ======================================================
  // SUBMIT HANDLER
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the form errors.");

      return;
    }

    try {
      setLoading(true);

      let userCredential;

      // LOGIN
      if (isLogin) {
        userCredential = await loginUser(form.email, form.password);

        toast.success("Logged in successfully!");
      }

      // SIGNUP
      else {
        userCredential = await registerUser(form.email, form.password);

        await saveUserToDB(userCredential.user, form.name);

        toast.success("Account created successfully!");
      }

      router.push(redirectPath);
    } catch (err) {
      console.error(err);

      toast.error(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // GOOGLE LOGIN
  // ======================================================

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const user = await loginWithGoogle();

      await saveUserToDB(user);

      toast.success("Logged in with Google!");

      router.push(redirectPath);
    } catch (err) {
      console.error(err);

      toast.error(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* TOASTER */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-20 px-4 py-2 text-xs tracking-widest border border-white/40 backdrop-blur-md hover:bg-white hover:text-black transition"
      >
        ← HOME
      </button>

      {/* Background */}
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#000000]" />

      {/* Soft animated glow layers */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/30 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-2xl shadow-xl"
        >
          {/* Toggle */}
          <div className="flex mb-6 text-sm tracking-widest border border-white/20 rounded overflow-hidden">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-3 transition ${
                isLogin ? "bg-white text-black" : "text-white/70"
              }`}
            >
              LOGIN
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-3 transition ${
                !isLogin ? "bg-white text-black" : "text-white/70"
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
              onSubmit={handleSubmit}
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -40,
              }}
              transition={{
                duration: 0.3,
              }}
              className="space-y-4"
            >
              {/* Name */}
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    placeholder="FULL NAME"
                    className="input"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />

                  {errors.name && <p className="error">{errors.name}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="EMAIL"
                  className="input"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

                {errors.email && <p className="error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  placeholder="PASSWORD"
                  className="input"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />

                {errors.password && <p className="error">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              {!isLogin && (
                <div>
                  <input
                    type="password"
                    placeholder="CONFIRM PASSWORD"
                    className="input"
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        confirm: e.target.value,
                      })
                    }
                  />

                  {errors.confirm && <p className="error">{errors.confirm}</p>}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 border border-white tracking-widest hover:bg-white hover:text-black transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" size={18} />
                ) : isLogin ? (
                  "LOGIN"
                ) : (
                  "CREATE ACCOUNT"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/20" />

                <span className="text-xs text-white/60">OR</span>

                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Google */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 border border-white/30 hover:bg-white hover:text-black transition disabled:opacity-50"
              >
                <Image
                  src="/google-logo.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />

                <span className="tracking-widest text-sm">
                  CONTINUE WITH GOOGLE
                </span>
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .input {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px;
          color: white;
          outline: none;
        }

        .input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .input:focus {
          border-color: white;
        }

        .error {
          font-size: 12px;
          color: #fca5a5;
          margin-top: 4px;
        }
      `}</style>
    </section>
  );
}
