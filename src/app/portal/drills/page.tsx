/**
 * PlayerHQ · Øvelsesbank (/portal/drills) — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-drills.html.
 *
 * Fasitens enkle liste erstatter det gamle galleriet (OvelsesbankV2):
 * «Én ting nå» (anbefalt drill fra største SG-gap, beregnSgGap — samme kilde
 * som Workbench-fokus) → filterchips → drill-rader → ærlig tom tilstand.
 * Dataloader gjenbrukt: getDrillLibraryRich (samme tilgangs-filter som før).
 * Bruk siste 30 dager telles fra TrainingDrillV2.exerciseId (egne økter).
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getDrillLibraryRich, type DrillDetail } from "@/lib/portal-drills/drills-data";
import { beregnSgGap } from "@/lib/workbench/sg-gap";
import { SG_FOKUS_LABEL, type SgKategori } from "@/lib/workbench/fokus";
import type { SkillArea } from "@/generated/prisma/client";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";

import { TilbakeLenke } from "@/components/v2";
import { DrillsListe, type AnbefaltDrill, type DrillRad } from "./drills-liste";

export const dynamic = "force-dynamic";

/** Visningsnavn per slagområde (ordbok: «Nærspill», aldri «kort spill»). */
const SKILL_NB: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee",
  TILNAERMING: "Innspill",
  AROUND_GREEN: "Nærspill",
  PUTTING: "Putting",
  SPILL: "Spill",
};

/** Formel-token per slagområde (ASCII, mono — AK-formel v2 område-slot). */
const SKILL_TOKEN: Record<SkillArea, string> = {
  TEE_TOTAL: "TEE",
  TILNAERMING: "INNSPILL",
  AROUND_GREEN: "NAERSPILL",
  PUTTING: "PUTTING",
  SPILL: "SPILL",
};

/** SG-gap-kategori → slagområde i banken. */
const SG_TIL_SKILL: Record<SgKategori, SkillArea> = {
  OTT: "TEE_TOTAL",
  APP: "TILNAERMING",
  ARG: "AROUND_GREEN",
  PUTT: "PUTTING",
};

