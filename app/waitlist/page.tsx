// app/waitlist/page.tsx
export default function WaitlistPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-serif)",
        textAlign: "center",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem" }}>You're on the list 🤍</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        We'll notify you when your spot is ready.
      </p>
      <a href="DISCORD_LINK" style={{ color: "var(--ember)" }}>
        Join our Discord →
      </a>
    </div>
  );
}
