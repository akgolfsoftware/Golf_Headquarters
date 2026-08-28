import type { CSSProperties } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Pencil } from "lucide-react";
import type { LiveV2Session } from "./types";
import { plannedVolumText } from "./types";
import { LiveSessionShell } from "./LiveSessionShell";
import { LiveLoopNav } from "./LiveLoopNav";
import { WhyDetails } from "./WhyDetails";
import { L_FASER } from "@/lib/taxonomy";

export type LiveBriefProps = {
  data: LiveV2Session;
  canStart: boolean;
  blockReason: "completed" | "tier" | null;
};

const AXIS_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const L_PHASE_LABEL: Record<string, string> = Object.fromEntries(
  L_FASER.map((f) => [f.kode, f.label]),
);

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});
const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "numeric",
  timeZone: "Europe/Oslo",
});
const OSLO_DATO_KORT = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Oslo",
});

function storForbokstav(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** «90 min» → «1 t 30 min» (fasitens tid()-helper). */
function tidTekst(min: number): string {
  const t = Math.floor(min / 60);
  const r = min % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}

/** «om 1 t 12 min» — kun når starten er frem i tid. */
function omTekst(minTil: number): string | null {
  if (minTil <= 0) return null;
  return `om ${tidTekst(minTil)}`;
}

const KORT_STIL: CSSProperties = {
  background: "var(--tl-elev)",
  border: "1px solid var(--tl-hair)",
  borderRadius: 12,
  padding: 16,
  minWidth: 0,
};

const EYEBROW = "font-mono text-[10px] font-medium uppercase tracking-[0.09em]";

function MetaRad({ navn, verdi }: { navn: string; verdi: string }) {
  return (
    <div
      className="flex min-w-0 items-baseline gap-2 border-b py-2 text-[13px] last:border-b-0"
      style={{ borderColor: "var(--tl-hair)" }}
    >
      <span style={{ color: "var(--tl-text)" }}>{navn}</span>
      <span className="ml-auto min-w-0 text-right font-mono" style={{ color: "var(--tl-text)" }}>
        {verdi}
      </span>
    </div>
  );
}

/**
 * FØR-skjermen i live-sløyfa — Paper-fasit playerhq-live-brief.html (PP-3).
 * Nowblock «Én ting nå» → metadata → målsetning m/why → drills → eierskap.
 */
export function LiveBrief({ data, canStart, blockReason }: LiveBriefProps) {
  const start = new Date(data.scheduledAtISO);
  const slutt = new Date(data.endTimeISO);
  const startKl = OSLO_TID.format(start);
  const sluttKl = OSLO_TID.format(slutt);
  const dagNavn = storForbokstav(OSLO_DAG.format(start));

  const minTil = Math.round((start.getTime() - Date.now()) / 60000);
  const om = omTekst(minTil);

  // Varighet: planlagt vindu når det finnes, ellers summen av drilltidene.
  const vindusMin = Math.max(0, Math.round((slutt.getTime() - start.getTime()) / 60000));
  const drillSumMin = data.drills.reduce((sum, d) => sum + d.durationMinutes, 0);
  const varighetMin = vindusMin > 0 ? vindusMin : drillSumMin;
  const varighetErRegnet = vindusMin === 0 && drillSumMin > 0;

  const publisertAv =
    data.coachName && data.publishedAtISO
      ? `${data.coachName} · ${OSLO_DATO_KORT.format(new Date(data.publishedAtISO))}`
      : data.coachName;

  const metaRader: Array<[string, string]> = [["Når", `${dagNavn} ${startKl}–${sluttKl}`]];
  if (data.location) metaRader.push(["Sted", data.location]);
  if (varighetMin > 0) metaRader.push(["Varighet", tidTekst(varighetMin)]);
  metaRader.push(["Pyramide", AXIS_LABEL[data.pyramide] ?? data.pyramide]);
  if (publisertAv) metaRader.push(["Publisert av", publisertAv]);

  return (
    <div data-paper-slug="playerhq-live-brief" style={{ display: "contents" }}>
      <LiveSessionShell
        variant="paper"
        odId="playerhq-live-brief"
        title="Før økta"
        subtitle={`${dagNavn} · ${startKl}`}
        backHref="/portal/planlegge"
        closeHref="/portal/planlegge"
      >
        <div
          className="flex min-w-0 flex-col px-4 pb-16 pt-2"
          style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}
        >
          <LiveLoopNav aktiv="for" sessionId={data.sessionId} />

          {/* «Én ting nå»-blokk — eneste sted clay-soft brukes som flate */}
          <div
            className="mt-4"
            style={{
              background: "var(--tl-dim)",
              border: "1px solid var(--tl-hair)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
              Én ting nå
            </span>
            <h2
              className="my-2 font-sans text-[15px] font-semibold"
              style={{ color: "var(--tl-text)" }}
            >
              Økta starter kl. <span className="font-mono">{startKl}</span>
              {om && (
                <>
                  {" · "}
                  <span className="font-mono">{om}</span>
                </>
              )}
            </h2>
            <p
              className="mb-4 mt-0 font-serif text-[14px]"
              style={{ color: "var(--tl-mute)", maxWidth: "52ch" }}
            >
              {data.location
                ? `${data.location} er satt opp ${startKl}–${sluttKl}. Du trenger ikke gjøre noe før du står der.`
                : `Økta er satt opp ${startKl}–${sluttKl}. Du trenger ikke gjøre noe før du er på plass.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {canStart ? (
                <Link
                  href={`/portal/live/${data.sessionId}/active`}
                  data-od-id="brief-start-okta"
                  data-paper-en-ting="true"
                  className="flex flex-1 items-center justify-center font-sans text-[14px] font-semibold no-underline active:translate-y-px"
                  style={{
                    minHeight: 56,
                    borderRadius: 12,
                    background: "var(--tl-fill)",
                    color: "var(--tl-on-fill)",
                    border: "1px solid var(--tl-fill)",
                  }}
                >
                  Start økta
                </Link>
              ) : blockReason === "completed" ? (
                <Link
                  href={`/portal/live/${data.sessionId}/summary`}
                  className="flex flex-1 items-center justify-center gap-2 font-sans text-[14px] font-medium no-underline"
                  style={{
                    minHeight: 56,
                    borderRadius: 12,
                    border: "1px solid var(--tl-hair)",
                    background: "var(--tl-elev)",
                    color: "var(--tl-mute)",
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" style={{ color: "var(--tl-ok)" }} strokeWidth={2} aria-hidden />
                  Økta er fullført — se oppsummeringen
                </Link>
              ) : (
                <Link
                  href="/portal/meg/abonnement"
                  className="flex flex-1 items-center justify-center gap-2 font-sans text-[14px] font-medium no-underline"
                  style={{
                    minHeight: 56,
                    borderRadius: 12,
                    border: "1px solid var(--tl-hair)",
                    background: "var(--tl-elev)",
                    color: "var(--tl-mute)",
                  }}
                >
                  <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Live krever PRO
                </Link>
              )}
              {/* Ingen egen flytte-flyt finnes — flytting skjer i Workbench. */}
              <Link
                href="/portal/planlegge/workbench"
                data-od-id="brief-flytt-okta"
                className="flex flex-1 items-center justify-center font-sans text-[14px] font-medium no-underline active:translate-y-px"
                style={{
                  minHeight: 48,
                  borderRadius: 12,
                  border: "1px solid var(--tl-hair)",
                  background: "transparent",
                  color: "var(--tl-text)",
                }}
              >
                Flytt økta
              </Link>
            </div>
          </div>

          {/* Metadata — kilde: TrainingSessionV2 */}
          <div className="mt-4" style={KORT_STIL}>
            <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
              {data.title}
            </span>
            <div className="mt-1">
              {metaRader.map(([navn, verdi]) => (
                <MetaRad key={navn} navn={navn} verdi={verdi} />
              ))}
            </div>
            {varighetErRegnet && (
              <WhyDetails
                odId="brief-why-varighet"
                punkter={[
                  "Kilde: drillene i økta — planlagt tid per drill.",
                  `Beregning: summen av de ${data.drills.length} drilltidene (${tidTekst(drillSumMin)}).`,
                  "Forbehold: planlagt tid, ikke målt. Den faktiske tiden logges når du trener.",
                ]}
              />
            )}
          </div>

          {/* Målsetning + hvorfor */}
          {data.maalsetning && (
            <div className="mt-4" style={KORT_STIL}>
              <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
                målsetning
              </span>
              <p className="mb-0 mt-2 font-serif text-[15px]" style={{ color: "var(--tl-text)" }}>
                {data.maalsetning}
              </p>
              <WhyDetails
                odId="brief-why-maal"
                punkter={[
                  data.coachName
                    ? `Kilde: målsetningen ${data.coachName} la på økta i planen.`
                    : "Kilde: målsetningen som ligger på økta i planen.",
                  "Forbehold: veiledende, aldri låst — du kan endre eller droppe den når du starter økta.",
                ]}
              />
            </div>
          )}

          {/* Coach-kommentar (finnes ikke i fasit-demoen, men er ekte data) */}
          {data.coachComment && (
            <div className="mt-4" style={KORT_STIL}>
              <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
                fra coachen
              </span>
              <p className="mb-0 mt-2 font-serif text-[14px]" style={{ color: "var(--tl-text)" }}>
                {data.coachComment}
              </p>
            </div>
          )}

          {/* Drills — kilde: TrainingDrillV2 */}
          <div className="mt-4 min-w-0">
            <span className={EYEBROW} style={{ color: "var(--tl-mute)" }}>
              drills · {data.drills.length}
              {drillSumMin > 0 ? ` · ${tidTekst(drillSumMin)}` : ""}
            </span>
            {data.drills.length === 0 ? (
              <div
                className="mt-2 px-4 py-6"
                style={{
                  background: "var(--tl-dim)",
                  border: "1px dashed var(--tl-hair)",
                  borderRadius: 12,
                }}
              >
                <h3 className="m-0 font-sans text-[15px] font-semibold" style={{ color: "var(--tl-text)" }}>
                  Ingen drills i økta ennå
                </h3>
                <p className="mb-0 mt-2 font-serif text-[13.5px]" style={{ color: "var(--tl-mute)" }}>
                  Åpne økta i Workbench og legg til driller — eller start og tren
                  fritt. Ingenting sperrer.
                </p>
              </div>
            ) : (
              <div className="mt-2 flex min-w-0 flex-col gap-2">
                {data.drills.map((drill) => {
                  const volum =
                    plannedVolumText(drill) ??
                    (drill.plannedReps > 0 ? `${drill.plannedReps} reps` : null);
                  return (
                    <div key={drill.id} className="min-w-0" style={{ ...KORT_STIL, padding: 12 }}>
                      <span className="text-[13.5px] font-semibold" style={{ color: "var(--tl-text)" }}>
                        {drill.name}
                      </span>
                      <span className="font-mono text-[10.5px]" style={{ color: "var(--tl-mute)" }}>
                        {volum ? ` ${volum}` : ""}
                        {drill.durationMinutes > 0 ? ` · ${tidTekst(drill.durationMinutes)}` : ""}
                      </span>
                      <span
                        className="mt-1 block break-all font-mono text-[9.5px]"
                        style={{ color: "var(--tl-mute)" }}
                      >
                        {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
                        {drill.lFase ? ` · ${L_PHASE_LABEL[drill.lFase] ?? drill.lFase}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Eierskapet skrevet ut, ikke antatt */}
          <div
            className="mt-4 flex gap-3 px-4 py-3 font-serif text-[12.5px]"
            style={{
              background: "var(--tl-dim)",
              border: "1px solid var(--tl-hair)",
              borderRadius: 12,
              color: "var(--tl-mute)",
            }}
          >
            <Pencil className="mt-[2px] h-4 w-4 flex-none" strokeWidth={1.7} aria-hidden />
            <span>
              Økta er din. Du kan endre målet, hoppe over drills eller droppe hele
              økta — ingenting sperrer.
              {data.coachName
                ? ` ${data.coachName.split(" ")[0]} får beskjed, så han vet hva som skjedde.`
                : " Coachen din får beskjed, så ingenting forsvinner."}
            </span>
          </div>
        </div>
      </LiveSessionShell>
    </div>
  );
}
