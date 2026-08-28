"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Coach-øvelser — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PyramidArea } from "@/generated/prisma/client";
import type { AkseKey } from "@/lib/v2/tokens";
import { Caps, PillTabs, Kort, AkseChip, LFaseBadge, Bit, TomTilstand, Icon } from "@/components/v2";
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

/* ── Skjerm ────────────────────────────────────────────────────────────── */

export function CoachOvelserV2({ data }: { data: CoachOvelserData }) {
  const { ovelser } = data;
  const [omrade, setOmrade] = useState<PyramidArea | "ALLE">("ALLE");

  const synlige = useMemo(
    () => (omrade === "ALLE" ? ovelser : ovelser.filter((o) => o.omrade === omrade)),
    [omrade, ovelser],
  );

  const tomtBibliotek = ovelser.length === 0;
  const valgtLabel = OMRADE_TABS.find((t) => t.id === omrade)?.l ?? "";

  return (
    <div data-paper-wave-g="coachovelser" data-paper-portal-coach-ovelser data-paper-slug="playerhq-coach-hub" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Øvelser</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Coach</span>
        </div>
          <Caps size={9} style={{ marginTop: 8, color: TL.mute }}>
            {ovelser.length} øvelse{ovelser.length === 1 ? "" : "r"} i biblioteket
          </Caps>
        </div>
        <Link href="/portal/coach/ovelser/ny" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Ny øvelse</span>
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
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/coach/ovelser/ny" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Opprett øvelse</span>
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
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/coach/ovelser/ny" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Opprett øvelse</span>
            </Link>
          </div>
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
          <Icon name="chevron-right" size={14} style={{ color: TL.mute }} />
        </div>

        <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 15, color: TL.text, lineHeight: 1.3 }}>
          {o.navn}
        </div>

        {(o.lFase || cs) && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {o.lFase && <LFaseBadge fase={o.lFase} kompakt />}
            {cs && <Bit monoTekst>{cs}</Bit>}
          </div>
        )}

        {meta && (
          <Caps size={9} style={{ color: TL.mute }}>
            {meta}
          </Caps>
        )}
      </Kort>
    </Link>
  );
}
