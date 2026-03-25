import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      textAlign: "center",
      padding: "2rem",
      fontFamily: "sans-serif",
    }}>
      <h1 style={{ fontSize: "4rem", margin: "0 0 1rem", color: "#1a3a5c" }}>404</h1>
      <h2 style={{ margin: "0 0 1rem" }}>Page introuvable</h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#c8a97e",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
        }}
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
