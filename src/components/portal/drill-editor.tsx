"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import type { ExerciseDefinition, PyramidArea, LPhase } from "@/generated/prisma/client";
import {
  getDrillModus,
  PYRAMIDE,
  FYS_TRENINGSTYPER,
  FYS_MUSKELGRUPPER,
  KONDISJON_SONER,
  BEVEGELIGHET_TYPER,
  KONDISJON_AKTIVITETER,
  TRENINGSOMRADER,
  L_FASER,
  P_POSISJONER,
  DrillParametersSchema,
  type FysTreningstype,
  type DrillParameters,
} from "@/lib/taxonomy";
import { opprettOvelse, oppdaterOvelse, type OvelseInput } from "@/app/portal/coach/ovelser/actions";

const PYR_ORDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const LPHASE_ORDER: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "border-pyr-fys bg-pyr-fys/15 text-pyr-fys",
  TEK: "border-pyr-tek bg-pyr-tek/15 text-pyr-tek",
  SLAG: "border-pyr-slag bg-pyr-slag/15 text-foreground",
  SPILL: "border-pyr-spill bg-pyr-spill/15 text-pyr-spill",
  TURN: "border-pyr-turn bg-pyr-turn/15 text-pyr-turn",
};

function parseInitialParams(json: unknown): DrillParameters | null {
  if (!json) return null;
  const r = DrillParametersSchema.safeParse(json);
  return r.success ? r.data : null;
}

