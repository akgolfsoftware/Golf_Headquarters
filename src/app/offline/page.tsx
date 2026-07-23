import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps } from "@/components/v2";

export const metadata: Metadata = {
  title: "Du er offline",
  description: "Sjekk nettforbindelsen din og prøv igjen.",
};

/**
 * /offline — V2/B: enkel status + én tydelig neste handling.
 */
export default function OfflinePage() {
  return (
    <main
      className="light"
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: `radial-gradient(900px 380px at 50% -10%, var(--v2-vignett), transparent 62%), ${T.bg}`,
        color: T.fg,
        fontFamily: T.ui,
        colorScheme: "light",
        textAlign: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <LogoAK size={28} />
        </div>
        <Caps size={10} style={{ marginBottom: 10, color: T.mut }}>
          Nettverk
        </Caps>
        <h1
          style={{
            fontFamily: T.disp,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            color: T.fg,
          }}
        >
          Du er offline
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: T.mut, margin: "0 0 24px" }}>
          Sjekk nettforbindelsen og prøv igjen. Siste live-økter er lagret lokalt
          og synkes når du er online.
        </p>
        <Link
          href="/"
          className="v2-press"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 22px",
            borderRadius: 9999,
            background: T.lime,
            color: T.onLime,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Prøv igjen
        </Link>
      </div>
    </main>
  );
}
