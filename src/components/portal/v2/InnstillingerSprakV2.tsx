"use client";

/**
 * PlayerHQ Innstillinger · Språk — v2 Presis + B-pakke (status, klarspråk).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { T, Kort, StatusPill, ValgKort } from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type InnstillingerSprakData = {
  /** Valgt app-språk fra lesPreferences. */
  spraak: "nb" | "en";
};

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerSprakV2({ data }: { data: InnstillingerSprakData }) {
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
    <div data-paper-wave-g="innstillingersprak" data-paper-portal-innstillinger-sprak data-paper-slug="playerhq-innstillinger" style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div data-paper-pattern-topp>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Språk</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>Innstillinger</span>
      </div>
        {lagret && <StatusPill tone="lime">Lagret</StatusPill>}
      </div>

      <Kort pad="12px">
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.mut, display: "block" }}>Nå</span>
        <div style={{ fontFamily: T.ui, fontWeight: 600, fontSize: 15, marginTop: 8, color: T.fg }}>
          {valgt === "nb" ? "Norsk bokmål" : "English"}
        </div>
      </Kort>

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
