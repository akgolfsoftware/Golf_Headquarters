"use client";

/**
 * PlayerHQ · Meg · Feedback-historikk (P2)
 *
 * Liste over alle tidligere innsendte tilbakemeldinger med filter på status,
 * og en modal-tråd dersom coach har svart.
 */
import { useMemo, useState } from "react";
import {
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Filter,
  MessageSquare,
  X,
  Send,
  History,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FeedbackType = "bug" | "forslag" | "ros" | "sporsmal";
type Status = "sendt" | "lest" | "besvart";
type StatusFilter = "alle" | Status;

type Svar = {
  fra: string;
  rolle: string;
  initialer: string;
  dato: string;
  tekst: string;
};

type Feedback = {
  id: string;
  dato: string;
  nps: number;
  type: FeedbackType;
  status: Status;
  tekst: string;
  svar?: Svar;
};

const HISTORIKK: Feedback[] = [
  {
    id: "f-001",
    dato: "2026-05-18T19:32:00Z",
    nps: 9,
    type: "forslag",
    status: "besvart",
    tekst:
      "Hadde vært kult å kunne dele PR-en min direkte til Instagram-story med stats påklistret — gjerne med pyramide-figuren og siste rundes scorecard som et lite kort over.",
    svar: {
      fra: "AK Support",
      rolle: "Produktansvarlig",
      initialer: "AK",
      dato: "2026-05-19T08:45:00Z",
      tekst:
        "Takk for forslaget — vi har det på roadmap-en for Q3 2026. Vi planlegger en delings-modul med Instagram-story, Twitter-kort og PDF-eksport av PR-runder. Følg med i releases.",
    },
  },
  {
    id: "f-002",
    dato: "2026-05-12T14:10:00Z",
    nps: 4,
    type: "bug",
    status: "besvart",
    tekst:
      "Trackman-import feilet i går — fikk timeout etter 30 sekunder selv om økten var lagret i Trackman Cloud.",
    svar: {
      fra: "AK Support",
      rolle: "Teknisk support",
      initialer: "MR",
      dato: "2026-05-13T09:20:00Z",
      tekst:
        "Vi fant feilen — Trackman-API-en hadde en regional outage 11.–12. mai. Fikset i deploy v0.9.3 onsdag. Prøv import på nytt, det skal gå på under 5 sekunder.",
    },
  },
  {
    id: "f-003",
    dato: "2026-05-05T20:48:00Z",
    nps: 10,
    type: "ros",
    status: "lest",
    tekst:
      "Pyramide-systemet er det beste verktøyet jeg har sett for å balansere trening. Endelig forstår jeg hvorfor jeg sklir på short game når jeg overinvesterer i driver.",
  },
  {
    id: "f-004",
    dato: "2026-04-28T11:15:00Z",
    nps: 7,
    type: "sporsmal",
    status: "sendt",
    tekst:
      "Hvordan tar jeg eksport av all min historikk hvis jeg vil bytte til en annen app i fremtiden? Er det GDPR-eksport tilgjengelig?",
  },
  {
    id: "f-005",
    dato: "2026-04-15T08:30:00Z",
    nps: 8,
    type: "forslag",
    status: "lest",
    tekst:
      "Kunne vært fint med en widget på iOS hjem-skjerm som viser dagens trening i pyramide-systemet, slik at jeg ser hva som står på programmet uten å åpne appen.",
  },
];

const TYPE_INFO: Record<FeedbackType, { navn: string; ikon: LucideIcon; tone: string }> = {
  bug: {
    navn: "Bug",
    ikon: Bug,
    tone: "bg-destructive/15 text-destructive border-destructive/30",
  },
  forslag: {
    navn: "Forslag",
    ikon: Lightbulb,
    tone: "bg-accent/30 text-foreground border-accent/40",
  },
  ros: {
    navn: "Ros",
    ikon: Heart,
    tone: "bg-primary/10 text-primary border-primary/30",
  },
  sporsmal: {
    navn: "Spørsmål",
    ikon: HelpCircle,
    tone: "bg-secondary text-foreground border-border",
  },
};

const STATUS_INFO: Record<Status, { navn: string; tone: string }> = {
  sendt: {
    navn: "Sendt",
    tone: "bg-secondary text-muted-foreground border-border",
  },
  lest: {
    navn: "Lest",
    tone:
      "bg-[color:rgb(217_119_6)]/10 text-[color:rgb(217_119_6)] border-[color:rgb(217_119_6)]/30",
  },
  besvart: {
    navn: "Besvart",
    tone: "bg-primary/10 text-primary border-primary/30",
  },
};

function npsTone(v: number): string {
  if (v >= 9) return "bg-primary text-primary-foreground";
  if (v >= 7) return "bg-[color:rgb(217_119_6)] text-white";
  return "bg-destructive text-destructive-foreground";
}

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDatoTid(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

export function FeedbackHistorikk() {
  const [filter, setFilter] = useState<StatusFilter>("alle");
  const [apent, setApent] = useState<Feedback | null>(null);

  const filtrert = useMemo(
    () => (filter === "alle" ? HISTORIKK : HISTORIKK.filter((f) => f.status === filter)),
    [filter],
  );

  const filterDef: { id: StatusFilter; navn: string; antall: number }[] = [
    { id: "alle", navn: "Alle", antall: HISTORIKK.length },
    {
      id: "sendt",
      navn: "Sendt",
      antall: HISTORIKK.filter((f) => f.status === "sendt").length,
    },
    {
      id: "lest",
      navn: "Lest",
      antall: HISTORIKK.filter((f) => f.status === "lest").length,
    },
    {
      id: "besvart",
      navn: "Besvart",
      antall: HISTORIKK.filter((f) => f.status === "besvart").length,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <History
            size={18}
            strokeWidth={1.75}
            className="text-muted-foreground"
          />
          <h2 className="font-display text-xl font-medium italic tracking-tight">
            Mine tidligere tilbakemeldinger
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {HISTORIKK.length} totalt
        </span>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Filter size={12} strokeWidth={1.75} />
          Status
        </span>
        {filterDef.map((f) => {
          const aktiv = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              {f.navn}
              <span
                className={`font-mono text-[10px] tabular-nums ${
                  aktiv ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {f.antall}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabell */}
      {filtrert.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-10 text-center">
          <p className="font-display text-base italic text-muted-foreground">
            Ingen tilbakemeldinger i dette filteret.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-border bg-card">
          {filtrert.map((f) => {
            const TypeIkon = TYPE_INFO[f.type].ikon;
            const klikkbar = f.status === "besvart" && !!f.svar;
            return (
              <li
                key={f.id}
                className="border-b border-border last:border-0"
              >
                <button
                  type="button"
                  disabled={!klikkbar}
                  onClick={() => klikkbar && setApent(f)}
                  className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors ${
                    klikkbar
                      ? "cursor-pointer hover:bg-secondary/40"
                      : "cursor-default"
                  }`}
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-md font-mono text-xs font-bold tabular-nums ${npsTone(f.nps)}`}
                  >
                    {f.nps}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${TYPE_INFO[f.type].tone}`}
                      >
                        <TypeIkon size={10} strokeWidth={1.75} />
                        {TYPE_INFO[f.type].navn}
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {formatDato(f.dato)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-foreground">
                      {f.tekst}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${STATUS_INFO[f.status].tone}`}
                    >
                      {STATUS_INFO[f.status].navn}
                    </span>
                    {klikkbar && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-primary">
                        <MessageSquare size={10} strokeWidth={1.75} />
                        Se svar
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal */}
      {apent && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Tilbakemelding-tråd"
          onClick={() => setApent(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-border p-4 md:p-6">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Tilbakemelding-tråd · {formatDato(apent.dato)}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                  <em className="italic text-primary font-normal">
                    {TYPE_INFO[apent.type].navn}
                  </em>{" "}
                  · NPS {apent.nps}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Lukk"
                onClick={() => setApent(null)}
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            </header>

            <div className="space-y-6 p-4 md:p-6">
              {/* Din melding */}
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[11px] font-semibold text-foreground">
                  DU
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold leading-none">
                      Du
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatDatoTid(apent.dato)}
                    </span>
                  </div>
                  <p className="mt-2 rounded-md bg-secondary/40 px-4 py-3 text-[13px] leading-relaxed text-foreground">
                    {apent.tekst}
                  </p>
                </div>
              </div>

              {/* Coach-svar */}
              {apent.svar && (
                <div className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                    {apent.svar.initialer}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[13px] font-semibold leading-none">
                        {apent.svar.fra}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        {apent.svar.rolle}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {formatDatoTid(apent.svar.dato)}
                    </div>
                    <p className="mt-2 rounded-md bg-primary/5 px-4 py-3 text-[13px] leading-relaxed text-foreground">
                      {apent.svar.tekst}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-border bg-secondary/30 px-6 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Trenger du å følge opp?
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:opacity-90"
              >
                <Send size={12} strokeWidth={1.75} />
                Send oppfølging
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
