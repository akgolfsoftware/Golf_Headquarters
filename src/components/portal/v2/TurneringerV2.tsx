"use client";

/**
 * PlayerHQ Turneringer — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen (src/app/portal/tren/turneringer/page.tsx) med EKTE TournamentEntry-
 * data: ren lese-oversikt over spillerens turneringskalender. Kun v2-komponenter
 * fra "@/components/v2"; ingen ad-hoc UI-primitiver, ingen rå hex (kun T.*).
 *
 * Funksjonen bevares 1:1: eyebrow «OVERSIKT · {år}» → «{N} påmeldt.» → lead →
 * guidance-kort → turneringsliste (trophy + navn + dato·kategori + status +
 * chevron, klikk → detalj) → «Planlegg i Workbench». Ærlig tom-tilstand.
 *
 * V2Shell (montert i (v2preview)/v2-turneringer/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  Knapp,
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Oversikt · {aar}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="påmeldt.">{antallOrd}</Tittel>
          </div>
        </div>
      </div>

      <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: 0, maxWidth: "62ch" }}>
        Hva som kommer. Å planlegge mot en turnering skjer i Workbench.
      </p>

      {/* Guidance — ren oversikt */}
      <Kort tint>
        <Caps size={9} style={{ marginBottom: 8 }}>Ren oversikt</Caps>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
          Dette er en ren oversikt. Trykk{" "}
          <b style={{ color: T.fg, fontWeight: 600 }}>«Planlegg i Workbench»</b> for å legge en turnering i årsplanen.
        </p>
      </Kort>

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
          <TomTilstand icon="trophy" title="Ingen kommende turneringer" sub="Turneringer du melder deg på dukker opp her." />
        )}
      </Kort>

      {/* Primær CTA */}
      <div>
        <Knapp icon="calendar-plus" full={mobile} onClick={() => router.push("/portal/planlegge")}>
          Planlegg i Workbench
        </Knapp>
      </div>
    </div>
  );
}
