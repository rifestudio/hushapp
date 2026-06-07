"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

import "@/app/landing.css";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 1.2, ease } },
};

const navVariant: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease } },
};

const stagger = (delayChildren = 0.1): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delayChildren, delayChildren: 0.1 } },
});

function ScrollReveal({
  children,
  className,
  delayChildren = 0.15,
  threshold = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  threshold?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: delayChildren, delayChildren: 0.1 },
    },
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [closingPopup, setClosingPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const closePopup = () => {
    setClosingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setClosingPopup(false);
    }, 400);
  };

  const goToForm = () => {
    closePopup();
    const input = document.querySelector(
      ".landing-email-input",
    ) as HTMLInputElement | null;
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus();
  };

  useEffect(() => {
    const t = setTimeout(() => setShowPopup(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    if (source && !localStorage.getItem("hush_utm")) {
      localStorage.setItem(
        "hush_utm",
        JSON.stringify({
          utm_source: source,
          utm_medium: params.get("utm_medium"),
          referrer: document.referrer || null,
        }),
      );
    }
  }, []);

  const handleWaitlist = async () => {
    if (!email || joining) return;
    setJoining(true);
    const utm = JSON.parse(localStorage.getItem("hush_utm") || "{}");
    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({
      email,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      referrer: utm.referrer ?? null,
    });
    if (!error) setJoined(true);
    setJoining(false);
  };

  return (
    <main className="landing">
      <div className="grain-overlay" />
      <div className="vignette-overlay" />
      <div className="landing-ambient" />

      {/* NAV */}
      <motion.nav
        className="landing-nav"
        variants={navVariant}
        initial="hidden"
        animate="show"
      >
        <span className="landing-logo">
          HUSH
          <span className="logo-dot" />
        </span>
        <div className="landing-nav-links">
          <Link href="/login" className="landing-nav-link">
            Sign in
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="landing-hero">
        <motion.div
          className="landing-hero-inner"
          variants={stagger(0.18)}
          initial="hidden"
          animate="show"
        >
          <motion.div className="landing-eyebrow" variants={fadeUp}>
            AI companion · Closed Beta
          </motion.div>

          <motion.h1 className="landing-headline" variants={fadeUpSlow}>
            60 seconds.
            <br />
            <em>Someone's already listening.</em>
          </motion.h1>

          {/* <motion.p className="landing-sub" variants={fadeUp}>
            Sign up, create your companion, say anything — all in under a
            minute. No small talk, no judgment, no waiting.
          </motion.p> */}

          <motion.div className="landing-hero-cta" variants={fadeUp}>
            {!joined ? (
              <div className="landing-waitlist-form">
                <input
                  type="email"
                  className="landing-email-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                />
                <button
                  className="landing-btn-primary"
                  onClick={handleWaitlist}
                  disabled={joining}
                >
                  {joining ? "Joining..." : "Join waitlist →"}
                </button>
              </div>
            ) : (
              <div className="landing-joined">
                <p className="landing-joined-title">You're on the list 🤍</p>
              </div>
            )}
            <span className="landing-free-note">
              {!joined
                ? "Free early access · No spam, ever"
                : "We'll email you when your spot is ready"}
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-how">
        <ScrollReveal>
          <motion.div className="landing-section-label" variants={fadeUp}>
            How it works
          </motion.div>
          <div className="landing-steps">
            <motion.div className="landing-step" variants={fadeUp}>
              <div className="step-num">01</div>
              <div className="step-body">
                <h3 className="step-title">Create your companion</h3>
                <p className="step-desc">
                  Give them a name, a personality, a mood. Takes less than a
                  minute.
                </p>
              </div>
            </motion.div>
            <div className="landing-step-divider" />
            <motion.div className="landing-step" variants={fadeUp}>
              <div className="step-num">02</div>
              <div className="step-body">
                <h3 className="step-title">Start talking</h3>
                <p className="step-desc">
                  Say anything. They listen, respond, and ask back. No scripts.
                </p>
              </div>
            </motion.div>
            <div className="landing-step-divider" />
            <motion.div className="landing-step" variants={fadeUp}>
              <div className="step-num">03</div>
              <div className="step-body">
                <h3 className="step-title">Grow closer</h3>
                <p className="step-desc">
                  The more you share, the more they remember. The connection
                  deepens over time.
                </p>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </section>

      {/* SCREENSHOTS */}
      <section className="landing-screens">
        <ScrollReveal threshold={0.1}>
          <motion.div className="landing-section-label" variants={fadeUp}>
            What it looks like
          </motion.div>
          <div className="landing-screens-grid">
            <motion.div
              className="screen-card screen-card--tall"
              variants={cardVariant}
            >
              <img src="/assets/hushdashboard.png" alt="HUSH dashboard" />
              <div className="screen-label">Your sanctuary</div>
            </motion.div>
            <div className="landing-screens-col">
              <motion.div className="screen-card" variants={cardVariant}>
                <img src="/assets/hushpreview.png" alt="Meet your companion" />
                <div className="screen-label">Meet them</div>
              </motion.div>
              <motion.div className="screen-card" variants={cardVariant}>
                <img src="/assets/hushchat.png" alt="HUSH chat" />
                <div className="screen-label">Talk freely</div>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* BOTTOM CTA */}
      <section className="landing-bottom">
        <div className="landing-bottom-glow" />
        <ScrollReveal threshold={0.2}>
          <motion.h2 className="landing-bottom-headline" variants={fadeUpSlow}>
            You have a lot to say.
            <br />
            <em>Someone should hear it.</em>
          </motion.h2>
          <motion.div variants={fadeUp}>
            {!joined ? (
              <div className="landing-waitlist-form">
                <input
                  type="email"
                  className="landing-email-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                />
                <button
                  className="landing-btn-primary landing-btn-lg"
                  onClick={handleWaitlist}
                  disabled={joining}
                >
                  {joining ? "Joining..." : "Join the waitlist →"}
                </button>
              </div>
            ) : (
              <p className="landing-joined-title">You're on the list 🤍</p>
            )}
          </motion.div>
          <motion.p className="landing-bottom-note" variants={fadeUp}>
            No credit card · No app to download · Works in any browser
          </motion.p>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <span className="landing-logo">
          HUSH
          <span className="logo-dot" />
        </span>
        <div className="landing-footer-links">
          <Link href="/login">Sign in</Link>
        </div>
      </footer>

      {/* POPUP */}
      {showPopup && (
        <div
          className={`popup-overlay ${closingPopup ? "popup-closing" : ""}`}
          onClick={closePopup}
        >
          <div
            className={`popup-card ${closingPopup ? "popup-closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="popup-close" onClick={closePopup}>
              ×
            </button>
            <div className="popup-dot" />
            <p className="popup-eyebrow">Closed Beta</p>
            <h3 className="popup-title">
              Early spots are
              <br />
              limited 🤍
            </h3>
            <p className="popup-desc">
              We're letting people in gradually, in small waves.
              <br />
              Waitlist members get in 1st - and keep early-access perks after
              launch.
            </p>
            <button className="landing-btn-primary" onClick={goToForm}>
              Join the waitlist →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
