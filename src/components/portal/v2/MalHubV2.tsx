"use client";

import Link from "next/link";
import { ChevronRight, Sparkles, Target, Trophy } from "lucide-react";
import { Ikon, StatusPille, TomTilstand } from "@/components/precision/pa";

export type MalGoalStatus = "on-track" | "behind" | "achieved" | "no-data";

export interface MalGoalRad {
  id: string;
  category: "OUTCOME" | "PROCESS";
  type: string;
  title: string;
  pct: number;
  sub: string;
  status: MalGoalStatus;
  statusLabel: string;
  hasData: boolean;
}

export interface MalHubData {
  antall: number;
  antallResultat: number;
  antallProsess: number;
  goals: MalGoalRad[];
  milepael: { tittel: string; dato: string } | null;
}

function tone(status: MalGoalStatus, pct: number): "ok" | "warn" | "neutral" {
  if (status === "achieved" || (status === "on-track" && pct >= 80)) return "ok";
  if (status === "behind") return "warn";
  return "neutral";
}

export function MalHubV2({ data }: { data: MalHubData }) {
  const { antall, antallResultat, antallProsess, goals, milepael } = data;
  const grupper = [
    { label: "Resultatmål", forklaring: "Resultatet du arbeider mot", goals: goals.filter((goal) => goal.category === "OUTCOME") },
    { label: "Prosessmål", forklaring: "Handlingene som skal føre deg dit", goals: goals.filter((goal) => goal.category === "PROCESS") },
  ];

  return (
    <div className="ph19m">
      <header className="ph19m-hode">
        <div>
          <h1>Mål</h1>
          <p>Mine mål og milepæler</p>
        </div>
        <StatusPille tone={antall > 0 ? "ok" : "neutral"}>{antall} {antall === 1 ? "aktivt" : "aktive"}</StatusPille>
      </header>

      <Link href="/portal/ai/mal-bygger" className="pa-btn pa-btn--primary pa-btn--full">
        {goals.length === 0 ? "Sett første mål" : "Nytt mål"}
      </Link>

      <Link href="/portal/planlegge/bygger" className="pa-card ph19m-lenke">
        <Ikon icon={Sparkles} size={16} name="sparkles" />
        <span>
          <strong>Bygg treningsplan</strong>
          <small>Lag en plan som følger målene dine</small>
        </span>
        <Ikon icon={ChevronRight} size={16} name="chevron-right" />
      </Link>

      {milepael && (
        <section className="pa-card ph19m-kort">
          <p className="ph19m-kicker"><Ikon icon={Trophy} size={14} name="trophy" /> Siste milepæl</p>
          <h2>{milepael.tittel}</h2>
          <small>{milepael.dato}</small>
        </section>
      )}

      {goals.length > 0 && (
        <section className="pa-card ph19m-tall">
          <p><span>Resultatmål</span><strong>{antallResultat}</strong><small>Det du ønsker å oppnå</small></p>
          <p><span>Prosessmål</span><strong>{antallProsess}</strong><small>Det du skal gjøre jevnlig</small></p>
        </section>
      )}

      {goals.length > 0 ? (
        grupper.map((gruppe) => gruppe.goals.length > 0 && (
          <section key={gruppe.label} aria-label={gruppe.label} className="ph19m-gruppe">
            <p className="ph19m-kicker">{gruppe.label}</p>
            <small>{gruppe.forklaring}</small>
            {gruppe.goals.map((g) => (
              <Link key={g.id} href={`/portal/mal/goal/${g.id}`} className="pa-card ph19m-maal" data-status={g.status}>
                <header>
                  <span>
                    <small>{g.type}</small>
                    <strong>{g.title}</strong>
                  </span>
                  <StatusPille tone={tone(g.status, g.pct)}>{g.statusLabel}</StatusPille>
                </header>
                {g.hasData ? (
                  <span className="ph19m-bar" data-status={g.status} aria-label={`Fremdrift ${g.pct} prosent`}>
                    <i style={{ width: `${g.pct}%` }} />
                  </span>
                ) : <small>Ingen data ennå</small>}
                <small>{g.sub}</small>
              </Link>
            ))}
          </section>
        ))
      ) : (
        <TomTilstand icon={Target} title="Ingen mål ennå" text="Sett ditt første mål med knappen over — så sporer du fremgangen her." />
      )}
    </div>
  );
}
