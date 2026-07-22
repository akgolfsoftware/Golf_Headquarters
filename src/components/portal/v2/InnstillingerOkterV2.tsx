"use client";

/**
 * PlayerHQ Innstillinger · Apparater — v2 Presis + B-pakke (tom = én grønn vei).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { T, Tittel, Kort, TomTilstand, StatusPill, CTAPill } from "@/components/v2";

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerOkterV2() {
  const mobile = useMobile();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Tittel mobile={mobile}>Apparater og økter</Tittel>

      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        <Kort pad="12px">
          <CapsPlaceholder label="Denne enheten" value="Aktiv" />
        </Kort>
        <Kort pad="12px">
          <CapsPlaceholder label="Andre enheter" value="—" />
        </Kort>
      </div>

      <Kort eyebrow="Apparat-oversikt" action={<StatusPill tone="info">Kommer snart</StatusPill>}>
        <TomTilstand
          icon="monitor"
          title="Oversikt over enheter kommer snart"
          sub="Da kan du se innlogginger og logge ut andre enheter. Nå: logg ut via Meg."
        />
      </Kort>

      <Link href="/portal/meg/innstillinger/sikkerhet" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="shield" full>
          Åpne sikkerhet
        </CTAPill>
      </Link>
    </div>
  );
}

function CapsPlaceholder({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mut, display: "block" }}>{label}</span>
      <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, marginTop: 8, color: T.fg }}>{value}</div>
    </>
  );
}
