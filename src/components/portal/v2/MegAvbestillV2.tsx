"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ Meg · Avbestill — v2 Presis + B-pakke (status først, Behold = grønn).
 * Avbestill-logikk i actions.ts (cancelPro) — urørt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Caps, Kort, Knapp, Icon } from "@/components/v2";
import { cancelPro } from "@/app/portal/meg/abonnement/avbestill/actions";

export type MegAvbestillKonsekvens = {
  tittel: string;
  detalj: string;
  etterpaa: string;
};

export type MegAvbestillData = {
  /** Ukedag for siste Pro-dag, f.eks. «onsdag». */
  ukedag: string;
  /** Dato for siste Pro-dag, f.eks. «12. august 2026». */
  dato: string;
  dagerIgjen: number;
  /** Konsekvensene bygges SERVER-SIDE fra faktisk abonnement (A4) —
   *  aldri hardkodet («fra 4 credits til 0» var feil for 299-kunder). */
  konsekvenser: MegAvbestillKonsekvens[];
};

export function MegAvbestillV2({ data }: { data: MegAvbestillData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function avbestill() {
    if (!confirm("Er du helt sikker på at du vil avbestille Pro?")) return;
    setFeil(null);
    startTransition(async () => {
      // Ved suksess redirecter actionen (resultatet blir da undefined);
      // ved feil kommer { ok: false, error } tilbake og vises under knappene.
      const resultat = await cancelPro();
      if (resultat && !resultat.ok) {
        setFeil(resultat.error ?? "Noe gikk galt. Prøv igjen om litt.");
      }
    });
  }

  return (
    <div data-paper-wave-g="megavbestill" data-paper-portal-meg-avbestill data-paper-slug="playerhq-abonnement" style={{ maxWidth: 520, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero — varsom advarsel, aldri sperre-språk */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", paddingTop: 6 }}>
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 9999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: TL.danger,
            border: `2px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
            background: `color-mix(in srgb, ${TL.danger} 8%, transparent)`,
          }}
        >
          <Icon name="alert-triangle" size={26} />
        </span>
        <Caps>Siste bekreftelse · Steg 2 av 2</Caps>
        <h1 style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", color: TL.text, margin: 0, lineHeight: 1.1 }}>
          Avbestille <em style={{ fontStyle: "italic", color: TL.danger }}>Pro</em>?
        </h1>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, lineHeight: 1.6, color: TL.mute, margin: 0, maxWidth: 380 }}>
          Du mister disse fordelene når perioden løper ut.{" "}
          <strong style={{ fontWeight: 600, color: TL.text }}>Du betales ikke noe mer</strong> — men
          tilgangen forsvinner gradvis.
        </p>
      </div>

      {/* Pro aktiv til */}
      <Kort>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <Caps size={9}>Pro aktiv til</Caps>
            <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text, marginTop: 6 }}>
              <em style={{ fontStyle: "italic", fontWeight: 400, color: TL.fill, textTransform: "capitalize" }}>{data.ukedag}</em>{" "}
              {data.dato}
            </div>
          </div>
          <div style={{ textAlign: "right", flex: "none" }}>
            <div style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>kl 23:59</div>
            <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 4 }}>{data.dagerIgjen} dager igjen</div>
          </div>
        </div>
      </Kort>

      {/* Dette mister du */}
      <Kort eyebrow="Dette mister du">
        {data.konsekvenser.map((k, i) => (
          <div
            key={k.tittel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: i === data.konsekvenser.length - 1 ? "none" : `1px solid ${TL.hair}`,
            }}
          >
            <Icon name="x-circle" size={15} style={{ color: TL.danger, flex: "none" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{k.tittel}</div>
              <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>{k.detalj}</div>
            </div>
            <span
              style={{
                flex: "none",
                whiteSpace: "nowrap",
                fontFamily: TL.font.mono,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: TL.danger,
                background: `color-mix(in srgb, ${TL.danger} 10%, transparent)`,
                borderRadius: 9999,
                padding: "3px 9px",
              }}
            >
              {k.etterpaa}
            </span>
          </div>
        ))}
      </Kort>

      {/* B: én grønn primær (behold) + farlig sekundær under */}
      <Knapp icon="heart" full onClick={() => router.push("/portal/meg/abonnement")} style={{ minHeight: 44 }}>
        Behold Pro
      </Knapp>
      <Knapp
        ghost
        full
        disabled={pending}
        onClick={avbestill}
        style={{ minHeight: 44, color: TL.danger, border: `1.5px solid color-mix(in srgb, ${TL.danger} 35%, transparent)` }}
      >
        {pending ? "Avbestiller …" : "Ja, avbestill"}
      </Knapp>
      {feil && (
        <p role="alert" style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 500, lineHeight: 1.5, color: TL.danger, textAlign: "center", margin: 0 }}>
          {feil}
        </p>
      )}

      <p style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.06em", color: TL.mute, textAlign: "center", margin: 0 }}>
        Ingenting endres før du bekrefter —{" "}
        <Link href="/portal/meg/abonnement" style={{ color: TL.mute }}>
          tilbake til abonnement
        </Link>
      </p>
    </div>
  );
}
