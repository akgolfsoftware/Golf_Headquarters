"use client";

/**
 * PaperPlan — PlayerHQ Planlegge 1:1 mot Claude Paper-fasiten
 * designsystem/paper/fase1/playerhq-plan.html
 *
 * PaperShell (rail/tabs) + .paper-plan (plan-CSS).
 * IKKE V2Shell — samme chrome-mønster som PaperHjem.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DashboardData, TodaySession, WeekDay } from "@/app/portal/actions";
import type { PyramidArea } from "@/generated/prisma/client";
import { BunnArk } from "@/components/v2/bunn-ark";
import { PaperShell } from "./PaperShell";
import "@/styles/paper-playerhq-plan.css";

const AKSE: Record<PyramidArea, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

function tid(min: number): string {
  if (min <= 0) return "0 min";
  const t = Math.floor(min / 60);
  const r = min % 60;
  if (t === 0) return `${r} min`;
  if (r === 0) return `${t} t`;
  return `${t}:${String(r).padStart(2, "0")} t`;
}

function klokke(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function periodeLinje(week: DashboardData["week"]): string {
  const first = week[0]?.date;
  const last = week[6]?.date;
  if (!first || !last) return "";
  const fmt = (d: Date) =>
    d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  return `${fmt(first)} – ${fmt(last)}`;
}

function erFerdig(s: TodaySession): boolean {
  return s.status === "COMPLETED";
}

function erAktiv(s: TodaySession): boolean {
  return s.status === "IN_PROGRESS";
}

function primaer(s: TodaySession): { href: string; label: string } {
  const href = s.href || `/portal/gjennomfore?session=${s.id}`;
  if (erFerdig(s)) return { href, label: "Se loggen" };
  if (erAktiv(s)) return { href, label: "Fortsett økta" };
  return { href, label: "Start økta" };
}

export function PaperPlan({ data }: { data: DashboardData }) {
  const { weekNumber, week, weekProgress } = data;

  const iDagIdx = useMemo(() => {
    const i = week.findIndex((d) => d.isToday);
    return i >= 0 ? i : 0;
  }, [week]);

  /** null = følg i dag; ellers manuell stripe-valg */
  const [valgtManuell, setValgtDag] = useState<number | null>(null);
  const valgtDag = valgtManuell ?? iDagIdx;
  const [apenOktId, setApentOktId] = useState<string | null>(null);

  const dag: WeekDay | undefined = week[valgtDag];
  const okter = dag?.sessions ?? [];
  const apenOkt =
    week.flatMap((d) => d.sessions).find((s) => s.id === apenOktId) ?? null;

  const alleOkter = week.flatMap((d) => d.sessions);
  const totOkter = alleOkter.length;
  const ferdigOkter = alleOkter.filter((s) => s.status === "COMPLETED");
  const harPlan = totOkter > 0 || weekProgress.plannedMin > 0;

  const totalMin =
    weekProgress.plannedMin > 0
      ? weekProgress.plannedMin
      : alleOkter.reduce((n, s) => n + (s.durationMin || 0), 0);
  const ferdigMin =
    weekProgress.completedMin > 0
      ? weekProgress.completedMin
      : ferdigOkter.reduce((n, s) => n + (s.durationMin || 0), 0);
  const pst = totalMin > 0 ? Math.round((ferdigMin / totalMin) * 100) : 0;

  /** «Én ting nå» — første ikke-ferdige økt (fasit .dokk). */
  const nesteOkt =
    alleOkter.find((s) => !erFerdig(s) && s.status !== "CANCELLED") ?? null;

  return (
    <PaperShell surface="plan">
      <div className="paper-plan">
        {/* ── Topp ── */}
        <header className="topp">
          <div style={{ minWidth: 0 }}>
            <h1>Plan</h1>
            <span className="sub">
              Uke {weekNumber}
              {periodeLinje(week) ? ` · ${periodeLinje(week)}` : ""}
              {harPlan ? " · publisert" : ""}
            </span>
          </div>
          <Link
            href="/portal/planlegge/workbench"
            className="ikon"
            aria-label="Åpne Workbench"
            title="Workbench"
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Link>
        </header>

        {/* ── Dagfaner ── */}
        {harPlan ? (
          <div className="dager" role="tablist" aria-label="Velg dag">
            {week.map((d, i) => {
              const n = d.sessions.length;
              const alleDone =
                n > 0 && d.sessions.every((s) => s.status === "COMPLETED");
              const cls = [
                "dpill",
                d.isToday ? "idag" : "",
                n > 0 ? "har" : "",
                alleDone ? "done" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={d.date.toISOString()}
                  type="button"
                  role="tab"
                  className={cls}
                  aria-selected={i === valgtDag}
                  aria-current={i === valgtDag ? "true" : undefined}
                  onClick={() => {
                    setValgtDag(i);
                    setApentOktId(null);
                  }}
                >
                  <span className="dl">{d.dayLabel}</span>
                  <span className="dn num">{d.dayNumber}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* ── Scroll-body (fasit .kropp) ── */}
        <div className="kropp" id="plan-kropp">
          {!harPlan ? (
            <TomPlan />
          ) : (
            <>
              <section className="uke" aria-label="Ukeoversikt">
                <div className="eyebrow">
                  uke {weekNumber}
                  {periodeLinje(week) ? ` · ${periodeLinje(week)}` : ""}
                </div>
                <div
                  className="bar"
                  role="progressbar"
                  aria-valuenow={pst}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Ukeprogresjon"
                >
                  <i style={{ width: `${Math.min(100, pst)}%` }} />
                </div>
                <div className="eyebrow">
                  {ferdigOkter.length} av {totOkter} økter gjennomført · {pst} %
                </div>
                <div className="rad">
                  <span>Planlagt tid</span>
                  <span className="v num">{tid(totalMin)}</span>
                </div>
                <div className="rad">
                  <span>Gjennomført</span>
                  <span className="v num">{tid(ferdigMin)}</span>
                </div>
                <div className="rad">
                  <span>Økter</span>
                  <span className="v num">{String(totOkter)}</span>
                </div>
                <details className="why">
                  <summary>Hvorfor dette tallet</summary>
                  <ul>
                    <li>
                      Kilde: uke {weekNumber} slik den er publisert i planen din.
                    </li>
                    <li>
                      Beregning: gjennomført tid delt på planlagt tid. Bare
                      økter markert som ferdige teller.
                    </li>
                    <li>
                      Forbehold: en økt du starter men ikke fullfører teller
                      ikke før den er logget.
                    </li>
                  </ul>
                </details>
              </section>

              <div className="eier">
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
                <span>
                  Planen er din. Du kan flytte og endre øktene selv, med én gang
                  — ingen godkjenning. Coach får beskjed om endringen.
                </span>
              </div>

              <Link
                href="/portal/booking"
                className="btn full"
                style={{ marginBottom: "var(--s4)" }}
              >
                Book coachingtime
              </Link>

              <div className="eyebrow">
                {dag?.isToday ? "I dag" : (dag?.dayLabel ?? "Dag")}
                {dag ? ` ${dag.dayNumber}` : ""}
              </div>

              {okter.length === 0 ? (
                <div className="tom" style={{ marginTop: "var(--s2)" }}>
                  <h3>Hviledag</h3>
                  <p>
                    Ingen økt denne dagen. Hvile er en del av planen, ikke et
                    hull i den.
                  </p>
                </div>
              ) : (
                okter.map((s) => (
                  <OktKort
                    key={s.id}
                    s={s}
                    onOpen={() => setApentOktId(s.id)}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* ── Dokk: ÉN ting nå (fasit .btn.now) ── */}
        {harPlan ? (
          <div className="dokk">
            {nesteOkt ? (
              <Link href={primaer(nesteOkt).href} className="btn now full">
                {erAktiv(nesteOkt)
                  ? `Fortsett ${nesteOkt.title}`
                  : `Start ${nesteOkt.title}`}
              </Link>
            ) : (
              <div className="eyebrow" style={{ textAlign: "center" }}>
                Hele uka er gjennomført. Ingenting venter.
              </div>
            )}
          </div>
        ) : null}

        <BunnArk
          open={apenOkt != null}
          onClose={() => setApentOktId(null)}
          tittel={apenOkt?.title ?? "Økt"}
        >
          {apenOkt ? <OktDetalj s={apenOkt} /> : null}
        </BunnArk>
      </div>
    </PaperShell>
  );
}

/* ─── Delkomponenter ─────────────────────────────────────────── */

function OktKort({ s, onOpen }: { s: TodaySession; onOpen: () => void }) {
  const ferdig = erFerdig(s);
  const ax = AKSE[s.pyramidArea] ?? "TEK";
  const min =
    s.durationMin > 0
      ? s.durationMin
      : Math.max(
          0,
          Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000),
        );
  const sted = s.sted?.trim() || null;

  return (
    <button
      type="button"
      className={`okt ax-${ax}${ferdig ? " ferdig" : ""}`}
      onClick={onOpen}
    >
      <span className="kl num">
        {klokke(s.startTime)}
        {sted ? ` · ${sted}` : ""}
      </span>
      <h3>{s.title}</h3>
      <span className="m num">
        {tid(min)}
        {s.drills.length > 0 ? ` · ${s.drills.length} drills` : ""}
      </span>
      <span className="badges">
        <span className="tag">{ax}</span>
        {ferdig ? <span className="tag up">gjennomført</span> : null}
        {erAktiv(s) ? <span className="tag info">pågår</span> : null}
      </span>
    </button>
  );
}

function OktDetalj({ s }: { s: TodaySession }) {
  const p = primaer(s);
  const ferdig = erFerdig(s);
  const min =
    s.durationMin > 0
      ? s.durationMin
      : Math.max(
          0,
          Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000),
        );

  return (
    <div>
      <div className="uke" style={{ marginBottom: "var(--s4)" }}>
        <div className="rad">
          <span>Når</span>
          <span className="v num">
            {klokke(s.startTime)} – {klokke(s.endTime)}
          </span>
        </div>
        {s.sted ? (
          <div className="rad">
            <span>Sted</span>
            <span className="v">{s.sted}</span>
          </div>
        ) : null}
        <div className="rad">
          <span>Varighet</span>
          <span className="v num">{tid(min)}</span>
        </div>
        <div className="rad">
          <span>Akse</span>
          <span className="v">{AKSE[s.pyramidArea]}</span>
        </div>
      </div>

      {s.maalsetning ? (
        <p className="hint" style={{ marginBottom: "var(--s4)" }}>
          {s.maalsetning}
        </p>
      ) : null}

      {s.drills.length > 0 ? (
        <ul className="drill" style={{ marginBottom: "var(--s4)" }}>
          {s.drills.map((d) => (
            <li key={d.id}>
              <span>{d.name}</span>
              {d.durationMinutes > 0 ? (
                <span className="num"> · {d.durationMinutes} min</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href={p.href}
        className={`btn full${ferdig ? "" : " now"}`}
        style={{ marginBottom: "var(--s3)" }}
      >
        {p.label}
      </Link>
      <Link href="/portal/planlegge/workbench" className="btn full">
        Åpne i Workbench
      </Link>
    </div>
  );
}

function TomPlan() {
  return (
    <section className="tom" aria-label="Ingen plan denne uken">
      <h3>Ingen plan denne uken</h3>
      <p>
        Når treneren publiserer uken, lander øktene her. Du kan bygge selv i
        Workbench, eller starte med en observasjon.
      </p>
      <div className="valg">
        <Link href="/portal/planlegge/workbench" className="btn now full">
          Bygg plan i Workbench
        </Link>
        <Link href="/portal" className="btn full">
          Til Hjem · fang observasjon
        </Link>
        <Link href="/portal" className="btn full">
          Spør Anders
        </Link>
      </div>
    </section>
  );
}
