"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AtmosphericLayer } from "@/components/AtmosphericLayer";
import "@/components/AuthPage.css";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

interface AuthPageProps {
  mode: AuthMode;
}

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false); // показываем «проверь почту» после регистрации

  const [entranceComplete, setEntranceComplete] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setEntranceComplete(true), 700);
    return () => clearTimeout(t);
  }, []);

  // Magnetic pull on submit button (desktop only)
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;
    const button = submitRef.current;
    if (!button) return;

    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const magneticRadius = 200;
      const maxOffset = 5;
      if (distance < magneticRadius) {
        const force = 1 - distance / magneticRadius;
        const targetX = deltaX * force * (maxOffset / magneticRadius);
        const targetY = deltaY * force * (maxOffset / magneticRadius);
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
      } else {
        currentX += (0 - currentX) * 0.12;
        currentY += (0 - currentY) * 0.12;
      }
    };

    const animate = () => {
      button.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleSubmit = async () => {
    if (loading) return;
    setError(null);

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (isRegister) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: name },
        },
      });
      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }
      // если подтверждение почты включено — сессии ещё нет, показываем «проверь почту»
      if (!data.session) {
        setSent(true);
      } else {
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);

      if (error) {
        // частый кейс: почта не подтверждена
        setError(error.message);
        return;
      }
      router.push("/");
    }
  };

  // экран «проверь почту» после регистрации
  if (sent) {
    return (
      <div className="auth-screen">
        <AtmosphericLayer entranceComplete={entranceComplete} />
        <div className="auth-card-wrapper">
          <div className="auth-card-ambient" />
          <div className="auth-card auth-entrance">
            <div className="auth-header">
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle">
                We sent a confirmation link to {email}. Open it to step inside.
              </p>
            </div>
            <p className="auth-switch">
              Already confirmed?
              <Link className="auth-link" href="/login">
                Enter
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <AtmosphericLayer entranceComplete={entranceComplete} />

      <div className="auth-card-wrapper">
        <div className="auth-card-ambient" />

        <div className="auth-card auth-entrance">
          <div className="auth-header">
            <h1 className="auth-title">
              {isRegister ? "Step inside" : "Welcome back"}
            </h1>
            <p className="auth-subtitle">
              {isRegister
                ? "Someone is waiting to be known."
                : "The room has been quiet without you."}
            </p>
          </div>

          <div
            className="auth-form auth-entrance auth-entrance-delay-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          >
            {isRegister && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="name">
                  Name
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="name"
                    className="auth-input"
                    type="text"
                    placeholder="What should they call you?"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="auth-input-icon" />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Email
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  className="auth-input"
                  type="email"
                  placeholder="you@whisper.to"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="auth-input-icon" />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your secret"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="auth-input-icon" />
                <button
                  type="button"
                  className="auth-reveal"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="confirm">
                  Confirm password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="confirm"
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Once more"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <Lock className="auth-input-icon" />
                </div>
              </div>
            )}

            {/* {!isRegister && (
              <div className="auth-row">
                <span />
                <Link className="auth-link" href="/reset">
                  Forgot it?
                </Link>
              </div>
            )} */}

            {error && (
              <p
                style={{
                  color: "var(--crimson-bright)",
                  fontSize: "var(--text-small)",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            <div className="auth-submit-wrapper">
              <button
                ref={submitRef}
                type="button"
                className="auth-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {isRegister ? <Sparkles className="btn-icon" /> : null}
                {loading
                  ? "One moment…"
                  : isRegister
                    ? "Create your sanctuary"
                    : "Enter"}
                {!isRegister && !loading ? (
                  <ArrowRight className="btn-icon" />
                ) : null}
              </button>
            </div>
          </div>

          <div className="auth-entrance auth-entrance-delay-2">
            <div className="auth-divider">or</div>

            <p className="auth-switch">
              {isRegister ? "Already have a key?" : "Don't have a key yet?"}

              <Link
                className="auth-link"
                // href={isRegister ? "/login" : "/register"}
                href={isRegister ? "/login" : "/"}
              >
                {isRegister ? "Enter" : "Create one"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
