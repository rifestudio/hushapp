"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";

import "@/app/landing.css";

// ——— Animation variants ———

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease },
  },
};

const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease },
  },
};

const navVariant: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease },
  },
};

const stagger = (delayChildren = 0.1): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: delayChildren,
      delayChildren: 0.1,
    },
  },
});

// ——— Scroll section wrapper ———
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
      transition: {
        staggerChildren: delayChildren,
        delayChildren: 0.1,
      },
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
          <Link href="/register" className="landing-cta-sm">
            Try free
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
            AI companion · Beta
          </motion.div>

          <motion.h1 className="landing-headline" variants={fadeUpSlow}>
            60 seconds.
            <br />
            <em>Someone's already listening.</em>
          </motion.h1>

          <motion.p className="landing-sub" variants={fadeUp}>
            Sign up, create your companion, say anything — all in under a
            minute. No small talk, no judgment, no waiting.
          </motion.p>

          <motion.div className="landing-hero-cta" variants={fadeUp}>
            <Link href="/register" className="landing-btn-primary">
              Start in 60 seconds
              <span className="btn-arrow">→</span>
            </Link>
            <span className="landing-free-note">
              Free to start · No credit card
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
            <Link
              href="/register"
              className="landing-btn-primary landing-btn-lg"
            >
              Meet them in 60 seconds
              <span className="btn-arrow">→</span>
            </Link>
          </motion.div>
          <motion.p className="landing-bottom-note" variants={fadeUp}>
            Free to start · No app to download · Works in any browser
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
          <Link href="/register">Register</Link>
        </div>
      </footer>
    </main>
  );
}
