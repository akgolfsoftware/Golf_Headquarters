"use client";

import { Play } from "lucide-react";
import { safeUrl } from "@/lib/security/safe-url";
import type { PyramidArea, LPhase } from "@/generated/prisma/client";
import {
  getDrillModus,
  FYS_TRENINGSTYPER,
  FYS_MUSKELGRUPPER,
  KONDISJON_SONER,
  TRENINGSOMRADER,
  L_FASER,
  P_POSISJONER,
  M_MILJO,
  PR_PRESS,
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

      {/* GOLF-parametre — vises alltid for golf-drills (TEK/SLAG/SPILL/TURN) */}
      {modus === "GOLF" && (
        <GolfSection
          params={params?.modus === "GOLF" ? params : null}
          fallbackLPhase={exercise.lPhase}
        />
      )}

      {/* Generelle metadata — alltid synlig som card */}
      <FactPanel
        title="Generelle metadata"
        rows={[
          { label: "Pyramide", value: PYR_LABEL[exercise.pyramidArea] },
          { label: "L-fase", value: exercise.lPhase ? LPHASE_LABEL[exercise.lPhase] : "—" },
          {
            label: "Sett / Reps",
            value: exercise.defaultRepsSets ?? "—",
          },
          {
            label: "CS-sone",
            value:
              exercise.csMin != null || exercise.csMax != null
                ? `${exercise.csMin ?? "?"}${exercise.csMax != null ? `–${exercise.csMax}` : ""}%`
                : "—",
          },
          {
            label: "Varighet",
            value: exercise.durationMin != null ? `${exercise.durationMin} min` : "—",
          },
        ]}
      />

      {/* Video */}
      {safeUrl(exercise.videoUrl) && (
        <a
          href={safeUrl(exercise.videoUrl)!}
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

function FactPanel({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              {r.label}
            </div>
            <div className="mt-1 font-mono text-base font-medium tabular-nums text-foreground">
              {r.value}
            </div>
          </div>
        ))}
      </div>
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

function GolfSection({
  params,
  fallbackLPhase,
}: {
  params: { modus: "GOLF"; treningsomrade: string | null; lFase: string | null; pPosisjoner: string[]; environment: string | null } | null;
  fallbackLPhase: LPhase | null;
}) {
  const treningsomrade = params?.treningsomrade ?? null;
  const lFaseKode = params?.lFase ?? (fallbackLPhase ? `L-${fallbackLPhase}` : null);
  const pPosisjoner = params?.pPosisjoner ?? [];
  const miljo = params?.environment ?? null;

  const omr = treningsomrade ? TRENINGSOMRADER.find((t) => t.kode === treningsomrade) : null;
  const lFase = lFaseKode ? L_FASER.find((l) => l.kode === lFaseKode) : null;
  const miljoInfo = miljo ? M_MILJO.find((m) => m.kode === miljo) : null;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Golf-parametre
      </div>

      {/* Chips: treningsområde + l-fase + miljø */}
      <div className="flex flex-wrap gap-1.5">
        {omr ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {omr.label}
            {omr.sgKategori && <span className="ml-1 opacity-60">· SG {omr.sgKategori}</span>}
          </span>
        ) : (
          <span className="rounded-full border border-dashed border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Treningsområde — ikke satt
          </span>
        )}
        {lFase ? (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
            {lFase.label}
          </span>
        ) : (
          <span className="rounded-full border border-dashed border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            L-fase — ikke satt
          </span>
        )}
        {miljoInfo && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
            {miljoInfo.label}
          </span>
        )}
      </div>

      {/* P-posisjoner */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          P-posisjoner
        </div>
        {pPosisjoner.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {pPosisjoner.map((kode) => {
              const p = P_POSISJONER.find((pp) => pp.kode === kode);
              return (
                <span key={kode} className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] tabular-nums text-foreground">
                  {p?.label ?? kode}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Ingen p-posisjoner spesifisert</span>
        )}
      </div>

      {/* L-fase beskrivelse */}
      {lFase && (
        <div className="rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
          <strong className="text-foreground">{lFase.label}:</strong>{" "}
          {lFase.beskrivelse}
          {" — "}
          CS anbefalt: {lFase.csAnbefalt}
        </div>
      )}

      {/* Press-skala — vis hele PR1–PR5 som referanse */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Press-skala (PR)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PR_PRESS.map((p) => (
            <span key={p.kode} className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
              <strong className="text-foreground">{p.kode}</strong> {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
