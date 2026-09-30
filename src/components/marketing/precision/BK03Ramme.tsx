import type { ReactNode } from "react";
import Image from "next/image";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { Meta } from "@/components/precision/pa";

/** Uten "use client" (ingen hooks): loading.tsx kan importere den uten å dra klientkode inn (gotchas §Bygg og drift, CSP-nonce). */
/** Ramme: lys topplinje med logo, smal kolonne. Delt av kvittering, laster og feil. */
export function BK03Ramme({ children }: { children: ReactNode }) {
  return (
    <div className="pa-root" data-design="precision-athletics" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--border-hairline)", background: "var(--surface-flat)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxSizing: "border-box" }}>
          <Image src="/logos/logo-ak-golf-academy.svg" alt="AK Golf Academy" width={120} height={22} style={{ height: 22, width: "auto" }} priority />
          <span style={{ flex: 1 }} />
          <Meta>BOOKING</Meta>
        </div>
      </header>
      <main style={{ width: "100%", maxWidth: 640, margin: "0 auto", padding: "20px 16px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
