"use client";

/**
 * MinGolfPage — «Min golf», PlayerHQ-analyseflaten (bølge 1, masterplan).
 *
 * KOMPONERT fra golfdata-familien i design-handover v13 — ingen ad-hoc UI.
 * Fortellermønster per flate: score → trend → forklaring → handling;
 * NesteFokusKort er hierarkiets topp. Progressiv dybde via `nivaa`-prop
 * (avledet av A–K i src/lib/min-golf/dybde.ts; coach-flater sender "elite").
 *
 * Faner (masterplan bølge 1): SG-status · Neste fokus · Runder · Baggen ·
 * Putting · Progresjon. Rute + bunn-nav-plass uendret (låst «Analyse samlet»).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import type { MinGolfData } from "@/lib/min-golf/load-min-golf";
import { fmtSg } from "@/lib/min-golf/format";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import {
  DiagnoseKort,
  GappingChart,
  KategoriKravKort,
  LaunchWindowKort,
  NesteFokusKort,
  PuttModellKort,
  Scorekort,
  SgKategoriBar,
  SgTotalKort,
  SgTrend,
  SlagLekkasjeKart,
  StrikeSmashKort,
  TigerFiveKort,
} from "@/components/athletic/golfdata";

type TabKey = "sg" | "fokus" | "runder" | "baggen" | "putting" | "progresjon";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sg", label: "SG" },
  { key: "fokus", label: "Fokus" },
  { key: "runder", label: "Runder" },
  { key: "baggen", label: "Baggen" },
  { key: "putting", label: "Putting" },
  { key: "progresjon", label: "Nivå" },
];

function fmtDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Oslo",
  });
}

export function MinGolfPage({
  data,
  workbench,
  visning = "spiller",
}: {
  data: MinGolfData;
  /** Eksisterende analyse-data — gjenbrukes for runde-liste + tester. */
  workbench: Pick<AnalyticsWorkbenchData, "rounds" | "tests">;
  /** "coach" rendres uten portal-chrome (brukes på /admin/spillere/[id]). */
  visning?: "spiller" | "coach";
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("sg");
  const [valgtBaandId, setValgtBaandId] = useState<string | undefined>(undefined);

  const nivaa = data.nivaa;
  const tilWorkbench = () =>
    router.push(
      visning === "coach"
        ? "/admin/plans"
        : "/portal/planlegge/workbench?zoom=uke",
    );

  const valgtBaand = useMemo(
    () =>
      data.nesteFokus?.lekkasjeBaand.find((b) => b.id === valgtBaandId) ?? null,
    [data.nesteFokus, valgtBaandId],
  );

  return (
    <div className="golfdata-scope mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
      {visning === "spiller" && (
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Hjem
          </Link>
          <h1 className="font-display text-lg font-bold tracking-tight">
            Min golf
          </h1>
          <span className="w-12" aria-hidden />
        </div>
      )}

      {/* Fane-rad — appens etablerte segmentkontroll-idiom */}
      <div
        role="tablist"
        aria-label="Min golf-visninger"
        className="mb-6 inline-flex w-full rounded-full border border-border bg-card p-1"
      >
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 rounded-full px-1 py-2 text-[11px] font-semibold transition-colors",
                on
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── SG-status: score → trend → forklaring ── */}
      {tab === "sg" && (
        <div className="flex flex-col gap-4">
          <SgTotalKort
            verdi={data.sgStatus.verdi ?? undefined}
            baseline={data.sgStatus.baseline}
            runder={data.sgStatus.runder}
            trend={data.sgStatus.trend ?? undefined}
            begrunnelse={data.sgStatus.begrunnelse ?? undefined}
            nivaa={nivaa}
            tomt={data.sgStatus.verdi === null}
          />
          <SgKategoriBar
            kategorier={data.sgStatus.kategorier}
            baseline={data.sgStatus.baseline}
            nivaa={nivaa}
          />
          <SgTrend
            punkter={data.sgStatus.trendPunkter}
            baseline={data.sgStatus.baseline}
          />
        </div>
      )}

      {/* ── Neste fokus: dommen → lekkasjekartet → analytikerkjeden ── */}
      {tab === "fokus" &&
        (data.nesteFokus ? (
          <div className="flex flex-col gap-4">
            <NesteFokusKort
              akse={data.nesteFokus.akse}
              omrade={data.nesteFokus.omrade}
              sgTap={data.nesteFokus.sgTap}
              baseline={data.nesteFokus.baseline}
              begrunnelse={data.nesteFokus.begrunnelse ?? undefined}
              formelAkse={data.nesteFokus.formelAkse}
              nivaa={nivaa}
              handlingTekst="Planlegg dette"
              onHandling={tilWorkbench}
            />
            <SlagLekkasjeKart
              baand={data.nesteFokus.lekkasjeBaand}
              baseline={data.nesteFokus.baseline}
              grunnlag={data.nesteFokus.grunnlag}
              valgtId={valgtBaandId}
              onVelgBaand={(b) => setValgtBaandId(b.id)}
              nivaa={nivaa}
              tomt={data.nesteFokus.lekkasjeBaand.length === 0}
            />
            {data.nesteFokus.diagnose && (
              <DiagnoseKort
                symptom={
                  valgtBaand
                    ? `${fmtSg(valgtBaand.sg)} slag på ${valgtBaand.label.toLowerCase()} per runde`
                    : data.nesteFokus.diagnose.symptom
                }
                grunnlag={data.nesteFokus.diagnose.grunnlag}
                resept={data.nesteFokus.diagnose.resept}
                nivaa={nivaa}
                onPlanlegg={tilWorkbench}
              />
            )}
          </div>
        ) : (
          <NesteFokusKort nivaa={nivaa} tomt onHandling={tilWorkbench} />
        ))}

      {/* ── Runder: siste scorekort + Tiger Five + historikk ── */}
      {tab === "runder" && (
        <div className="flex flex-col gap-4">
          <Scorekort
            hull={data.runder.hull}
            sammendrag={data.runder.sammendrag ?? undefined}
          />
          <TigerFiveKort metrikker={data.runder.tigerFive} />
          {workbench.rounds.rounds.length > 0 && (
            <div className="rounded-2xl border border-border bg-card">
              <p className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Historikk · {workbench.rounds.totalRounds} runder
              </p>
              <ul>
                {workbench.rounds.rounds.slice(0, 8).map((r) => {
                  const innhold = (
                    <>
                      <span className="truncate text-[13px]">
                        {r.courseName}
                        <span className="ml-2 text-muted-foreground">
                          {fmtDato(r.playedAt)}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 font-mono text-[13px] tabular-nums">
                        {r.score}
                        {r.sgTotal !== null && (
                          <span className="text-muted-foreground">
                            {fmtSg(r.sgTotal)}
                          </span>
                        )}
                        {visning === "spiller" && (
                          <ChevronRight
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                      </span>
                    </>
                  );
                  const radKlasse =
                    "flex min-h-11 items-center justify-between gap-2 px-4 py-2.5";
                  return (
                    <li key={r.id}>
                      {visning === "spiller" ? (
                        <Link
                          href={`/portal/analysere/runder/${r.id}`}
                          className={cn(radKlasse, "hover:bg-secondary/60")}
                        >
                          {innhold}
                        </Link>
                      ) : (
                        <div className={radKlasse}>{innhold}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Baggen: gapping + launch/strike (ærlig tomt til datakilde finnes) ── */}
      {tab === "baggen" && (
        <div className="flex flex-col gap-4">
          <GappingChart koller={data.baggen.koller} varsler={data.baggen.varsler} />
          <LaunchWindowKort tomt nivaa={nivaa} />
          <StrikeSmashKort tomt nivaa={nivaa} />
        </div>
      )}

      {/* ── Putting: innslag-% per fot-bånd mot Team Norway IUP ── */}
      {tab === "putting" && (
        <PuttModellKort
          band={data.putting.band}
          baseline={data.putting.baseline}
          nivaa={nivaa}
        />
      )}

      {/* ── Progresjon: A–K-nivå + tester ── */}
      {tab === "progresjon" && (
        <div className="flex flex-col gap-4">
          {data.progresjon ? (
            <KategoriKravKort
              nivaa={data.progresjon.nivaa}
              nesteNivaa={data.progresjon.nesteNivaa ?? undefined}
              krav={data.progresjon.krav}
              nesteKrav={data.progresjon.nesteKrav ?? undefined}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card px-4 py-6 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Nivå
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Spill din første runde for å plasseres i A–K-stigen.
              </p>
              {visning === "spiller" && (
                <Link
                  href="/portal/mal/runder/ny"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 font-mono text-[12px] font-bold uppercase tracking-wide text-primary-foreground"
                >
                  Logg runde
                </Link>
              )}
            </div>
          )}
          {workbench.tests.length > 0 && (
            <div className="rounded-2xl border border-border bg-card">
              <p className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Siste tester
              </p>
              <ul>
                {workbench.tests.slice(0, 6).map((t) => (
                  <li
                    key={t.id}
                    className="flex min-h-11 items-center justify-between gap-2 border-b border-border px-4 py-2.5 last:border-b-0"
                  >
                    <span className="truncate text-[13px]">
                      {t.name}
                      <span className="ml-2 font-mono text-[11px] uppercase text-muted-foreground">
                        {t.pyramidArea}
                      </span>
                    </span>
                    <span className="font-mono text-[13px] tabular-nums">
                      {t.score}
                    </span>
                  </li>
                ))}
              </ul>
              {visning === "spiller" && (
                <Link
                  href="/portal/tren/tester"
                  className="flex min-h-11 items-center justify-center gap-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                  Alle tester
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
