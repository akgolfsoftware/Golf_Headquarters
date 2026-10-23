"use client";

/**
 * PH-04 Live-brief i nytt design (pakke 2 Treningsøkten). Alltid lyst tema (Anders 14.10).
 * Fasit: docs/design-system/utkast-playerhq/treningsokt.html, skjerm «brief». Stil: src/styles/playerhq-ny-okt.css.
 * Handlinger og data-od-id beholdes hos kalleren.
 *
 * Avvik:
 *   - Dra for å endre rekkefølge og øvelsesdetalj med planlagte tellere er ikke med: briefen får bare
 *     navn, metadata og notat per øvelse, og rekkefølgen lagres ikke fra briefen.
 *   - Manglende mål, fokus, tid eller sted vises som «—». Tidligere reservetekster er fjernet.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-04.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-okt.css";
import { LiveInnhold, LiveTittelrad } from "@/components/portal/live/LiveTittelrad";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

export type BriefDrill = {
  id: string;
  name: string;
  meta: string[];
  notes?: string | null;
  target?: string | null;
};

export type SessionBriefProps = {
  title: string;
  durationMin: number;
  scheduledAtISO: string;
  location?: string | null;
  context: string;
  drills: BriefDrill[];
  sections: { label: string; text: string }[];
  action: ReactNode;
  message?: string | null;
  provenance?: string | null;
  odId: string;
};

const clock = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Oslo" });
const kl = (d: Date) => clock.format(d).replace(".", ":");

export function SessionBrief({ title, durationMin, scheduledAtISO, location, context, drills, sections, action, message, provenance, odId }: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const gyldig = Number.isFinite(start.getTime());
  const slutt = new Date(start.getTime() + Math.max(0, durationMin) * 60_000);
  const tid = gyldig ? `${kl(start)}${durationMin > 0 ? `–${kl(slutt)}` : ""}` : "—";
  const t = Math.floor(Math.max(0, durationMin) / 60), m = Math.max(0, durationMin) % 60;

  return <div className="pa-root phn phn-okt phn-skra" data-theme="light" data-od-id={odId} style={{ minHeight: "100dvh" }}>
    <LiveTittelrad
      etikett="Live-økt"
      overlinje={<>Live · Før start · {tid} · {location || "—"}</>}
      tittel={title}
      ingress={context}
      handling={<Link href="/portal/planlegge" className="phn-knapp sek" aria-label="Lukk briefen og gå til Plan"><Ikon icon={ChevronLeft} size={20} name="chevron-left" />Plan</Link>}
    />
    <LiveInnhold><div className="smal">

      <section className="phn-kort" aria-label="Lengde">
        <span className="phn-dato">Økten varer</span>
        <div className="phn-hoved"><strong>{durationMin > 0 ? (t > 0 ? t : m) : "—"}{durationMin > 0 && <small>{t > 0 ? (m > 0 ? `t ${m} min` : "t") : "min"}</small>}</strong></div>
        <span className="sub">{drills.length === 0 ? "Ingen øvelser" : `${drills.length} ${drills.length === 1 ? "øvelse" : "øvelser"}`}</span>
      </section>

      {sections.length > 0 ? <section className="phn-kort" aria-label="Mål for økten">
        {sections.map((s) => <div key={s.label} style={{ display: "grid", gap: 4 }}><span className="phn-dato">{s.label}</span><b className="undertittel" style={{ fontSize: 17 }}>{s.text}</b></div>)}
        {provenance && <span className="phn-kilde">{provenance}</span>}
      </section> : <section className="phn-kort dempet" aria-label="Mål for økten"><span className="phn-dato">Mål for økten</span><p className="phn-forklar">—</p></section>}

      <section className="phn-seksjon" aria-label="Øvelser">
        <div className="phn-sek-topp"><h2>Øvelser</h2><span className="phn-kilde">I rekkefølge</span></div>
        {drills.length === 0
          ? <div className="phn-kort dempet"><b className="undertittel">Ingen øvelser i økten</b><p className="phn-forklar">Coachen har ikke lagt inn øvelser. Start ikke før økten er klar.</p></div>
          : <ol className="ovelser">{drills.map((d, i) => <li key={d.id || i} className="ovelse">
            <span className="nr">{i + 1}</span>
            <div>
              <b>{d.name}</b>
              {d.meta.length > 0 && <div className="formel">{d.meta.map((x, j) => <span key={`${x}-${j}`}>{x}</span>)}</div>}
              {d.target && <p className="sub" style={{ marginTop: 6 }}>{d.target}</p>}
              {d.notes && <p className="phn-forklar" style={{ marginTop: 6 }}>{d.notes}</p>}
            </div>
            <span className="min" />
          </li>)}</ol>}
      </section>

      <div className="startbar">
        {message && <p className="phn-forklar" role="status">{message}</p>}
        {action}
      </div>
    </div>
  </LiveInnhold></div>;
}
