"use client";

import { useEffect, useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { LiveV2Summary } from "./types";
import { SpillerVurderingForm } from "./SpillerVurderingForm";
import { LiveLoopNav } from "./LiveLoopNav";
import { WhyDetails } from "./WhyDetails";
import { lagreDineOrd } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

export type SessionSummaryProps = {
  data: LiveV2Summary;
  nesteOkt?: { tekst: string; href: string };
  spillerVurdering?: {
    kvalitet: number;
    nesteFokus: string;
    folelse?: string | null;
    rpe?: number | null;
  } | null;
  /** Allerede lagrede «dine ord» (completedSummary.dineOrd). */
  lagredeOrd?: string | null;
};

type LiveNotat = { t: string; tekst: string };

function notatKey(sessionId: string): string {
  return `akhq-live-notater-${sessionId}`;
}

function lesNotater(sessionId: string): LiveNotat[] {
  try {
    const raw = sessionStorage.getItem(notatKey(sessionId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is LiveNotat =>
        !!n && typeof n === "object" &&
        typeof (n as LiveNotat).t === "string" &&
        typeof (n as LiveNotat).tekst === "string",
    );
  } catch {
    return [];
  }
}

/** «84» → «1 t 24 min». */
function tidTekst(min: number): string {
  const t = Math.floor(min / 60);
  const r = min % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}

/** Deterministisk utkast av øktas faktiske tall + drillnavn — ingen AI-kall. */
function byggUtkast(data: LiveV2Summary, notater: LiveNotat[]): string {
  const deler: string[] = [];
  const min = Math.round(data.durationSec / 60);
  if (data.drills.length > 0) {
    deler.push(
      `${data.title}: ${data.drillsCompleted} av ${data.drills.length} drills` +
        `${data.totalReps > 0 ? ` og ${data.totalReps} reps` : ""}` +
        `${min > 0 ? ` på ${tidTekst(min)}` : ""}.`,
    );
  } else if (min > 0) {
    deler.push(`${data.title}: fri økt på ${tidTekst(min)}.`);
  } else {
    deler.push(`${data.title}: økt gjennomført.`);
  }
  const treff = data.existingLogs.reduce((s, l) => s + l.repsHit, 0);
  if (treff > 0 && data.totalReps > 0) {
    deler.push(`${treff} av ${data.totalReps} reps markert som treff.`);
  }
  const mestVolum = data.drills
    .map((d) => ({ d, log: data.existingLogs.find((l) => l.drillId === d.id) }))
    .filter((x) => (x.log?.repsTotal ?? 0) > 0)
    .sort((a, b) => (b.log?.repsTotal ?? 0) - (a.log?.repsTotal ?? 0))[0];
  if (mestVolum) {
    deler.push(`Mest volum på ${mestVolum.d.name.toLowerCase()}.`);
  }
  if (notater[0]) {
    deler.push(notater[0].tekst);
  }
  return deler.join(" ");
}

const EYEBROW = "font-mono text-[10px] font-medium uppercase tracking-[0.09em]";

const KORT: CSSProperties = {
  background: "var(--tl-elev)",
  border: "1px solid var(--tl-hair)",
  borderRadius: 12,
  padding: 16,
  minWidth: 0,
};

function Tag({ tekst, tone }: { tekst: string; tone: "up" | "info" }) {
  return (
    <span
      className="ml-auto inline-flex flex-none items-center whitespace-nowrap px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.04em]"
      style={{
        borderRadius: 9999,
        background: "var(--tl-dim)",
        border: "1px solid var(--tl-hair)",
        color: tone === "up" ? "var(--tl-ok)" : "var(--tl-viz-target)",
      }}
    >
      {tekst}
    </span>
  );
}

/**
 * ETTER-skjermen i live-sløyfa — Paper-fasit playerhq-live-summary.html (PP-3).
 * Tallkort m/why → plan mot gjort → notater → dine ord (deterministisk
 * utkast) → clay «Lagre til loggen» → kvittering med neste økt.
 */
export function SessionSummary({ data, nesteOkt, spillerVurdering, lagredeOrd }: SessionSummaryProps) {
  const [notater, setNotater] = useState<LiveNotat[]>([]);
  const [ord, setOrd] = useState<string | null>(null);
  const [lagret, setLagret] = useState(Boolean(lagredeOrd));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Notatene lever i sessionStorage fra UNDER-skjermen (ingen DB-mekanisme
  // for frie øktnotater) — leses etter mount, flettes inn i utkastet.
  useEffect(() => {
    const t = setTimeout(() => {
      const n = lesNotater(data.sessionId);
      setNotater(n);
      setOrd((prev) => prev ?? lagredeOrd ?? byggUtkast(data, n));
    }, 0);
    return () => clearTimeout(t);
  }, [data, lagredeOrd]);

  const plannedRepsTotal = data.drills.reduce((s, d) => s + d.plannedReps, 0);
  const treffTotal = data.existingLogs.reduce((s, l) => s + l.repsHit, 0);
  const vindusMin = Math.max(
    0,
    Math.round(
      (new Date(data.endTimeISO).getTime() - new Date(data.scheduledAtISO).getTime()) / 60000,
    ),
  );
  const planlagtMin =
    vindusMin > 0 ? vindusMin : data.drills.reduce((s, d) => s + d.durationMinutes, 0);
  const varighetMin = Math.round(data.durationSec / 60);
  const tidsavvikMin = planlagtMin > 0 && data.durationSec > 0 ? planlagtMin - varighetMin : 0;

  const tallRader: Array<[string, string]> = [];
  if (data.durationSec > 0) {
    tallRader.push([
      "Varighet",
      `${tidTekst(varighetMin)}${planlagtMin > 0 ? ` (plan ${tidTekst(planlagtMin)})` : ""}`,
    ]);
  }
  if (data.drills.length > 0) {
    tallRader.push(["Drills", `${data.drillsCompleted} av ${data.drills.length}`]);
  }
  if (data.totalReps > 0 || plannedRepsTotal > 0) {
    tallRader.push([
      "Reps totalt",
      plannedRepsTotal > 0 ? `${data.totalReps} av ${plannedRepsTotal}` : String(data.totalReps),
    ]);
  }
  if (treffTotal > 0) {
    tallRader.push(["Treff", `${treffTotal} av ${data.totalReps}`]);
  }

  function lagre() {
    const tekst = (ord ?? "").trim();
    if (!tekst) {
      setFeil("Skriv noe først — ett ord er nok.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await lagreDineOrd(data.sessionId, tekst);
      if (!res.ok) {
        setFeil(res.error ?? "Klarte ikke å lagre til loggen. Teksten din står trygt her — prøv igjen.");
        return;
      }
      try {
        sessionStorage.removeItem(notatKey(data.sessionId));
      } catch {
        /* ignore */
      }
      setLagret(true);
    });
  }

  return (
    <div
      data-paper-portal-live-summary
      data-paper-slug="playerhq-live-summary"
      className="flex min-w-0 flex-col px-4 pb-16 pt-2"
      style={{ maxWidth: 720, margin: "0 auto", width: "100%", color: "var(--tl-text)" }}
    >
      <LiveLoopNav aktiv="etter" sessionId={data.sessionId} />

      {lagret ? (
        <>
          {/* ── Kvittering ── */}
          <div
            className="mt-4 px-4 py-6"
            style={{
              background: "var(--tl-elev)",
              border: "1px solid var(--tl-ok)",
              borderRadius: 12,
            }}
          >
            <h2
              className="m-0 flex items-center gap-2 font-sans text-[16px] font-semibold"
              style={{ color: "var(--tl-text)" }}
            >
              <Check className="h-5 w-5" style={{ color: "var(--tl-ok)" }} strokeWidth={2} aria-hidden />
              Lagret i loggen
            </h2>
            <p className="mb-0 mt-2 font-serif text-[13.5px]" style={{ color: "var(--tl-mute)" }}>
              Økta er logget som gjennomført.
              {data.coachName
                ? ` ${data.coachName.split(" ")[0]} ser oppsummeringen — han skal ikke godkjenne noe, bare vite hva som skjedde.`
                : " Coachen din ser oppsummeringen — ingen godkjenning, bare informasjon."}
            </p>
          </div>

          {/* Neste steg — én vei videre, aldri blank flate */}
          {nesteOkt && (
            <div className="mt-4" style={KORT}>
              <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
                neste økt
              </span>
              <Link
                href={nesteOkt.href}
                data-od-id="etter-kvitt-neste"
                className="mt-1 flex min-w-0 items-baseline gap-2 py-2 text-[13px] no-underline"
                style={{ color: "var(--tl-text)" }}
              >
                <span className="min-w-0 truncate">{nesteOkt.tekst}</span>
              </Link>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/portal/planlegge"
              data-od-id="etter-kvitt-plan"
              className="flex w-full items-center justify-center font-sans text-[14px] font-medium no-underline"
              style={{
                minHeight: 48,
                borderRadius: 12,
                border: "1px solid var(--tl-hair)",
                background: "transparent",
                color: "var(--tl-text)",
              }}
            >
              Til planen
            </Link>
            <Link
              href="/portal/analysere"
              data-od-id="etter-kvitt-analyse"
              className="flex w-full items-center justify-center font-sans text-[14px] font-medium no-underline"
              style={{
                minHeight: 48,
                borderRadius: 12,
                border: "1px solid var(--tl-hair)",
                background: "transparent",
                color: "var(--tl-text)",
              }}
            >
              Se utviklingen i Analyse
            </Link>
            <button
              type="button"
              data-od-id="etter-kvitt-angre"
              onClick={() => setLagret(false)}
              className="w-full font-sans text-[13px]"
              style={{
                minHeight: 44,
                borderRadius: 12,
                border: "1px solid var(--tl-hair)",
                background: "transparent",
                color: "var(--tl-mute)",
              }}
            >
              Tilbake til oppsummeringen
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ── Tallene — kilde: DrillLogV2-loggene fra økta ── */}
          <div className="mt-4" style={KORT}>
            <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
              {data.title} · gjennomført
            </span>
            <div className="mt-1">
              {tallRader.map(([navn, verdi]) => (
                <div
                  key={navn}
                  className="flex min-w-0 items-baseline gap-2 border-b py-2 text-[13px] last:border-b-0"
                  style={{ borderColor: "var(--tl-hair)" }}
                >
                  <span>{navn}</span>
                  <span className="ml-auto min-w-0 text-right font-mono">{verdi}</span>
                </div>
              ))}
              {tallRader.length === 0 && (
                <p className="mb-0 mt-2 font-serif text-[13.5px]" style={{ color: "var(--tl-mute)" }}>
                  Ingen tall ble logget i denne økta — det er også informasjon.
                </p>
              )}
            </div>
            {tallRader.length > 0 && (
              <WhyDetails
                odId="etter-why-tall"
                punkter={[
                  "Kilde: det du selv logget i økta — reps og treff per drill, pluss øktklokka.",
                  "Beregning: summene av drill-loggene; varigheten er klokkas medgåtte tid.",
                  "Forbehold: én økt er ett datapunkt. Trenden vises i Analyse.",
                ]}
              />
            )}
          </div>

          {/* ── Plan mot gjort — informasjon, aldri kritikk ── */}
          {data.drills.length > 0 && (
            <div className="mt-4" style={KORT}>
              <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
                plan mot gjort
              </span>
              <div className="mt-1">
                {data.drills.map((drill) => {
                  const log = data.existingLogs.find((l) => l.drillId === drill.id);
                  const gjort = log
                    ? `${log.repsTotal}${drill.plannedReps > 0 ? ` av ${drill.plannedReps}` : ""} reps` +
                      (log.repsHit > 0 ? ` · ${log.repsHit} treff` : "")
                    : "ikke logget";
                  // Tag kun når BÅDE planlagte og loggede reps finnes.
                  const tag =
                    log && drill.plannedReps > 0
                      ? log.repsTotal >= drill.plannedReps
                        ? ({ tekst: "som planlagt", tone: "up" } as const)
                        : ({ tekst: `mål ${drill.plannedReps}`, tone: "info" } as const)
                      : null;
                  return (
                    <div
                      key={drill.id}
                      className="flex min-w-0 items-start gap-2 border-b py-2 text-[13px] last:border-b-0"
                      style={{ borderColor: "var(--tl-hair)" }}
                    >
                      <div className="min-w-0">
                        <span className="block truncate">{drill.name}</span>
                        <span className="block font-mono text-[10.5px]" style={{ color: "var(--tl-mute)" }}>
                          {gjort}
                        </span>
                      </div>
                      {tag && <Tag tekst={tag.tekst} tone={tag.tone} />}
                    </div>
                  );
                })}
                {Math.abs(tidsavvikMin) >= 1 && (
                  <div
                    className="flex min-w-0 items-start gap-2 py-2 text-[13px]"
                    style={{ borderColor: "var(--tl-hair)" }}
                  >
                    <div className="min-w-0">
                      <span className="block">
                        Avsluttet {tidTekst(Math.abs(tidsavvikMin))}{" "}
                        {tidsavvikMin > 0 ? "før" : "etter"} planlagt
                      </span>
                      <span className="block font-mono text-[10.5px]" style={{ color: "var(--tl-mute)" }}>
                        Helt greit — avvik er informasjon til neste plan, ikke feil.
                      </span>
                    </div>
                    <Tag tekst="notert" tone="info" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Notater fra økta ── */}
          {notater.length > 0 && (
            <div className="mt-4 min-w-0">
              <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
                notater fra økta · {notater.length}
              </span>
              {notater.map((n, i) => (
                <div
                  key={`${n.t}-${i}`}
                  className="mt-2 p-3 font-serif text-[13.5px]"
                  style={{
                    background: "var(--tl-elev)",
                    border: "1px solid var(--tl-hair)",
                    borderRadius: 12,
                  }}
                >
                  <span className="mb-[2px] block font-mono text-[10px]" style={{ color: "var(--tl-mute)" }}>
                    {n.t} inn i økta
                  </span>
                  {n.tekst}
                </div>
              ))}
            </div>
          )}

          {/* ── Vurderingene (beholdt funksjonalitet) ── */}
          <div className="mt-4">
            <SpillerVurderingForm sessionId={data.sessionId} eksisterende={spillerVurdering} />
          </div>

          {/* ── Dine ord — utkastet er bygget av øktas tall, endres fritt ── */}
          <div className="mt-4 min-w-0">
            <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
              dine ord · skrives til loggen
            </span>
            <textarea
              value={ord ?? ""}
              onChange={(e) => setOrd(e.target.value)}
              aria-label="Oppsummering med dine ord"
              data-od-id="etter-oppsum-tekst"
              className="mt-2 w-full resize-y p-3 font-serif text-[15px]"
              style={{
                minHeight: 110,
                background: "var(--tl-elev)",
                color: "var(--tl-text)",
                border: "1px solid var(--tl-hair)",
                borderRadius: 12,
              }}
            />
            <p className="mb-0 mt-2 font-serif text-[12.5px]" style={{ color: "var(--tl-mute)" }}>
              Utkastet er laget fra tallene og notatene dine. Endre fritt — det
              er dine ord som lagres.
              {data.coachName ? ` ${data.coachName.split(" ")[0]} ser oppsummeringen i stallen sin.` : ""}
            </p>
          </div>

          {feil && (
            <p className="mb-0 mt-3 font-serif text-[13px]" style={{ color: "var(--tl-danger)" }} role="alert">
              {feil}
            </p>
          )}

          {/* Skjermens ene clay-handling — skriver til loggen */}
          <button
            type="button"
            data-od-id="etter-lagre-logg"
            data-paper-en-ting="true"
            onClick={lagre}
            disabled={pending}
            className="mt-4 w-full border-none font-sans text-[14px] font-semibold active:translate-y-px disabled:opacity-60"
            style={{
              minHeight: 56,
              borderRadius: 12,
              background: "var(--tl-fill)",
              color: "var(--tl-on-fill)",
            }}
          >
            {pending ? "Lagrer…" : "Lagre i loggen"}
          </button>
        </>
      )}
    </div>
  );
}
