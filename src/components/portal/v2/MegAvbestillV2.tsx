"use client";

/**
 * PlayerHQ Meg · Abonnement · Avbestill (steg 2 av 2) — v2 (retning C «Presis»).
 * Rekomponert fra /portal/meg/abonnement/avbestill/page.tsx + avbestill-buttons.tsx.
 * KRITISK (gotchas.md): all avbestill-logikk bor i actions.ts (cancelPro kaller
 * Stripe FØR DB) — denne komponenten er KUN presentasjon rundt samme kall,
 * samme confirm()-vakt og samme feilhåndtering som før.
 *
 * Konsekvens-listen er redaksjonell forklaringstekst (hva Pro-fordelene er),
 * 1:1 fra kildeskjermen — ikke spillerens egne data.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, Caps, Kort, Knapp, Icon } from "@/components/v2";
import { cancelPro } from "@/app/portal/meg/abonnement/avbestill/actions";

export type MegAvbestillData = {
  /** Ukedag for siste Pro-dag, f.eks. «onsdag». */
  ukedag: string;
  /** Dato for siste Pro-dag, f.eks. «12. august 2026». */
  dato: string;
  dagerIgjen: number;
};

const KONSEKVENSER = [
  { tittel: "AI-coach ubegrenset", detalj: "låses etter 1 måned", etterpaa: "→ låst" },
  { tittel: "Coaching-credits", detalj: "fra 4 / mnd til 0", etterpaa: "→ 0" },
  { tittel: "Videoanalyse fra coach", detalj: "opplastinger låses", etterpaa: "→ låst" },
  { tittel: "Komplett historikk", detalj: "kuttes til siste 30 dager", etterpaa: "→ 30 dgr" },
  { tittel: "Familiekonto", detalj: "far/mor mister tilgang", etterpaa: "→ utløper" },
];

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
    <div style={{ maxWidth: 520, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
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
        {KONSEKVENSER.map((k, i) => (
          <div
            key={k.tittel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: i === KONSEKVENSER.length - 1 ? "none" : `1px solid ${T.border}`,
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

      {/* Pause-alternativ (samme informasjon som kildeskjermen) */}
      <Kort tint>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: T.lime,
              color: T.onLime,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="pause" size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 700, color: T.fg }}>
              Vil du heller pause i 1 måned?
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.5, marginTop: 2 }}>
              Behold all data — ingen belastning før august. Ta kontakt med support, så ordner vi det.
            </div>
          </div>
        </div>
      </Kort>

      {/* Handlinger — behold (autofokus-idiomet fra kilden: trygt valg først) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Knapp icon="heart" onClick={() => router.push("/portal/meg/abonnement")} style={{ minHeight: 44 }}>
          Behold Pro
        </Knapp>
        <Knapp
          ghost
          disabled={pending}
          onClick={avbestill}
          style={{ minHeight: 44, color: T.down, border: `1.5px solid color-mix(in srgb, ${T.down} 35%, transparent)` }}
        >
          {pending ? "Avbestiller …" : "Ja, avbestill"}
        </Knapp>
      </div>
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
