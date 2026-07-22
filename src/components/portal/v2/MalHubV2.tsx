"use client";

/**
 * PlayerHQ Mål-hub — v2 Presis + B-pakke (status + én primær «nytt mål»).
 * Liste med fremdrift. Tom = full grønn vei til bygger. T.* only.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  T,
  Caps,
  Tittel,
  CTAPill,
  Kort,
  StatusPill,
  ProgresjonsBar,
  TomTilstand,
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Data-kontrakt (speiler mapGoalRow + siste Achievement fra ekte side) ── */

export type MalGoalStatus = "on-track" | "behind" | "achieved";

export interface MalGoalRad {
  id: string;
  type: string;
  title: string;
  pct: number;
  sub: string;
  status: MalGoalStatus;
  statusLabel: string;
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
  if (status === "behind") return "warn";
  return pct >= 80 ? "lime" : "info";
}

/** Aksent-/fremdriftsfarge per status (venstre-kant + progressbar). */
function farge(status: MalGoalStatus, pct: number): string {
  if (status === "achieved") return T.up;
  if (status === "behind") return T.warn;
  return pct >= 80 ? T.lime : T.forest;
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
  const mobile = useMobile();
  const { antall, goals, milepael } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + B: status pill */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Mål</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="mål">Mine</Tittel>
          </div>
        </div>
        <StatusPill tone={antall > 0 ? "lime" : "info"}>
          {antall} {antall === 1 ? "aktivt" : "aktive"}
        </StatusPill>
      </div>

      {/* B: én primær CTA full */}
      <Link href="/portal/mal/bygger" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="plus" full>
          {goals.length === 0 ? "Sett første mål" : "Nytt mål"}
        </CTAPill>
      </Link>

      {/* Siste milepæl */}
      {milepael && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="trophy" size={14} style={{ color: T.lime }} />
            <Caps color={T.lime}>Siste milepæl</Caps>
          </div>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, lineHeight: 1.3 }}>
            {milepael.tittel}
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, display: "block", marginTop: 6 }}>
            {milepael.dato}
          </span>
        </Kort>
      )}

      {/* Mål-liste */}
      {goals.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {goals.map((g) => {
            const c = farge(g.status, g.pct);
            return (
              <Link key={g.id} href={`/portal/mal/goal/${g.id}`} style={{ textDecoration: "none" }}>
                <Kort hover style={{ borderLeft: `3px solid ${c}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <Caps size={9} color={c}>{g.type}</Caps>
                      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, lineHeight: 1.35, marginTop: 4 }}>
                        {g.title}
                      </div>
                    </div>
                    <StatusPill tone={tone(g.status, g.pct)}>{g.statusLabel}</StatusPill>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <ProgresjonsBar value={g.pct} max={100} label="Fremdrift" color={c} />
                  </div>

                  <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, display: "block", marginTop: 10 }}>
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