/** Norsk tall-format: maks 2 desimaler, komma som desimalskille. */
function fmtNum(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

/**
 * AK-formel v2 av reelle felter: PYRAMIDE_OMRÅDE_BELASTNING.
 * Motorikk- og press-slot finnes ikke på ExerciseDefinition (lPhase er
 * periodisering, ikke motorikk) og utelates ærlig — aldri fabrikkert.
 * Null når drillen bare har pyramide-akse (én slot er ingen formel).
 */
function byggFormel(d: DrillDetail): string | null {
  const deler = [
    d.axis as string,
    d.skillArea ? SKILL_TOKEN[d.skillArea] : null,
    d.environment.length > 0 ? (d.environment[0] as string) : null,
  ].filter((x): x is string => x !== null);
  return deler.length >= 2 ? deler.join("_") : null;
}

/** Mono-metalinje tid · reps — kun reelle felter, ellers null. */
function byggMeta(d: DrillDetail): string | null {
  const biter: string[] = [];
  if (d.durationMin !== null) biter.push(`${d.durationMin} min`);
  if (d.defaultSets !== null && d.defaultReps !== null) {
    biter.push(`${d.defaultSets}×${d.defaultReps}`);
  } else if (d.defaultRepsSets) {
    biter.push(d.defaultRepsSets);
  }
  return biter.length > 0 ? biter.join(" · ") : null;
}

function omradeLabel(d: DrillDetail): string {
  return d.skillArea ? `${d.axis} · ${SKILL_NB[d.skillArea]}` : d.axis;
}

// Modulnivå-helper: Date.now() kan ikke kalles i render-body (react-hooks/purity).
function tredveDagerSiden(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

export default async function DrillsPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [drills, gap] = await Promise.all([
    getDrillLibraryRich(user.id),
    beregnSgGap(user.id),
  ]);

  // Bruk siste 30 dager: distinkte egne økter (TrainingSessionV2) per drill.
  const bruk =
    drills.length > 0
      ? await prisma.trainingDrillV2.findMany({
          where: {
            exerciseId: { in: drills.map((d) => d.id) },
            session: { studentId: user.id, startTime: { gte: tredveDagerSiden() } },
          },
          select: { exerciseId: true, sessionId: true },
        })
      : [];
  const okterPerDrill = new Map<string, Set<string>>();
  for (const b of bruk) {
    if (!b.exerciseId) continue;
    const s = okterPerDrill.get(b.exerciseId) ?? new Set<string>();
    s.add(b.sessionId);
    okterPerDrill.set(b.exerciseId, s);
  }

  const rader: DrillRad[] = drills.map((d) => {
    const n = okterPerDrill.get(d.id)?.size ?? 0;
    return {
      id: d.id,
      navn: d.title,
      omrade: omradeLabel(d),
      meta: byggMeta(d),
      formel: byggFormel(d),
      brukt: n > 0 ? `brukt i ${n} ${n === 1 ? "økt" : "økter"} siste 30 dager` : "ny for deg",
      akse: d.axis as string,
    };
  });

  // Anbefaling: banken filtrert på området med størst SG-gap. Ingen gap eller
  // ingen matchende drill → ingen «Én ting nå»-blokk (aldri fabrikkert).
  let anbefalt: AnbefaltDrill | null = null;
  if (gap) {
    const kandidat = drills.find((d) => d.skillArea === SG_TIL_SKILL[gap.kategori]);
    if (kandidat) {
      const label = SG_FOKUS_LABEL[gap.kategori];
      anbefalt = {
        id: kandidat.id,
        navn: kandidat.title,
        omrade: omradeLabel(kandidat),
        hvorfor: `${label} er største SG-gapet ditt (${fmtNum(gap.sg)} strokes gained). Denne drillen trener ${label.toLowerCase()} — legg den i neste økt.`,
        whyPunkter: [
          `Kilde: SG-tallene dine (siste registrering eller snitt av siste 8 runder) — ${label.toLowerCase()} ligger på ${fmtNum(gap.sg)}, svakest av kategoriene.`,
          "Beregning: banken filtreres på området med størst gap; første drill i området foreslås.",
          "Forbehold: en anbefaling, aldri et pålegg — Anders ser hva du legger inn og kan justere.",
        ],
      };
    }
  }

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/planlegge">Plan</TilbakeLenke>
      <div
        data-paper-slug="playerhq-drills"
        data-od-id="playerhq-drills"
        style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        {/* Topp — fasit: Øvelsesbank / Drills du kan legge i øktene dine */}
        <div>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
            Øvelsesbank
          </h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            Drills du kan legge i øktene dine
          </span>
        </div>

        {drills.length === 0 ? (
          /* Tom tilstand — fasit-copy: banken fylles av coachen */
          <div
            style={{
              padding: "24px 16px",
              background: TL.dock,
              border: `1px dashed ${TL.hair}`,
              borderRadius: TL.radius.card,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              Øvelsesbanken er tom
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
              Anders har ikke publisert driller ennå — banken fylles av coachen, ikke av appen.
              Øktene dine virker som før; drillene der ligger i selve økta.
            </p>
            {/* Kontrakt §3: skjermens ene aksenthandling i tom tilstand */}
            <Link
              href="/portal/coach/melding/ny"
              data-od-id="drills-tom-be"
              data-paper-en-ting="true"
              className="v2-press v2-focus"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 56,
                width: "100%",
                borderRadius: TL.radius.card,
                background: TL.fill,
                color: TL.onFill,
                fontFamily: TL.font.sans,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Spør Anders om øvelsesbanken
            </Link>
          </div>
        ) : (
          <DrillsListe anbefalt={anbefalt} rader={rader} />
        )}
      </div>
    </V2Shell>
  );
}
