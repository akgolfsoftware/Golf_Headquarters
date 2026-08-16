"use client";

/**
 * PlayerHQ Meg · Avbestill — v2 Presis + B-pakke (status først, Behold = grønn).
 * Avbestill-logikk i actions.ts (cancelPro) — urørt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, Caps, Kort, Knapp, Icon } from "@/components/v2";
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
    <div data-paper-wave-g="megavbestill" data-paper-portal-meg-avbestill data-paper-slug="playerhq-abonnement" style={{ maxWidth: 520, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
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
            color: T.down,
            border: `2px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
            background: `color-mix(in srgb, ${T.down} 8%, transparent)`,
          }}
        >
          <Icon name="alert-triangle" size={26} />
        </span>
        <Caps>Siste bekreftelse · Steg 2 av 2</Caps>
        <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", color: T.fg, margin: 0, lineHeight: 1.1 }}>
          Avbestille <em style={{ fontStyle: "italic", color: T.down }}>Pro</em>?
        </h1>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.6, color: T.mut, margin: 0, maxWidth: 380 }}>
          Du mister disse fordelene når perioden løper ut.{" "}
          <strong style={{ fontWeight: 600, color: T.fg }}>Du betales ikke noe mer</strong> — men
          tilgangen forsvinner gradvis.
        </p>
      </div>

      {/* Pro aktiv til */}
      <Kort>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <Caps size={9}>Pro aktiv til</Caps>
            <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, marginTop: 6 }}>
              <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime, textTransform: "capitalize" }}>{data.ukedag}</em>{" "}
              {data.dato}
            </div>
          </div>
          <div style={{ textAlign: "right", flex: "none" }}>
            <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>kl 23:59</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4 }}>{data.dagerIgjen} dager igjen</div>
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
              borderBottom: i === data.konsekvenser.length - 1 ? "none" : `1px solid ${T.border}`,
            }}
          >
            <Icon name="x-circle" size={15} style={{ color: T.down, flex: "none" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{k.tittel}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>{k.detalj}</div>
            </div>
            <span
              style={{
                flex: "none",
                whiteSpace: "nowrap",
                fontFamily: T.mono,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: T.down,
                background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
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
        style={{ minHeight: 44, color: T.down, border: `1.5px solid color-mix(in srgb, ${T.down} 35%, transparent)` }}
      >
        {pending ? "Avbestiller …" : "Ja, avbestill"}
      </Knapp>
      {feil && (
        <p role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 500, lineHeight: 1.5, color: T.down, textAlign: "center", margin: 0 }}>
          {feil}
        </p>
      )}

      <p style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em", color: T.mut, textAlign: "center", margin: 0 }}>
        Ingenting endres før du bekrefter —{" "}
        <Link href="/portal/meg/abonnement" style={{ color: T.fg2 }}>
          tilbake til abonnement
        </Link>
      </p>
    </div>
  );
}
