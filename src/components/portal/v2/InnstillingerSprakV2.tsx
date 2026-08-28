"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ Innstillinger · Språk — v2 Presis + B-pakke (status, klarspråk).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { Kort, StatusPill, ValgKort } from "@/components/v2";
import { InnstillingerHode } from "@/components/portal/v2/InnstillingerHode";

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
    <div data-paper-wave-g="innstillingersprak" data-paper-portal-innstillinger-sprak data-paper-slug="playerhq-innstillinger" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <InnstillingerHode
        tittel="Språk"
        undertekst="Innstillinger"
        tilbakeHref="/portal/meg/innstillinger"
        action={lagret ? <StatusPill tone="lime">Lagret</StatusPill> : undefined}
      />

      <Kort pad="12px">
        <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: TL.mute, display: "block" }}>Nå</span>
        <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 15, marginTop: 8, color: TL.text }}>
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
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
          Datoer, tidssone og tallformat følger valgt språk. Mer finmasket kontroll kommer Q3 2026.
        </p>
      </Kort>
    </div>
  );
}
