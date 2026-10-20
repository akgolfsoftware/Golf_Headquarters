"use client";

import Link from "next/link";
import { ArrowRight, Flag, List, Search, Trophy, Users, Wrench } from "lucide-react";
import { StatsRamme, useMobile } from "./stats-ramme";
import { KnappLenke } from "@/components/precision/pa";

const FAMILIER = [
  { navn: "Spillere", text: "Søk i spillerresultater. Velg periode og utvalg før du sammenligner.", href: "/stats/spillere", icon: Users },
  { navn: "Turneringer", text: "Finn en turnering og se resultatlisten med kilde og dato.", href: "/stats/turneringer", icon: Trophy },
  { navn: "Klubber", text: "Utforsk tilgjengelige resultater fordelt på klubb.", href: "/stats/klubber", icon: Flag },
  { navn: "Baner", text: "Finn baner og tilgjengelig informasjon om bane og utslagssted.", href: "/stats/baner", icon: Search },
  { navn: "Topplister", text: "Se hvilket utvalg og hvilken periode hver liste bygger på.", href: "/stats/leaderboards", icon: List },
  { navn: "Verktøy", text: "Beregn og utforsk med egne verdier. Estimater er merket.", href: "/stats/verktoy", icon: Wrench },
] as const;

export interface MarkedStatsHubV2Props { norskeIAksjon: number | null; kommendeTurneringer: number | null; sisteSync: string; totalBaner: number | null }

/** Offentlig ST-01. Kun innsendte, kildeavgrensede tall; ingen demostørrelser. */
export function MarkedStatsHubV2({ norskeIAksjon, kommendeTurneringer, sisteSync, totalBaner }: MarkedStatsHubV2Props) {
  const mobile = useMobile();
  const updated = sisteSync && sisteSync !== "—";
  return <StatsRamme mobile={mobile} waveId="marked-stats-hub">
    <div className="support-stats-hub">
      <header className="support-stats-hero">
        <p>AK Golf Stats</p><h1>Norsk golf.<br />Tall med kilde.</h1>
        <div><p>Finn spillere, turneringer og verktøy. Du ser hva resultatene bygger på før du sammenligner.</p>
          <KnappLenke href="/stats/spillere" iconRight={ArrowRight}>Finn en spiller</KnappLenke>
        </div>
      </header>
      <dl className="support-stats-counts">
        <div><dt>Norske i registrerte turneringer denne uka</dt><dd>{norskeIAksjon == null ? "Ikke tilgjengelig" : norskeIAksjon.toLocaleString("nb-NO")}</dd></div>
        <div><dt>Registrerte turneringer neste 30 dager</dt><dd>{kommendeTurneringer == null ? "Ikke tilgjengelig" : kommendeTurneringer.toLocaleString("nb-NO")}</dd></div>
        <div><dt>Baner i utvalget</dt><dd>{totalBaner == null ? "Ikke tilgjengelig" : totalBaner.toLocaleString("nb-NO")}</dd></div>
      </dl>
      <p className="support-kilde">{updated ? `Siste registrerte oppdatering: ${sisteSync}.` : "Oppdateringstidspunkt er ikke tilgjengelig."} Kilde og periode følger det enkelte resultatet. Et manglende tall er ikke målt null.</p>
      <section aria-labelledby="stats-familier"><h2 id="stats-familier">Utforsk</h2>
        <div className="support-stats-familier">{FAMILIER.map(({ navn, text, href, icon: Icon }) => <Link key={href} href={href}>
          <Icon size={24} aria-hidden /><div><h3>{navn}</h3><p>{text}</p></div><ArrowRight size={22} aria-hidden />
        </Link>)}</div>
      </section>
      <section className="support-stats-player"><h2>Følg ditt eget spill</h2><p>PlayerHQ samler din plan, registrerte økter og resultater. Du velger hva du deler med coachen.</p>
        <KnappLenke variant="secondary" href="/playerhq" iconRight={ArrowRight}>Se PlayerHQ</KnappLenke>
      </section>
    </div>
  </StatsRamme>;
}
