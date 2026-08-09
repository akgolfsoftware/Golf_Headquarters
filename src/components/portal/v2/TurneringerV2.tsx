"use client";

/**
 * PlayerHQ Turneringer — v2 Presis + B-pakke (status + én primær Workbench).
 * Påmeldte turneringer. Tom = grønn vei til plan. T.* only.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  CTAPill,
  TomTilstand,
  Icon,
} from "@/components/v2";

/* ── Data-kontrakt (speil av loaderen i den ekte siden) ────────────── */

export type TurneringRad = {
  id: string;
  navn: string;
  dato: string;
  kategori: string;
  bekreftet: boolean;
};

export type TurneringerData = {
  rader: TurneringRad[];
  aar: number;
};

/* Tallord 0–12 (som den ekte siden): «To påmeldt.» leser bedre enn «2 påmeldt.» */
const TALLORD = ["Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];

/** true på klient etter mount når viewport < 768px (styrer kun full-bredde CTA). */
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

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function TurneringerV2({ data }: { data: TurneringerData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { rader, aar } = data;

  const antall = rader.length;
  const antallOrd = antall <= 12 ? TALLORD[antall] : String(antall);

  return (
    <div  data-paper-slug="playerhq-turneringer" data-paper-wave-f="turneringer" data-od-id="playerhq-turneringer" style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Paper .topp */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Turneringer</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            Oversikt · {aar} · {antallOrd} påmeldt
          </span>
        </div>
        <StatusPill tone={antall > 0 ? "info" : "info"}>
          {antall} {antall === 1 ? "turnering" : "turneringer"}
        </StatusPill>
      </div>

      {/* Primær: ink workbench-inngang (planlegging) — enTing hvis booking-intent */}
      <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="calendar-plus" full enTing>
          Planlegg i Workbench
        </CTAPill>
      </Link>

      {/* Turneringsliste */}
      <Kort eyebrow="Kommende turneringer" action={antall > 0 ? <Caps size={9}>{antall} stk</Caps> : undefined}>
        {antall > 0 ? (
          rader.map((t, i) => (
            <Rad
              key={t.id}
              onClick={() => router.push(`/portal/tren/turneringer/${t.id}`)}
              leading={
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    flex: "none",
                    background: T.panel2,
                    border: `1px solid ${T.border}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="trophy" size={18} style={{ color: T.lime }} strokeWidth={1.75} />
                </span>
              }
              title={t.navn}
              sub={`${t.dato} · ${t.kategori}`}
              meta={<StatusPill tone={t.bekreftet ? "up" : "info"}>{t.bekreftet ? "Bekreftet" : "Påmeldt"}</StatusPill>}
              last={i === rader.length - 1}
            />
          ))
        ) : (
          <TomTilstand icon="trophy" title="Ingen kommende turneringer" sub="Melder du deg på, dukker de opp her. Planlegg forberedelse i Workbench." />
        )}
      </Kort>
    </div>
  );
}
