"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Mål-hub — v2 Presis + B-pakke (status + én primær «nytt mål»).
 * Liste med fremdrift. Tom = full grønn vei til bygger. T.* only.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Caps, Kort, StatusPill, ProgresjonsBar, TomTilstand, Icon, type StatusTone } from "@/components/v2";
/* ── Data-kontrakt (speiler mapGoalRow + siste Achievement fra ekte side) ── */

export type MalGoalStatus = "on-track" | "behind" | "achieved" | "no-data";

export interface MalGoalRad {
  id: string;
  type: string;
  title: string;
  pct: number;
  sub: string;
  status: MalGoalStatus;
  statusLabel: string;
  /** false = ingenting relevant logget ennå — vis aldri en fabrikkert 0 %-bar. */
  hasData: boolean;
}

export interface MalHubData {
  antall: number;
  goals: MalGoalRad[];
  milepael: { tittel: string; dato: string } | null;
}

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** Status → StatusPill-tone. «Nær mål» (on-track ≥80 %) løftes til lime. */
function tone(status: MalGoalStatus, pct: number): StatusTone {
  if (status === "achieved") return "up";
  if (status === "no-data") return "info";
  if (status === "behind") return "warn";
  return pct >= 80 ? "lime" : "info";
}

/** Aksent-/fremdriftsfarge per status (venstre-kant + progressbar). */
function farge(status: MalGoalStatus, pct: number): string {
  if (status === "achieved") return TL.ok;
  if (status === "no-data") return TL.mute;
  if (status === "behind") return TL.warn;
  return pct >= 80 ? TL.fill : TL.fill;
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

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MalHubV2({ data }: { data: MalHubData }) {
  // Pre-eksisterende, ubrukt (jf. JSDoc over) — rørt kun for å unngå
  // lint-max-warnings-0 på filen, ikke ryddet bort (ikke del av denne PR-en).
  const _mobile = useMobile();
  const { antall, goals, milepael } = data;

  return (
    <div data-paper-wave-g="malhub" data-paper-portal-mal style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode + B: status pill */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Mål</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Mine mål og milepæler</span>
        </div>
        </div>
        <StatusPill tone={antall > 0 ? "lime" : "info"}>
          {antall} {antall === 1 ? "aktivt" : "aktive"}
        </StatusPill>
      </div>

      {/* B: én primær CTA full */}
      <Link href="/portal/planlegge/bygger" style={{ textDecoration: "none", display: "block" }}>
        <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
                borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, minHeight: 56,
              }}>{goals.length === 0 ? "Sett første mål" : "Nytt mål"}
        </span>
      </Link>

      {/* Videre-lenke — SMART-veiviser (skiller seg fra CTA-en over: den bygger
          en hel treningsplan fra mal, denne formulerer ett SMART-mål med AI-hjelp).
          Ordinær rad, ingen ny clay-CTA. */}
      <Link href="/portal/ai/mal-bygger" style={{ textDecoration: "none", display: "block" }}>
        <Kort hover>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="sparkles" size={16} style={{ color: TL.mute, flex: "none" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
                AI mål-bygger
              </span>
              <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 1 }}>
                Formuler ett SMART-mål steg for steg
              </span>
            </div>
            <Icon name="chevron-right" size={15} style={{ color: TL.mute, flex: "none" }} />
          </div>
        </Kort>
      </Link>

      {/* Siste milepæl */}
      {milepael && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="trophy" size={14} style={{ color: TL.fill }} />
            <Caps color={TL.fill}>Siste milepæl</Caps>
          </div>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text, lineHeight: 1.3 }}>
            {milepael.tittel}
          </div>
          <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, display: "block", marginTop: 6 }}>
            {milepael.dato}
          </span>
        </Kort>
      )}

      {/* Mål-liste */}
      {goals.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {goals.map((g) => {
            const c = farge(g.status, g.pct);
            return (
              <Link key={g.id} href={`/portal/mal/goal/${g.id}`} style={{ textDecoration: "none" }}>
                <Kort hover style={{ borderLeft: `3px solid ${c}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <Caps size={9} color={c}>{g.type}</Caps>
                      <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 15, color: TL.text, lineHeight: 1.35, marginTop: 4 }}>
                        {g.title}
                      </div>
                    </div>
                    <StatusPill tone={tone(g.status, g.pct)}>{g.statusLabel}</StatusPill>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    {g.hasData ? (
                      <ProgresjonsBar value={g.pct} max={100} label="Fremdrift" color={c} />
                    ) : (
                      <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: TL.mute }}>
                        Ingen data ennå
                      </span>
                    )}
                  </div>

                  <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, display: "block", marginTop: 10 }}>
                    {g.sub}
                  </span>
                </Kort>
              </Link>
            );
          })}
        </div>
      ) : (
        <Kort>
          <TomTilstand
            icon="target"
            title="Ingen mål ennå"
            sub="Sett ditt første mål med knappen over — så sporer du fremgangen her."
          />
        </Kort>
      )}
    </div>
  );
}
