/**
 * PlayerHQ · Drill-detalj
 *
 * Server component som henter én ExerciseDefinition med:
 * - Mestringslogg (siste 10 økt-registreringer for innlogget spiller)
 * - Ratings (siste 5 drill-ratings for innlogget spiller)
 * - Progresjonsserie (parentDrill + progressjonsDrills)
 *
 * Inkluderer:
 * - Hero med skillArea-badge, progresjonsnivaa-sirkler og MORAD-badge
 * - Coach-notater (lysegul boks hvis finnes)
 * - Progresjonsserie-sti med piler
 * - Mestringslogg + registrerings-skjema + rating-widget (via MestringsLoggClient)
 * - Actions: Start økt · Del
 */

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { kategoriFraHcp } from "@/lib/ai-plan/context";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { DrillDetailClient } from "./drill-client";
import { MestringsLoggClient } from "./mestrings-logg-client";
import type { PyramidArea, SkillArea } from "@/generated/prisma/client";

/* ─── Hjelpere ─── */

const PYR_PILL: Record<PyramidArea, string> = {
  FYS: "bg-secondary text-secondary-foreground border-border",
  TEK: "bg-accent/30 text-accent-foreground border-accent/40",
  SLAG: "bg-primary/10 text-primary border-primary/30",
  SPILL: "bg-primary/10 text-primary border-primary/30",
  TURN: "bg-secondary text-secondary-foreground border-border",
};

