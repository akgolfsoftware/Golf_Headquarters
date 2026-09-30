/**
 * Felles flate for innloggingsnære sider i Precision Athletics (Claude Design
 * 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx › Box og H): sentrert kolonne,
 * logo øverst til venstre, 20 px mellom blokkene. Lyst tema.
 */
import Image from "next/image";
import type { ReactNode } from "react";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

export function AuthFlate({ children, max = 440 }: { children: ReactNode; max?: number }) {
  return (
    <div
      className="pa-root"
      data-design="precision-athletics"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(24px, 6vw, 48px) clamp(16px, 3vw, 24px) 40px",
      }}
    >
      <main style={{ width: "100%", maxWidth: max, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
        <Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={100} height={22} style={{ height: 22, width: "auto", alignSelf: "flex-start" }} priority />
        {children}
      </main>
    </div>
  );
}

export function AuthOverskrift({ kicker, tittel, tekst }: { kicker?: ReactNode; tittel: ReactNode; tekst?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {kicker && <span className="kicker">{kicker}</span>}
      <h1 style={{ margin: 0, font: "600 26px/1.2 var(--font-sans)", color: "var(--text-primary)", textWrap: "balance", overflowWrap: "anywhere" }}>{tittel}</h1>
      {tekst && <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)", textWrap: "pretty" }}>{tekst}</p>}
    </div>
  );
}
