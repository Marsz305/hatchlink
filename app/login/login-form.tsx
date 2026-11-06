"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Egg,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const initialError = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(
    initialError
      ? {
          type: "error",
          text:
            initialError === "authentication_failed"
              ? "Google authentication could not be completed. Please try again."
              : initialError,
        }
      : null
  );

  const supabaseConfigured = isSupabaseConfigured();

  async function setSessionCookie(userEmail: string, userName?: string) {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, name: userName }),
    });
    return res.ok;
  }

  async function handleGoogleSignIn() {
    setBusy(true);
    setMessage(null);

    try {
      if (supabaseConfigured) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              next
            )}`,
          },
        });

        if (error) {
          setMessage({ type: "error", text: error.message });
          setBusy(false);
          return;
        }
      } else {
        // Fallback for preview mode: sign in as the verified Google user email
        const googleUserEmail = "marerec402@gmail.com";
        const googleUserName = "marerec402 (Google)";
        await setSessionCookie(googleUserEmail, googleUserName);
        setMessage({
          type: "success",
          text: `Signed in with Google as ${googleUserEmail}. Redirecting…`,
        });
        setTimeout(() => {
          window.location.assign(next);
        }, 800);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Google sign-in encountered an issue.",
      });
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (supabaseConfigured) {
        const supabase = createClient();
        if (mode === "signin") {
          const { error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (error) {
            setMessage({ type: "error", text: error.message });
            setBusy(false);
            return;
          }
          await setSessionCookie(cleanEmail, fullName || cleanEmail.split("@")[0]);
          window.location.assign(next);
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { full_name: fullName.trim() },
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                next
              )}`,
            },
          });
          if (error) {
            setMessage({ type: "error", text: error.message });
            setBusy(false);
            return;
          }
          if (!data.session) {
            setMessage({
              type: "success",
              text: "Account created! Check your email inbox to confirm your address.",
            });
            setBusy(false);
            return;
          }
          await setSessionCookie(cleanEmail, fullName.trim() || cleanEmail.split("@")[0]);
          window.location.assign(next);
        }
      } else {
        // Local preview fallback session
        await setSessionCookie(
          cleanEmail,
          fullName.trim() || cleanEmail.split("@")[0]
        );
        setMessage({
          type: "success",
          text: `Welcome! Signed in as ${cleanEmail}. Redirecting…`,
        });
        setTimeout(() => {
          window.location.assign(next);
        }, 700);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Authentication failed. Please verify credentials.",
      });
      setBusy(false);
    }
  }


  return (
    <div className="login-page-wrapper">
      <div className="login-shell">
        {/* Top Back Navigation */}
        <div className="login-top-bar">
          <Link href="/" className="login-back-link">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>

          <div className="login-badge-pill">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c9952f]" />
            <span>Zimbabwe Traceable Poultry Network</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="login-card">
          {/* Header Brand */}
          <div className="login-card-header">
            <div className="login-brandmark-circle">
              <Egg className="w-7 h-7 text-[#123f31]" />
            </div>
            <h1>
              HatchLink <b>Zimbabwe</b>
            </h1>
            <p className="login-subtitle">
              {mode === "signin"
                ? "Sign in to access inspected egg batches, buyer escrow & seller portal."
                : "Create your account to buy or sell traceable fertilised eggs."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={mode === "signin" ? "active" : ""}
              onClick={() => {
                setMode("signin");
                setMessage(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => {
                setMode("signup");
                setMessage(null);
              }}
            >
              Create Account
            </button>
          </div>

          {/* Google Sign In Button */}
          <div className="login-oauth-section">
            <button
              type="button"
              className="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#1f644d]" />
              ) : (
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="login-divider">
            <span>or continue with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {mode === "signup" && (
              <div className="login-field-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-with-icon">
                  <User className="field-icon" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="e.g. Tendai Moyo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>
            )}

            <div className="login-field-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="field-icon" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.co.zw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="login-field-group">
              <div className="label-with-link">
                <label htmlFor="password">Password</label>
                {mode === "signin" && (
                  <span
                    className="forgot-link"
                    onClick={() =>
                      setMessage({
                        type: "info",
                        text: "Password resets are managed via your Supabase auth project or Google Sign-In.",
                      })
                    }
                  >
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="input-with-icon">
                <Lock className="field-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  placeholder={
                    mode === "signup" ? "Min. 6 characters" : "••••••••"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Alert Message */}
            {message && (
              <div className={`login-alert login-alert-${message.type}`}>
                {message.type === "error" && (
                  <AlertCircle className="w-4 h-4 flex-none" />
                )}
                {message.type === "success" && (
                  <CheckCircle2 className="w-4 h-4 flex-none" />
                )}
                {message.type === "info" && (
                  <Sparkles className="w-4 h-4 flex-none" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <p>
            Fertilised poultry eggs inspected at Harare & regional aggregation
            depots.
            <br />
            Compliant with Zimbabwean agricultural standards.
          </p>
        </div>
      </div>
    </div>
  );
}