const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Around Green",
  PUTTING: "Putting",
  SPILL: "Spill",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProgresjonsNivaaIndikator({ nivaa }: { nivaa: number | null }) {
  if (nivaa === null) return null;
  return (
    <div className="flex items-center gap-1" aria-label={`Progresjonsnivå ${nivaa} av 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${
            i < nivaa ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Side-komponent ─── */

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { id } = await params;
  const spillerKategori = kategoriFraHcp(user.hcp);

  // Disse relasjonsfeltene (mestringsLogg, ratings, parentDrill,
  // progressjonsDrills) venter på Prisma-migrasjon. Inntil videre brukes
  // basis-modellen og tomme stub-felter (UI fungerer, men data tom).
  const drillBase = await prisma.exerciseDefinition.findUnique({
    where: { id },
  });
  const drill = drillBase
    ? {
        ...drillBase,
        mestringsLogg: [] as {
          id: string;
          csScore: number | null;
          mestret: boolean;
          dato: Date;
          kommentar: string | null;
          coachVurdering: number | null;
        }[],
        ratings: [] as {
          id: string;
          rating: number;
          type: string;
          kommentar: string | null;
          createdAt: Date;
        }[],
        parentDrill: null as { id: string; name: string } | null,
        progressjonsDrills: [] as { id: string; name: string; progresjonsnivaa: number | null }[],
      }
    : null;

  // Fallback til 404-lignende visning om drill ikke finnes.
  if (!drill) {
    return (
      <div className="space-y-6 pb-20">
        <Link
          href="/portal/drills"
          className="inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Tilbake til drill-bibliotek
        </Link>
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-xl italic text-muted-foreground">
            Denne drillen finnes ikke eller er ikke tilgjengelig.
          </p>
          <Link
            href="/portal/drills"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Se alle drills
          </Link>
        </div>
      </div>
    );
  }

  // Beregn csTarget for spillerens kategori.
  let csForMeg: number | null = null;
  if (
    spillerKategori !== null &&
    drill.csTargetByKategori &&
    typeof drill.csTargetByKategori === "object" &&
    !Array.isArray(drill.csTargetByKategori)
  ) {
    const map = drill.csTargetByKategori as Record<string, unknown>;
    const v = map[spillerKategori];
    if (typeof v === "number") csForMeg = v;
  }
  if (csForMeg === null && drill.csMin !== null && drill.csMax !== null) {
    csForMeg = Math.round((drill.csMin + drill.csMax) / 2);
  } else if (csForMeg === null && drill.csMax !== null) {
    csForMeg = drill.csMax;
  } else if (csForMeg === null && drill.csMin !== null) {
    csForMeg = drill.csMin;
  }

  // Sjekk om spiller har mestret drillen.
  const harMestret = drill.mestringsLogg.some((l) => l.mestret);

  return (
    <div className="space-y-6 pb-20 md:space-y-10 md:pb-0">
      <Link
        href="/portal/drills"
        className="inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Tilbake til drill-bibliotek
      </Link>

      <PageHeader
        eyebrow="DRILL · MESTRINGSLOGG"
        titleLead="Drill:"
        titleItalic={drill.name}
        sub={
          drill.durationMin !== null
            ? `${drill.durationMin} min · ${drill.pyramidArea}`
            : drill.pyramidArea
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* SkillArea-badge */}
            {drill.skillArea && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] ${PYR_PILL[drill.pyramidArea]}`}
              >
                <Zap className="h-3 w-3" strokeWidth={1.75} />
                {SKILL_LABEL[drill.skillArea]}
              </span>
            )}

            {/* MORAD-badge */}
            {drill.morad && (
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                MORAD
              </span>
            )}

            {/* Mestret-badge */}
            {harMestret && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
                Mestret
              </span>
            )}

            {/* Progresjonsnivaa — kommer med Prisma-migrasjon */}
          </div>
        }
      />

      {/* Video + beskrivelse */}
      <section className="grid gap-6 lg:grid-cols-5">
        {/* Video-placeholder */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card">
            {drill.videoUrl ? (
              <video
                src={drill.videoUrl}
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <VideoPlaceholder title={drill.name} />
            )}
          </div>
        </div>

        {/* Drill-info */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Beskrivelse */}
          {drill.description && (
            <div className="flex-1 rounded-2xl border border-border bg-card p-4 sm:p-6">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Hva skal jeg trene på?
              </h2>
              <p className="mt-2 font-display text-base italic leading-relaxed text-foreground">
                {drill.description}
              </p>
            </div>
          )}

          {/* CS-info */}
          {csForMeg !== null && (
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  CS-target for deg
                </h2>
              </div>
              <p className="mt-2 font-mono text-4xl font-bold tabular-nums text-foreground">
                {csForMeg}
              </p>
              {drill.csMin !== null && drill.csMax !== null && (
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Spenn: {drill.csMin}–{drill.csMax}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Coach-notater */}
      {drill.coachNotes && (
        <section
          aria-labelledby="coach-notes-heading"
          className="rounded-2xl border border-accent/40 bg-accent/10 p-4 sm:p-6 md:p-8"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-foreground" strokeWidth={1.75} />
            <h2
              id="coach-notes-heading"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground"
            >
              Coach-notater
            </h2>
          </div>
          <p className="mt-4 text-base leading-relaxed text-foreground">
            {drill.coachNotes}
          </p>
        </section>
      )}

      {/* Progresjonsserie */}
      {(drill.parentDrill !== null || drill.progressjonsDrills.length > 0) && (
        <section
          aria-labelledby="progresjon-heading"
          className="rounded-2xl border border-border bg-card p-4 sm:p-6"
        >
          <h2
            id="progresjon-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Progresjonsserie
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Forrige steg */}
            {drill.parentDrill !== null && (
              <>
                <Link
                  href={`/portal/drills/${drill.parentDrill.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-muted"
                >
                  {drill.parentDrill.name}
                </Link>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
              </>
            )}

            {/* Denne drillen */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              {drill.name}
              {harMestret && (
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
            </span>

            {/* Neste steg(er) */}
            {drill.progressjonsDrills.map((neste) => (
              <span key={neste.id} className="inline-flex items-center gap-2">
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <Link
                  href={`/portal/drills/${neste.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-muted"
                >
                  {neste.name}
                  {neste.progresjonsnivaa !== null && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      N{neste.progresjonsnivaa}
                    </span>
                  )}
                </Link>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Mestringslogg + registrering + rating */}
      <MestringsLoggClient
        drillId={drill.id}
        drillNavn={drill.name}
        mestringsLogg={drill.mestringsLogg.map((l) => ({
          id: l.id,
          dato: l.dato,
          csScore: l.csScore,
          coachVurdering: l.coachVurdering,
          kommentar: l.kommentar,
          mestret: l.mestret,
        }))}
        ratings={drill.ratings.map((r) => ({
          id: r.id,
          rating: r.rating,
          type: r.type,
          kommentar: r.kommentar,
          createdAt: r.createdAt,
        }))}
        csForMeg={csForMeg}
      />

      {/* Actions */}
      <DrillDetailClient drillId={drill.id} drillTitle={drill.name} />
    </div>
  );
}

/* ─── Sub-komponenter ─── */

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-card to-accent/20">
      <svg
        viewBox="0 0 320 180"
        className="absolute inset-0 h-full w-full opacity-20"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1={40 * i}
            y1="0"
            x2={40 * i}
            y2="180"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={36 * i}
            x2="320"
            y2={36 * i}
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
        ))}
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <button
          type="button"
          aria-label={`Spill av video for ${title}`}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <PlayCircle className="h-10 w-10" strokeWidth={1.5} />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Video kommer · coach laster opp
        </span>
      </div>
      <div className="absolute bottom-4 left-4">
        <span className="rounded-full bg-card/80 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-foreground backdrop-blur">
          Demo · {title}
        </span>
      </div>
    </div>
  );
}
