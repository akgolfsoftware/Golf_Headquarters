"use client";

/* AK Golf HQ v2 — delte robusthets-komponenter (SPOR R0, fase 6). Grunnstein
   for error.tsx/loading.tsx på tvers av v2-skjermer: V2Feil (feilinnhold,
   rendres inni en tynn error.tsx) her, og V2Laster (skeleton, rendres i en
   tynn loading.tsx) i laster.tsx — skilt ut 07.09.2026 fordi loading.tsx
   ikke skal bære klient-JS (CSP-nonce-bug i Next, se laster.tsx).
   Maler i docs/redesign-v2/maler/{error,loading}-mal.tsx.txt.
   Samme visuelle språk som src/components/v2/core.tsx (T-tokens, Knapp,
   Icon) — bruk disse malene fremfor ad-hoc feil-/last-UI i nye v2-skjermer.

   Fasit: designsystem/train-lock/B1 Tilstander laster feil.dc.html (PX-7,
   29.08.2026) — I dag/Plan/Analyse/Meg × laster/feil. Skjelett i kortgeometri
   uten spinner (variant="hjem"/"plan"/"meg"/"dashboard"), feil-etikett i
   TL.danger med hvit «Prøv igjen»-CTA (V2Feil). Fasitens inline feil-kort
   (chrome + bunn-nav synlig) er IKKE portert 1:1 — Next.js' error.tsx-grense
   erstatter hele siden fordi V2Shell rendres i page.tsx, ikke i en layout;
   V2Laster/V2Feil bærer derfor sin egen mørke chrome (railsilhuett) som
   erstatning, se JSDoc på V2Laster. Kopien («Fikk ikke lastet dagen din» osv.)
   er fasitens, satt per rute via tittel/melding-propene.
   Samme mønster (tom/laster/feil, «Prøv igjen», danger kun på feilteksten)
   gjelder KA-01/RU-01/S3-01/BO-01 — se
   designsystem/train-lock/GAP-1 Tilstander.dc.html, portet i egne
   error.tsx/loading.tsx per rute (admin/kalender,
   portal/(fullscreen)/runde/live, admin/spillere/[id], portal/booking).
   * Avvik:
   *   - ingen riggrad for de åtte B1-tilstandene (I dag/Plan/Analyse/Meg ×
   *     laster/feil) — pixel-diff-riggen krever en levende app-instans mot
   *     ekte data (screentest-bruker), og denne økten (STEG 20 batch 2,
   *     09.09.2026) hadde ingen DB-tilgang i worktreen. Fasit-samsvaret over
   *     (variant, kopi, chrome) er lest av koden, ikke målt visuelt. */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { Knapp } from "@/components/v2/core";

/* ── V2Feil ───────────────────────────────────────────── */
export interface V2FeilProps {
  /** error.tsx-kontraktens reset() — knyttes til "Prøv igjen"-knappen. */
  reset: () => void;
  /** Hvor "Tilbake"-lenken skal peke (nærmeste fungerende oversikt). */
  tilbakeHref: string;
  tittel?: string;
  /** Undertekst — fasit-spesifikk per flate (B1). Kort norsk, aldri stack trace. */
  melding?: string;
}

/** Feilinnhold i v2-design. Rendres INNI en error.tsx (som selv er tynn og
 *  logger error.digest) — se docs/redesign-v2/maler/error-mal.tsx.txt.
 *  Tittel/melding er fasit-spesifikke per flate (B1 Tilstander laster feil):
 *  «Fikk ikke lastet dagen din», «Fikk ikke lastet uken», «Fikk ikke hentet
 *  SG», «Fikk ikke lastet innstillingene» — danger kun på Feil-etiketten. */
export function V2Feil({ reset, tilbakeHref, tittel = "Noe gikk galt", melding = "Vi støtte på en uventet feil — prøv igjen, eller gå tilbake." }: V2FeilProps) {
  return (
    <main style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14, padding: "48px 24px" }}>
      <span style={{ width: 52, height: 52, borderRadius: 16, background: `color-mix(in srgb, ${TL.danger} 14%, transparent)`, border: `1px solid ${TL.danger}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="alert-triangle" size={22} style={{ color: TL.danger }} />
      </span>
      <div style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.text }}>Feil</div>
      <h1 style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 22, color: TL.text, margin: 0 }}>{tittel}</h1>
      <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, maxWidth: 340, lineHeight: 1.6, margin: 0 }}>
        {melding}
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
        <Knapp icon="rotate-cw" onClick={reset}>Prøv igjen</Knapp>
        <Link
          href={tilbakeHref}
          className="v2-press v2-focus"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text, background: TL.dim, border: `1px solid ${TL.hair}`, borderRadius: 9999, padding: "10px 18px", textDecoration: "none" }}
        >
          <Icon name="arrow-left" size={14} />Tilbake
        </Link>
      </div>
    </main>
  );
}
