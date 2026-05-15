"use client";

import { Play } from "lucide-react";
import type { PyramidArea, LPhase } from "@/generated/prisma/client";
import {
  getDrillModus,
  FYS_TRENINGSTYPER,
  FYS_MUSKELGRUPPER,
  KONDISJON_SONER,
  TRENINGSOMRADER,
  L_FASER,
  P_POSISJONER,
  DrillParametersSchema,
  type DrillParameters,
  type FysTreningstype,
} from "@/lib/taxonomy";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk", TEK: "Teknisk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering",
};

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/15 text-pyr-fys",
  TEK: "bg-pyr-tek/15 text-pyr-tek",
  SLAG: "bg-pyr-slag/30 text-foreground",
  SPILL: "bg-pyr-spill/15 text-pyr-spill",
  TURN: "bg-pyr-turn/15 text-pyr-turn",
};

const LPHASE_LABEL: Record<LPhase, string> = {
  GRUNN: "Grunnperiode", SPESIAL: "Spesialiseringsperiode", TURNERING: "Turneringsperiode",
};

type DrillData = {
  id: string;
  name: string;
  description: string | null;
  videoUrl: string | null;
  pyramidArea: PyramidArea;
  lPhase: LPhase | null;
  defaultRepsSets: string | null;
  csMin: number | null;
  csMax: number | null;
  durationMin: number | null;
  parametersJson: unknown;
};

function parseParams(json: unknown): DrillParameters | null {
  if (!json) return null;
  const result = DrillParametersSchema.safeParse(json);
  return result.success ? result.data : null;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-medium tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

export function DrillDetail({ exercise }: { exercise: DrillData }) {
  const modus = getDrillModus(exercise.pyramidArea);
  const params = parseParams(exercise.parametersJson);

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${PYR_BG[exercise.pyramidArea]}`}>
          {PYR_LABEL[exercise.pyramidArea]}
        </span>
        {exercise.lPhase && <Chip>{LPHASE_LABEL[exercise.lPhase]}</Chip>}
        {modus === "FYS" && <Chip>FYS</Chip>}
      </div>

      {/* Navn */}
      <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
        {exercise.name}
      </h2>

      {/* Beskrivelse */}
      {exercise.description && (
        <p className="text-[15px] leading-[1.7] text-muted-foreground">
          {exercise.description}
        </p>
      )}

      {/* FYS-parametre */}
      {params?.modus === "FYS" && <FysSection params={params} />}

      {/* GOLF-parametre */}
      {params?.modus === "GOLF" && <GolfSection params={params} />}

      {/* Generelle metadata */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-secondary/50 p-4 sm:grid-cols-4">
        {exercise.defaultRepsSets && (
          <Fact label="Sett / Reps" value={exercise.defaultRepsSets} />
        )}
        {(exercise.csMin != null || exercise.csMax != null) && (
          <Fact
            label="CS-sone"
            value={`${exercise.csMin ?? "?"}${exercise.csMax != null ? `–${exercise.csMax}` : ""}%`}
          />
        )}
        {exercise.durationMin != null && (
          <Fact label="Varighet" value={`${exercise.durationMin} min`} />
        )}
        {modus === "FYS" && !params && (
          <Fact label="Modus" value="Fysisk" />
        )}
      </div>

      {/* Video */}
      {exercise.videoUrl && (
        <a
          href={exercise.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Play className="h-4 w-4" strokeWidth={2} />
          Se video
        </a>
      )}
    </div>
  );
}

function FysSection({ params }: { params: { modus: "FYS"; fysType: string; muskelgrupper: string[]; kondisjonSone: string | null; reps: number | null; sets: number | null; kg: number | null; tidSekunder: number | null } }) {
  const fysTypeInfo = FYS_TRENINGSTYPER[params.fysType as FysTreningstype];

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Fysiske parametre
      </div>

      {fysTypeInfo && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-pyr-fys/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-pyr-fys">
            {fysTypeInfo.label}
          </span>
        </div>
      )}

      {params.muskelgrupper.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Muskelgrupper
          </div>
          <div className="flex flex-wrap gap-1.5">
            {params.muskelgrupper.map((kode) => {
              const mg = FYS_MUSKELGRUPPER.find((m) => m.kode === kode);
              return (
                <span key={kode} className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
                  {mg?.label ?? kode}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {params.kondisjonSone && (
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Kondisjonssone
          </div>
          <span className="text-sm text-foreground">
            {KONDISJON_SONER.find((s) => s.kode === params.kondisjonSone)?.label ?? params.kondisjonSone}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {params.sets != null && <Fact label="Sett" value={String(params.sets)} />}
        {params.reps != null && <Fact label="Reps" value={String(params.reps)} />}
        {params.kg != null && <Fact label="Kg" value={String(params.kg)} />}
        {params.tidSekunder != null && <Fact label="Tid" value={`${params.tidSekunder}s`} />}
      </div>
    </div>
  );
}

function GolfSection({ params }: { params: { modus: "GOLF"; treningsomrade: string | null; lFase: string | null; pPosisjoner: string[]; environment: string | null } }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Golf-parametre
      </div>

      <div className="flex flex-wrap gap-1.5">
        {params.treningsomrade && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {TRENINGSOMRADER.find((t) => t.kode === params.treningsomrade)?.label ?? params.treningsomrade}
          </span>
        )}
        {params.lFase && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
            {L_FASER.find((l) => l.kode === params.lFase)?.label ?? params.lFase}
          </span>
        )}
        {params.environment && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
            {params.environment}
          </span>
        )}
      </div>

      {params.pPosisjoner.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            P-posisjoner
          </div>
          <div className="flex flex-wrap gap-1.5">
            {params.pPosisjoner.map((kode) => {
              const p = P_POSISJONER.find((pp) => pp.kode === kode);
              return (
                <span key={kode} className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] tabular-nums text-foreground">
                  {p?.label ?? kode}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {params.lFase && (
        <div className="text-xs text-muted-foreground">
          {L_FASER.find((l) => l.kode === params.lFase)?.beskrivelse}
          {" — "}
          CS anbefalt: {L_FASER.find((l) => l.kode === params.lFase)?.csAnbefalt}
        </div>
      )}
    </div>
  );
}
