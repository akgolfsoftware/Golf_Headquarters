"use client";

/**
 * PlayerHQ Innstillinger · Språk og region — v2 (retning C «Presis»).
 * v2-port 17. juli 2026: erstatter SpraakToggle-presentasjonen. Lagringslogikk
 * bevart 1:1: valg av «nb» kaller oppdaterPreferences({ spraak }) + refresh +
 * «Lagret»-flash; «en» er fortsatt sperret (kommer Q3 2026) — samme oppførsel
 * som originalen på denne siden.
 *
 * Kun v2-komponenter fra "@/components/v2" + T.*-tokens. Ingen rå hex.
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { T, Tittel, Kort, StatusPill, ValgKort } from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerSprakData = {
  /** Valgt app-språk fra lesPreferences. */
  spraak: "nb" | "en";
};

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
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

export function InnstillingerSprakV2({ data }: { data: InnstillingerSprakData }) {
  const mobile = useMobile();
  const router = useRouter();
  const [valgt, setValgt] = useState<"nb" | "en">(data.spraak);
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function bytt(nytt: "nb" | "en") {
    if (nytt === "en") return; // sperret — kommer senere
    if (pending) return;
    setValgt(nytt);
    startTransition(async () => {
      await oppdaterPreferences({ spraak: nytt });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Tittel mobile={mobile}>Språk og region</Tittel>
        {lagret && <StatusPill tone="lime">Lagret</StatusPill>}
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "-8px 0 0" }}>
        Velg hvilket språk appen vises på. Tidssone og datoformat tilpasses automatisk.
      </p>

      {/* Språkvalg */}
      <Kort eyebrow="App-språk">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ValgKort
            tittel="Norsk bokmål"
            sub="Standard for AK Golf"
            valgt={valgt === "nb"}
            onClick={() => bytt("nb")}
          />
          {/* Engelsk er ikke tilgjengelig ennå — vises ærlig som sperret. */}
          <div style={{ opacity: 0.55, pointerEvents: "none" }} aria-disabled title="Engelsk-støtte kommer senere">
            <ValgKort
              tittel="English"
              tag="Snart"
              sub="Kommer Q3 2026"
              valgt={valgt === "en"}
            />
          </div>
        </div>
      </Kort>

      {/* Region og format */}
      <Kort eyebrow="Region og format">
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
          Datoer, tidssone og tallformat følger valgt språk. Mer finmasket kontroll kommer Q3 2026.
        </p>
      </Kort>
    </div>
  );
}
