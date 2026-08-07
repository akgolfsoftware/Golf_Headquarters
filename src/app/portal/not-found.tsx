/**
 * 404 for /portal-treet. Holder brukeren i portal-chromen (ikke marketing-404).
 * Banner tone=info — rolig «adressen finnes ikke»-melding på norsk bokmål.
 */

import Link from "next/link";
import { Banner } from "@/components/v2/overlays";
import { T } from "@/lib/v2/tokens";

export default function PortalNotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 16,
        padding: "48px 24px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: T.mut,
          margin: 0,
        }}
      >
        404 · Ikke funnet
      </p>
      <h1
        style={{
          fontFamily: T.disp,
          fontWeight: 700,
          fontSize: 22,
          color: T.fg,
          margin: 0,
        }}
      >
        Siden finnes ikke
      </h1>
      <Banner
        tone="info"
        tekst="Adressen kan være flyttet eller feilskrevet. Sjekk URLen eller gå tilbake til portalen."
        cta={null}
        w={420}
      />
      <Link
        href="/portal"
        className="v2-press v2-focus"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: 600,
          color: T.onLime,
          background: T.lime,
          borderRadius: 9999,
          padding: "10px 20px",
          textDecoration: "none",
        }}
      >
        Tilbake til portalen
      </Link>
    </main>
  );
}
