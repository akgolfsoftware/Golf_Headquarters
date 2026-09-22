"use client";

// Delte byggesteiner for WANG Årsplan 2026/27-fellessiden (fasit levert
// 25.08.2026). Egen, isolert primitiv-fil for den nye fasiten — rører ikke
// `../primitiver.tsx` som den kjørende `/team-wang`-siden bruker i dag.

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

import { d, iso } from "../../_data/wang-plan";

export const MAKS_BREDDE = 1160;

export function Wrap({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: MAKS_BREDDE,
        margin: "0 auto",
        padding: "0 clamp(16px, 4vw, 28px)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export function Seksjon({
  id,
  children,
  topPad = true,
}: {
  id: string;
  children: ReactNode;
  topPad?: boolean;
}) {
  return (
    <section
      id={id}
      style={{
        maxWidth: MAKS_BREDDE,
        margin: "0 auto",
        padding: topPad
          ? "clamp(36px, 6vw, 56px) clamp(16px, 4vw, 28px) 0"
          : "0 clamp(16px, 4vw, 28px)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </section>
  );
}

/**
 * Overskriftsblokk — restylet 22.09.2026 mot Claude Design-prosjektet «Årsplan
 * Golf WANG Golf Fredrikstad» (779d22c8, mal wang-golf-fellesside): stor
 * uthevet eyebrow i teal, tynn (300) overskrift i stedet for fet, ingen
 * nummerert sirkel foran — designet bruker bare eyebrow-teksten som "steg".
 * `nr` beholdes i signaturen (brukt av eksisterende kall) men vises ikke.
 */
export function SeksjonHode({
  label,
  tittel,
  ingress,
  maksBredde = 660,
}: {
  nr?: number | string;
  label: string;
  tittel: string;
  ingress?: string;
  maksBredde?: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          margin: "0 0 6px",
          fontFamily: "var(--font-brand)",
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--wang-teal-text)",
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: "var(--font-brand)",
          fontWeight: 300,
          fontSize: "clamp(24px, 4.2vw, 32px)",
          letterSpacing: "-0.015em",
          lineHeight: 1.1,
          margin: 0,
          color: "var(--text-primary)",
        }}
      >
        {tittel}
      </h2>
      {ingress ? (
        <p
          style={{
            fontSize: "clamp(14.5px, 2vw, 16px)",
            lineHeight: 1.55,
            color: "var(--text-secondary)",
            maxWidth: maksBredde,
            marginTop: 8,
          }}
        >
          {ingress}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Kortflate — restylet 22.09.2026 mot samme designfasit: hvit flate, 4 px
 * radius, 1 px `var(--neutral-200)`-kant, ingen skygge (erstatter forrige runde,
 * runde-20-med-skygge-kort). `style.borderTop` kan fortsatt sette en farget
 * 3–4 px topplinje for periode-/aksefarge, slik designet gjør på kortene.
 */
export function WangKort({
  children,
  style,
  padding = "clamp(18px, 3vw, 24px)",
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: string | number;
}) {
  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: 4,
        border: "1px solid var(--neutral-200)",
        padding,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface PillOption {
  label: string;
  aktiv: boolean;
  onVelg: () => void;
}

export function PillGruppe({
  valg,
  aktivBg = "var(--wang-navy)",
  aktivFg = "var(--white)",
}: {
  valg: PillOption[];
  aktivBg?: string;
  aktivFg?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {valg.map((v) => (
        <button
          key={v.label}
          type="button"
          onClick={v.onVelg}
          style={{
            fontFamily: "var(--font-brand)",
            fontWeight: 500,
            fontSize: 13,
            padding: "7px 16px",
            minHeight: 36,
            borderRadius: 999,
            border: `1px solid ${v.aktiv ? aktivBg : "var(--neutral-200)"}`,
            background: v.aktiv ? aktivBg : "var(--white)",
            color: v.aktiv ? aktivFg : "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({
  children,
  farge,
  tint,
  style,
}: {
  children: ReactNode;
  farge: string;
  tint: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-brand)",
        fontWeight: 500,
        fontSize: 11,
        letterSpacing: "0.02em",
        padding: "3px 10px",
        borderRadius: 999,
        border: `1px solid ${farge}`,
        background: tint,
        color: farge,
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        lineHeight: 1.3,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Fadeinn-klassen — definert i wang-tokens.css (§Årsplan 2026/27-tillegg). */
export const fadeUpClass = "wang-arsplan-fade";

export function EntallFlertall(n: number, entall: string, flertall: string): string {
  return n === 1 ? "1 " + entall : n + " " + flertall;
}

// ---- Dato-hjelpere, delt av Trening-/Foreldre-/Kalender-fanen -----------

function osloIdagIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
}
const tomAbonnement = () => () => {};
let naaCache: string | null = null;
function klientNaa(): string {
  naaCache ??= osloIdagIso();
  return naaCache;
}

/**
 * Oslo-korrekt "i dag", hydreringstrygt (server viser `fallbackIso` inntil
 * klienten har montert — se wang-fellesside.tsx for opphavsmønsteret).
 */
export function useOsloIdagIso(fallbackIso: string): string {
  return useSyncExternalStore(tomAbonnement, klientNaa, () => fallbackIso);
}

/** Mandagen i uka til `isoDato` (ISO, UTC-trygt). */
export function mandagAv(isoDato: string): string {
  const dt = d(isoDato);
  const dag = dt.getUTCDay();
  const off = dag === 0 ? -6 : 1 - dag;
  dt.setUTCDate(dt.getUTCDate() + off);
  return iso(dt);
}

/** `isoDato` + `n` dager (kan være negativ), ISO, UTC-trygt. */
export function leggTilDager(isoDato: string, n: number): string {
  const dt = d(isoDato);
  dt.setUTCDate(dt.getUTCDate() + n);
  return iso(dt);
}

export function klampTilIntervall(isoDato: string, startIso: string, sluttIso: string): string {
  if (isoDato < startIso) return startIso;
  if (isoDato > sluttIso) return sluttIso;
  return isoDato;
}

/**
 * Delt hero for Skole-/Kalender-/Foreldre-fanen — samme navy gradient og
 * tynne overskriftsvekt som Treningsfanens hero, uten fotoseksjon (designets
 * foto er ikke overført til appen ennå). Treningsfanens hero har egen,
 * rikere variant (Sted-/trener-bånd) og bruker ikke denne.
 */
export function FaneHero({ eyebrow, tittel, ingress }: { eyebrow: string; tittel: string; ingress: string }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(160deg, color-mix(in srgb, var(--wang-navy) 82%, white) 0%, var(--wang-navy) 55%, color-mix(in srgb, var(--wang-navy) 82%, black) 100%)",
        color: "var(--white)",
      }}
    >
      <Wrap>
        <div style={{ padding: "clamp(32px,5.5vw,44px) 0" }}>
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-brand)",
              fontWeight: 500,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--white)",
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-brand)",
              fontWeight: 300,
              fontSize: "clamp(26px,5vw,38px)",
              letterSpacing: "-0.015em",
              lineHeight: 1.12,
              maxWidth: "26ch",
            }}
          >
            {tittel}
          </h1>
          <p style={{ fontSize: "clamp(14.5px,2vw,17px)", lineHeight: 1.55, color: "var(--text-on-dark-78)", maxWidth: 560, marginTop: 12 }}>
            {ingress}
          </p>
        </div>
      </Wrap>
    </div>
  );
}