export function DrillEditor({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: ExerciseDefinition;
}) {
  const initParams = parseInitialParams(initial?.parametersJson);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(initial?.pyramidArea ?? "SLAG");
  const [lPhase, setLPhase] = useState<LPhase | null>(initial?.lPhase ?? null);
  const [defaultRepsSets, setDefaultRepsSets] = useState(initial?.defaultRepsSets ?? "");
  const [csMin, setCsMin] = useState(initial?.csMin?.toString() ?? "");
  const [csMax, setCsMax] = useState(initial?.csMax?.toString() ?? "");
  const [durationMin, setDurationMin] = useState(initial?.durationMin?.toString() ?? "");

  // FYS-felt
  const [fysType, setFysType] = useState<FysTreningstype | null>(
    initParams?.modus === "FYS" ? initParams.fysType as FysTreningstype : null
  );
  const [muskelgrupper, setMuskelgrupper] = useState<string[]>(
    initParams?.modus === "FYS" ? initParams.muskelgrupper : []
  );
  const [kondisjonSone, setKondisjonSone] = useState<string>(
    initParams?.modus === "FYS" && initParams.kondisjonSone ? initParams.kondisjonSone : ""
  );
  const [bevegelighetType, setBevegelighetType] = useState<string>(
    initParams?.modus === "FYS" && initParams.bevegelighetType ? initParams.bevegelighetType : ""
  );
  const [kondisjonAktivitet, setKondisjonAktivitet] = useState<string>(
    initParams?.modus === "FYS" && initParams.kondisjonAktivitet ? initParams.kondisjonAktivitet : ""
  );
  const [fysReps, setFysReps] = useState(initParams?.modus === "FYS" && initParams.reps ? String(initParams.reps) : "");
  const [fysSets, setFysSets] = useState(initParams?.modus === "FYS" && initParams.sets ? String(initParams.sets) : "");
  const [fysKg, setFysKg] = useState(initParams?.modus === "FYS" && initParams.kg ? String(initParams.kg) : "");
  const [fysTid, setFysTid] = useState(initParams?.modus === "FYS" && initParams.tidSekunder ? String(initParams.tidSekunder) : "");

  // GOLF-felt
  const [treningsomrade, setTreningsomrade] = useState<string>(
    initParams?.modus === "GOLF" && initParams.treningsomrade ? initParams.treningsomrade : ""
  );
  const [golfLFase, setGolfLFase] = useState<string>(
    initParams?.modus === "GOLF" && initParams.lFase ? initParams.lFase : ""
  );
  const [pPosisjoner, setPPosisjoner] = useState<string[]>(
    initParams?.modus === "GOLF" ? initParams.pPosisjoner : []
  );
  const [environment, setEnvironment] = useState<string>(
    initParams?.modus === "GOLF" && initParams.environment ? initParams.environment : ""
  );

  const [isPending, startTransition] = useTransition();
  const modus = getDrillModus(pyramidArea);

  function handlePyramidChange(area: PyramidArea) {
    const newModus = getDrillModus(area);
    if (newModus !== modus) {
      if (newModus === "FYS") {
        setTreningsomrade("");
        setGolfLFase("");
        setPPosisjoner([]);
        setEnvironment("");
        setLPhase(null);
      } else {
        setFysType(null);
        setMuskelgrupper([]);
        setKondisjonSone("");
        setBevegelighetType("");
        setKondisjonAktivitet("");
        setFysReps("");
        setFysSets("");
        setFysKg("");
        setFysTid("");
      }
    }
    setPyramidArea(area);
  }

  const fysParams = fysType ? FYS_TRENINGSTYPER[fysType]?.params : null;

  function buildInput(): OvelseInput {
    let parametersJson: DrillParameters | null = null;

    if (modus === "FYS" && fysType) {
      parametersJson = {
        modus: "FYS",
        fysType,
        muskelgrupper,
        kondisjonSone: kondisjonSone || null,
        bevegelighetType: bevegelighetType || null,
        kondisjonAktivitet: kondisjonAktivitet || null,
        reps: fysReps ? parseInt(fysReps) : null,
        sets: fysSets ? parseInt(fysSets) : null,
        kg: fysKg ? parseFloat(fysKg) : null,
        tidSekunder: fysTid ? parseInt(fysTid) : null,
      };
    } else if (modus === "GOLF") {
      parametersJson = {
        modus: "GOLF",
        treningsomrade: treningsomrade || null,
        lFase: golfLFase || null,
        pPosisjoner,
        environment: environment || null,
      };
    }

    return {
      name,
      description: description || null,
      videoUrl: videoUrl || null,
      pyramidArea,
      lPhase: modus === "GOLF" ? lPhase : null,
      defaultRepsSets: defaultRepsSets || null,
      csMin: csMin ? parseInt(csMin) : null,
      csMax: csMax ? parseInt(csMax) : null,
      durationMin: durationMin ? parseInt(durationMin) : null,
      parametersJson,
    };
  }

  function handleSubmit() {
    const input = buildInput();
    startTransition(async () => {
      if (mode === "edit" && initial) {
        await oppdaterOvelse(initial.id, input);
      } else {
        await opprettOvelse(input);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Navn */}
      <Felt label="Navn">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. Putt-gate 3m"
          className={inputCss}
        />
      </Felt>

      {/* Beskrivelse */}
      <Felt label="Beskrivelse">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Forklar øvelsen..."
          className={inputCss}
        />
      </Felt>

      {/* Pyramide-omraade */}
      <Felt label="Pyramide-omraade">
        <div className="flex flex-wrap gap-2">
          {PYR_ORDER.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => handlePyramidChange(area)}
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                pyramidArea === area
                  ? PYR_BG[area]
                  : "border-border bg-card text-muted-foreground hover:border-foreground/20"
              }`}
            >
              {PYRAMIDE[area].label}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Modus: {modus === "FYS" ? "Fysisk trening" : "Golf-drill"}
        </p>
      </Felt>

      {/* Periodiserings-fase (kun GOLF) */}
      {modus === "GOLF" && (
        <Felt label="Periodiseringsfase (valgfritt)">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLPhase(null)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                lPhase === null ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-foreground/20"
              }`}
            >
              Alle
            </button>
            {LPHASE_ORDER.map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => setLPhase(phase)}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  lPhase === phase ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {phase === "GRUNN" ? "Grunn" : phase === "SPESIAL" ? "Spesialisering" : "Turnering"}
              </button>
            ))}
          </div>
        </Felt>
      )}

      {/* ===== FYS-felt ===== */}
      {modus === "FYS" && (
        <div className="space-y-6 rounded-xl border border-pyr-fys/30 bg-pyr-fys/5 p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-pyr-fys">
            Fysiske parametre
          </div>

          <Felt label="Type">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FYS_TRENINGSTYPER) as FysTreningstype[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFysType(t)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    fysType === t ? "border-pyr-fys bg-pyr-fys/15 text-pyr-fys" : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  {FYS_TRENINGSTYPER[t].label}
                </button>
              ))}
            </div>
          </Felt>

          <Felt label="Muskelgrupper">
            <div className="flex flex-wrap gap-1.5">
              {FYS_MUSKELGRUPPER.map((mg) => {
                const aktiv = muskelgrupper.includes(mg.kode);
                return (
                  <button
                    key={mg.kode}
                    type="button"
                    onClick={() =>
                      setMuskelgrupper((prev) =>
                        aktiv ? prev.filter((k) => k !== mg.kode) : [...prev, mg.kode]
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      aktiv
                        ? "bg-primary text-primary-foreground"
                        : "border border-input bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {mg.label}
                  </button>
                );
              })}
            </div>
          </Felt>

          {fysType === "KONDISJON" && (
            <>
              <Felt label="Kondisjonssone">
                <select value={kondisjonSone} onChange={(e) => setKondisjonSone(e.target.value)} className={inputCss}>
                  <option value="">Velg sone...</option>
                  {KONDISJON_SONER.map((s) => (
                    <option key={s.kode} value={s.kode}>{s.label}</option>
                  ))}
                </select>
              </Felt>
              <Felt label="Aktivitet">
                <select value={kondisjonAktivitet} onChange={(e) => setKondisjonAktivitet(e.target.value)} className={inputCss}>
                  <option value="">Velg aktivitet...</option>
                  {KONDISJON_AKTIVITETER.map((a) => (
                    <option key={a.kode} value={a.kode}>{a.label}</option>
                  ))}
                </select>
              </Felt>
            </>
          )}

          {fysType === "BEVEGELIGHET" && (
            <Felt label="Bevegelighettype">
              <select value={bevegelighetType} onChange={(e) => setBevegelighetType(e.target.value)} className={inputCss}>
                <option value="">Velg type...</option>
                {BEVEGELIGHET_TYPER.map((b) => (
                  <option key={b.kode} value={b.kode}>{b.label}</option>
                ))}
              </select>
            </Felt>
          )}

          {fysParams && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {fysParams.sets && (
                <Felt label="Sett">
                  <input type="number" value={fysSets} onChange={(e) => setFysSets(e.target.value)} className={inputCss} placeholder="3" />
                </Felt>
              )}
              {fysParams.reps && (
                <Felt label="Reps">
                  <input type="number" value={fysReps} onChange={(e) => setFysReps(e.target.value)} className={inputCss} placeholder="10" />
                </Felt>
              )}
              {fysParams.kg && (
                <Felt label="Kg">
                  <input type="number" value={fysKg} onChange={(e) => setFysKg(e.target.value)} className={inputCss} placeholder="20" step="0.5" />
                </Felt>
              )}
              {fysParams.tid && (
                <Felt label="Tid (sek)">
                  <input type="number" value={fysTid} onChange={(e) => setFysTid(e.target.value)} className={inputCss} placeholder="60" />
                </Felt>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== GOLF-felt ===== */}
      {modus === "GOLF" && (
        <div className="space-y-6 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
            Golf-parametre
          </div>

          <Felt label="Treningsomraade">
            <select value={treningsomrade} onChange={(e) => setTreningsomrade(e.target.value)} className={inputCss}>
              <option value="">Velg omraade...</option>
              {TRENINGSOMRADER.map((t) => (
                <option key={t.kode} value={t.kode}>{t.label}</option>
              ))}
            </select>
          </Felt>

          <Felt label="Laeringsfase">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGolfLFase("")}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  !golfLFase ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                }`}
              >
                Ingen
              </button>
              {L_FASER.map((l) => (
                <button
                  key={l.kode}
                  type="button"
                  onClick={() => setGolfLFase(l.kode)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    golfLFase === l.kode ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Felt>

          <Felt label="P-posisjoner">
            <div className="flex flex-wrap gap-1.5">
              {P_POSISJONER.map((p) => {
                const aktiv = pPosisjoner.includes(p.kode);
                return (
                  <button
                    key={p.kode}
                    type="button"
                    onClick={() =>
                      setPPosisjoner((prev) =>
                        aktiv ? prev.filter((k) => k !== p.kode) : [...prev, p.kode]
                      )
                    }
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-medium tabular-nums transition-colors ${
                      aktiv
                        ? "bg-primary text-primary-foreground"
                        : "border border-input bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {p.kode}
                  </button>
                );
              })}
            </div>
          </Felt>

          <div className="grid grid-cols-2 gap-4">
            <Felt label="CS min (%)">
              <input type="number" value={csMin} onChange={(e) => setCsMin(e.target.value)} className={inputCss} placeholder="50" min={0} max={100} />
            </Felt>
            <Felt label="CS max (%)">
              <input type="number" value={csMax} onChange={(e) => setCsMax(e.target.value)} className={inputCss} placeholder="100" min={0} max={100} />
            </Felt>
          </div>

          <Felt label="Miljo">
            <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className={inputCss}>
              <option value="">Velg miljo...</option>
              <option value="RANGE">Range</option>
              <option value="BANE">Bane</option>
              <option value="STUDIO">Studio</option>
              <option value="SIMULATOR">Simulator</option>
              <option value="HJEM">Hjem</option>
            </select>
          </Felt>
        </div>
      )}

      {/* Felles resterende felt */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Felt label="Standard reps/sett">
          <input type="text" value={defaultRepsSets} onChange={(e) => setDefaultRepsSets(e.target.value)} className={inputCss} placeholder="3x10" />
        </Felt>
        <Felt label="Varighet (min)">
          <input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} className={inputCss} placeholder="15" />
        </Felt>
        <Felt label="Video-URL">
          <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputCss} placeholder="https://..." />
        </Felt>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!name || isPending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Lagrer...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" strokeWidth={2} />
            {mode === "edit" ? "Lagre endringer" : "Opprett øvelse"}
          </>
        )}
      </button>
    </div>
  );
}

const inputCss = "w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  // Gruppen wrappes som <fieldset> + <legend> for å gi semantisk korrekt
  // tilknytning til knappe-grupper. Visuelt resetter vi default styling.
  return (
    <fieldset className="block border-0 p-0 m-0">
      <legend className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}
