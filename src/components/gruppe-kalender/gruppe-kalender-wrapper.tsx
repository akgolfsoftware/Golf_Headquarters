"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): golfdata mangler AK-periode-årsgantt (gap meldt) — YearPlanGantt beholdes til DS får en
import { YearPlanGantt } from "@/components/athletic/calendars/year-plan-gantt";
import { MaanedKalender, TidsGrid } from "@/components/athletic/golfdata";
import {
  byggArsfaser,
  byggArsSamlinger,
  byggAllDagHendelser,
  byggDagblokker,
  byggManedsdager,
  byggUkeblokker,
  finnDagsdetaljer,
  type Tone,
} from "@/lib/gruppe-kalender/bygg-visninger";
import type { GruppeKalenderData } from "@/lib/gruppe-kalender/types";

type Visning = "ar" | "maned" | "uke" | "dag";

const UKEDAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const MAANEDSNAVN = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

const TONE_KLASSE: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  moss: "bg-emerald-600 text-white",
  gold: "bg-amber-500 text-black",
  muted: "bg-muted text-muted-foreground",
};

function mandagIUken(d: Date): Date {
  const dato = new Date(d);
  const ukedag = (dato.getDay() + 6) % 7; // søn(0)->6, man(1)->0
  dato.setDate(dato.getDate() - ukedag);
  dato.setHours(0, 0, 0, 0);
  return dato;
}

function tilIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Rad med helcelle-hendelser (samlinger/prøver/ferier) over TidsGrid — ikke bundet til et klokkeslett. */
function AllDagRad({
  dager,
  hendelser,
  onVelg,
}: {
  dager: Date[];
  hendelser: ReturnType<typeof byggAllDagHendelser>;
  onVelg: (iso: string) => void;
}) {
  if (hendelser.length === 0) return null;
  return (
    <div className="mb-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${dager.length}, 1fr)` }}>
      {dager.map((d) => {
        const iso = tilIso(d);
        const dagensHendelser = hendelser.filter((h) => h.dato === iso);
        return (
          <div key={iso} className="flex flex-col gap-1">
            {dagensHendelser.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => onVelg(iso)}
                className={`truncate rounded px-1.5 py-0.5 text-left text-[10px] font-semibold ${TONE_KLASSE[h.tone]}`}
                title={h.tittel}
              >
                {h.tittel}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Dagspanel({
  data,
  dato,
  classYear,
  onLukk,
}: {
  data: GruppeKalenderData;
  dato: string;
  classYear: string | null;
  onLukk: () => void;
}) {
  const detaljer = useMemo(() => finnDagsdetaljer(data, dato, classYear), [data, dato, classYear]);
  const visningsdato = new Date(`${dato}T00:00:00`);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-foreground">
          {visningsdato.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <Button variant="secondary" size="sm" onClick={onLukk} aria-label="Lukk">
          <X className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </div>

      {detaljer.periode && (
        <div className="mb-3 rounded-lg border border-border bg-background p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Periode — {detaljer.periode.name}
          </p>
          {detaljer.periode.kompetansemal.length > 0 ? (
            <ul className="mt-1.5 space-y-1">
              {detaljer.periode.kompetansemal.map((m) => (
                <li key={m.id} className="text-[13px] text-foreground">
                  <span className="font-mono text-[10px] text-muted-foreground">{m.curriculumCode}</span> {m.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">Ingen kompetansemål lagt til for perioden ennå.</p>
          )}
        </div>
      )}

      {detaljer.samlinger.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {detaljer.samlinger.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg bg-background p-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${TONE_KLASSE[s.kind === "HELDAGSSAMLING" ? "primary" : "accent"]}`}>
                {s.kind === "HELDAGSSAMLING" ? "Heldagssamling" : "Samling"}
              </span>
              <span className="text-[13px] text-foreground">{s.title}</span>
              {s.location && <span className="text-[12px] text-muted-foreground">· {s.location}</span>}
            </div>
          ))}
        </div>
      )}

      {detaljer.skoleHendelser.length > 0 ? (
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Skole{classYear ? ` — ${classYear}` : ""}
          </p>
          {detaljer.skoleHendelser.map((h) => (
            <div key={h.id} className="flex items-center gap-2 py-0.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_KLASSE[h.tone]}`} />
              <span className="text-[13px] text-foreground">{h.title}</span>
              <span className="text-[11px] text-muted-foreground">{h.kategoriLabel}</span>
            </div>
          ))}
        </div>
      ) : (
        !detaljer.periode &&
        detaljer.samlinger.length === 0 && (
          <p className="text-[13px] text-muted-foreground">Ingen registrerte hendelser denne dagen.</p>
        )
      )}
    </div>
  );
}

export function GruppeKalenderWrapper({ data, classYear = null }: { data: GruppeKalenderData; classYear?: string | null }) {
  const idag = useMemo(() => new Date(), []);
  const [visning, setVisning] = useState<Visning>("uke");
  const [year, setYear] = useState(idag.getFullYear());
  const [month, setMonth] = useState(idag.getMonth() + 1); // 1-indeksert
  const [weekStart, setWeekStart] = useState(() => mandagIUken(idag));
  const [dag, setDag] = useState(() => idag);
  const [valgtDato, setValgtDato] = useState<string | null>(null);

  function naviger(retning: -1 | 1) {
    if (visning === "ar") {
      setYear((y) => y + retning);
      return;
    }
    if (visning === "maned") {
      let nyMaaned = month + retning;
      if (nyMaaned < 1) {
        nyMaaned = 12;
        setYear((y) => y - 1);
      } else if (nyMaaned > 12) {
        nyMaaned = 1;
        setYear((y) => y + 1);
      }
      setMonth(nyMaaned);
      return;
    }
    if (visning === "dag") {
      setDag((d) => new Date(d.getTime() + retning * 24 * 60 * 60 * 1000));
      return;
    }
    setWeekStart((w) => new Date(w.getTime() + retning * 7 * 24 * 60 * 60 * 1000));
  }

  const ukeDager = useMemo(
    () => UKEDAGER.map((_, i) => new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)),
    [weekStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {(["ar", "maned", "uke", "dag"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisning(v)}
              className={
                "rounded-full px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition " +
                (visning === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {v === "ar" ? "År" : v === "maned" ? "Måned" : v === "uke" ? "Uke" : "Dag"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => naviger(-1)} aria-label="Forrige">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => naviger(1)} aria-label="Neste">
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {visning === "ar" && (
        <YearPlanGantt
          year={year}
          phases={[...byggArsfaser(data.perioder, year), ...byggArsSamlinger(data.samlinger, year)]}
          currentMonth={year === idag.getFullYear() ? idag.getMonth() + 1 : undefined}
        />
      )}

      {visning === "maned" && (
        <div className="space-y-2">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            {MAANEDSNAVN[month - 1]} {year}
          </p>
          <MaanedKalender
            year={year}
            month={month - 1}
            modus="piller"
            days={byggManedsdager(data.faste, year, month, data.samlinger, data.skoleHendelser, classYear)}
            onChange={(date) => setValgtDato(tilIso(new Date(Date.UTC(year, month - 1, date))))}
            onOktKlikk={(_, date) => setValgtDato(tilIso(new Date(Date.UTC(year, month - 1, date))))}
            onVisAlle={(date) => setValgtDato(tilIso(new Date(Date.UTC(year, month - 1, date))))}
          />
        </div>
      )}

      {visning === "uke" && (
        <div>
          <AllDagRad
            dager={ukeDager}
            hendelser={byggAllDagHendelser(data.samlinger, data.skoleHendelser, tilIso(ukeDager[0]), tilIso(ukeDager[6]), classYear)}
            onVelg={setValgtDato}
          />
          <TidsGrid fraTime={7} tilTime={21}>
            {UKEDAGER.map((navn, dagIndex) => {
              const dagDato = ukeDager[dagIndex];
              const erIdag =
                weekStart <= idag &&
                idag.getTime() < weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 &&
                (idag.getDay() + 6) % 7 === dagIndex;
              return (
                <TidsGrid.Kolonne
                  key={dagIndex}
                  id={`dag-${dagIndex}`}
                  header={
                    <button type="button" onClick={() => setValgtDato(tilIso(dagDato))} className="hover:underline">
                      {navn} {dagDato.getDate()}
                    </button>
                  }
                  idag={erIdag}
                >
                  {byggUkeblokker(data.faste)
                    .filter((b) => b.dag === dagIndex)
                    .map((b) => (
                      <TidsGrid.Blokk key={b.id} fra={b.fra} til={b.til}>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em]">{b.tid}</span>
                        <span className="block truncate text-[12px] font-medium">{b.tittel}</span>
                      </TidsGrid.Blokk>
                    ))}
                </TidsGrid.Kolonne>
              );
            })}
          </TidsGrid>
        </div>
      )}

      {visning === "dag" && (
        <div>
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            {dag.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <AllDagRad
            dager={[dag]}
            hendelser={byggAllDagHendelser(data.samlinger, data.skoleHendelser, tilIso(dag), tilIso(dag), classYear)}
            onVelg={setValgtDato}
          />
          <TidsGrid fraTime={7} tilTime={21}>
            <TidsGrid.Kolonne
              id="dag-valgt"
              header={
                <button type="button" onClick={() => setValgtDato(tilIso(dag))} className="hover:underline">
                  Detaljer for dagen
                </button>
              }
              idag={erSammeDag(dag, idag)}
            >
              {byggDagblokker(data.faste, (dag.getDay() + 6) % 7).map((b) => (
                <TidsGrid.Blokk key={b.id} fra={b.fra} til={b.til}>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em]">{b.tid}</span>
                  <span className="block truncate text-[12px] font-medium">{b.tittel}</span>
                </TidsGrid.Blokk>
              ))}
            </TidsGrid.Kolonne>
          </TidsGrid>
        </div>
      )}

      {valgtDato && <Dagspanel data={data} dato={valgtDato} classYear={classYear} onLukk={() => setValgtDato(null)} />}
    </div>
  );
}

function erSammeDag(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
