"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ Innstillinger · Apparater — v2 Presis + B-pakke (tom = én grønn vei).
 */

import Link from "next/link";
import { Kort, TomTilstand, StatusPill } from "@/components/v2";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerOkterV2() {
  return (
    <div data-paper-wave-g="innstillingerokter" data-paper-portal-innstillinger-okter data-paper-slug="playerhq-innstillinger" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <InnstillingerHode tittel="Økter" undertekst="Innstillinger" tilbakeHref="/portal/meg/innstillinger" />

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

      {/* A3 (16.08): ren navigasjon = ink-knapp, aldri clay. */}
      <Link href="/portal/meg/innstillinger/sikkerhet" style={{ textDecoration: "none", display: "block" }}>
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Åpne sikkerhet</span>
      </Link>
    </div>
  );
}

function CapsPlaceholder({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TL.mute, display: "block" }}>{label}</span>
      <div style={{ fontFamily: TL.font.mono, fontWeight: 700, fontSize: 16, marginTop: 8, color: TL.text }}>{value}</div>
    </>
  );
}
