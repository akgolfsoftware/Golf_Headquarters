"use client";

/**
 * PlayerHQ Coach-øvelser — v2 (retning C «Presis», mørk). Rekomponert fra den
 * ekte skjermen src/app/portal/coach/ovelser/page.tsx: coach-tildelt
 * øvelsesbibliotek (ExerciseDefinition) med filter per pyramideområde og
 * kort-liste med AK-formel-chips. Åpner drill-detalj (/portal/drills/{id}).
 *
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI, ingen rå hex (T.*).
 * EKTE data — filtreres klientside. Ærlig tom-tilstand når biblioteket er tomt
 * eller et filter ikke gir treff. Norsk bokmål; ordboken låst.
 *
 * V2Shell (montert i (v2preview)/v2-coach-ovelser/page.tsx) eier chrome-en;
 * denne komponenten rendrer bare den indre innholds-stacken.
 *
 * Gap meldt: legacy-kortets inline rediger/slett-meny (ExerciseCardActions) har
 * ingen v2-motpart (kort-hjørne-kebab). Utelatt her framfor å blande inn ad-hoc
 * UI — redigering nås fortsatt via /portal/coach/ovelser/{id}/rediger.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PyramidArea } from "@/generated/prisma/client";
import type { AkseKey } from "@/lib/v2/tokens";
import {
  T,
  Caps,
  Tittel,
  CTAPill,
  PillTabs,
  Kort,
  AkseChip,
  LFaseBadge,
  Bit,
  TomTilstand,
  Icon,
} from "@/components/v2";

/* ── Datakontrakt (speiler ExerciseDefinition-feltene skjermen bruker) ── */

export type CoachOvelseItem = {
  id: string;
  navn: string;
  omrade: PyramidArea;
  varighetMin: number | null;
  repsSets: string | null;
  /** Læringsfase L1–L5 (lPhase) — driver LFaseBadge når satt. */
  lFase: string | null;
  csMin: number | null;
  csMax: number | null;
};

export type CoachOvelserData = {
  /** Coachen øvelsene tilhører (demo-kanon: Anders). */
  coachNavn: string;
  ovelser: CoachOvelseItem[];
};

/* ── Filter-oppsett (samme områder som den ekte skjermen) ──────────────── */

const OMRADE_TABS: { id: PyramidArea | "ALLE"; l: string }[] = [
  { id: "ALLE", l: "Alle" },
  { id: "FYS", l: "FYS" },
  { id: "TEK", l: "Teknisk" },
  { id: "SLAG", l: "Slag" },
  { id: "SPILL", l: "Spill" },
  { id: "TURN", l: "Turnering" },
];

/** Kort-meta: «3×10 · 20 min» — bygget kun av ekte, satte felter. */
function metaLinje(o: CoachOvelseItem): string {
  return [o.repsSets, o.varighetMin != null ? `${o.varighetMin} min` : null]
    .filter(Boolean)
    .join(" · ");
}

/** CS-intervall som mono-bit, kun når minst én grense er satt. */
function csTekst(o: CoachOvelseItem): string | null {
  if (o.csMin == null && o.csMax == null) return null;
  if (o.csMin != null && o.csMax != null) return `CS${o.csMin}–${o.csMax}`;
  return `CS${o.csMin ?? o.csMax}`;
}

/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
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

/* ── Skjerm ────────────────────────────────────────────────────────────── */

export function CoachOvelserV2({ data }: { data: CoachOvelserData }) {
  const mobile = useMobile();
  const { coachNavn, ovelser } = data;
  const [omrade, setOmrade] = useState<PyramidArea | "ALLE">("ALLE");

  const synlige = useMemo(
    () => (omrade === "ALLE" ? ovelser : ovelser.filter((o) => o.omrade === omrade)),
    [omrade, ovelser],
  );

  const tomtBibliotek = ovelser.length === 0;
  const valgtLabel = OMRADE_TABS.find((t) => t.id === omrade)?.l ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Coach · Øvelser</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={coachNavn}>Øvelser fra</Tittel>
          </div>
          <Caps size={9} style={{ marginTop: 8, color: T.mut }}>
            {ovelser.length} øvelse{ovelser.length === 1 ? "" : "r"} i biblioteket
          </Caps>
        </div>
        <Link href="/portal/coach/ovelser/ny" style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Ny øvelse</CTAPill>
        </Link>
      </div>

      {/* Filter per pyramideområde */}
      {!tomtBibliotek && (
        <PillTabs tabs={OMRADE_TABS.map((t) => ({ id: t.id, l: t.l }))} value={omrade} onChange={(id) => setOmrade(id as PyramidArea | "ALLE")} />
      )}

      {/* Innhold */}
      {tomtBibliotek ? (
        <Kort>
          <TomTilstand
            icon="dumbbell"
            title="Ingen øvelser ennå"
            sub="Opprett den første øvelsen for å begynne å bygge treningsbiblioteket."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Link href="/portal/coach/ovelser/ny" style={{ textDecoration: "none" }}>
              <CTAPill icon="plus">Opprett øvelse</CTAPill>
            </Link>
          </div>
        </Kort>
      ) : synlige.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="filter"
            title={`Ingen øvelser i ${valgtLabel}`}
            sub="Velg et annet område, eller opprett en øvelse her."
          />
        </Kort>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 12 }}>
          {synlige.map((o) => (
            <OvelseKort key={o.id} o={o} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Kort ──────────────────────────────────────────────────────────────── */

function OvelseKort({ o }: { o: CoachOvelseItem }) {
  const meta = metaLinje(o);
  const cs = csTekst(o);

  return (
    <Link href={`/portal/drills/${o.id}`} style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}>
      <Kort hover pad="14px 15px" style={{ gap: 10, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <AkseChip a={o.omrade as AkseKey} />
          <Icon name="chevron-right" size={14} style={{ color: T.mut }} />
        </div>

        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, lineHeight: 1.3 }}>
          {o.navn}
        </div>

        {(o.lFase || cs) && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {o.lFase && <LFaseBadge fase={o.lFase} kompakt />}
            {cs && <Bit monoTekst>{cs}</Bit>}
          </div>
        )}

        {meta && (
          <Caps size={9} style={{ color: T.mut }}>
            {meta}
          </Caps>
        )}
      </Kort>
    </Link>
  );
}
