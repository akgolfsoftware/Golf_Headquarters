/**
 * v2-forhåndsvisning — PlayerHQ Utviklingsplan (MERGE: talent + teknisk).
 * Egen top-level route-group (v2preview) som IKKE arver PortalShell — kun
 * root-layout. V2Shell leverer chrome-en, UtviklingsplanV2 rendrer stacken.
 *
 * Read-only merge av to EKTE kilder (ingen ny datamodell):
 *   - TalentTracking (userId @unique) → radar + nivå/klubb/region + milepæler
 *   - TechnicalPlan → posisjoner → krav (+ TM-mål) + PlanSuggestion (AI-forslag)
 *
 * Auth-mønster gjenbrukt fra de andre v2preview-sidene (requirePortalUser).
 * Ærlig tom-tilstand der en spiller mangler talent- eller plandata.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { UtviklingsplanV2 } from "@/components/portal/v2/UtviklingsplanV2";
import type {
  UtviklingsplanData,
  PlanData,
  TalentData,
  MilepaelData,
  ForslagData,
} from "@/components/portal/v2/UtviklingsplanV2";
import type {
  KravData,
  Posisjon,
  SporKey,
  TalentAkse,
  TalentMilepael,
} from "@/components/v2";
import type { LFase, CSNivaa, TrackStatus, SuggestionType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

/* ── Oppslagstabeller (ordbok/taksonomi, ikke fabrikkert) ──────────── */

const P_NAVN: Record<string, string> = {
  P1: "Adresse", P2: "Takeaway", P3: "Halvveis tilbake", P4: "Topp-posisjon", P5: "Transisjon",
  P6: "Halvveis ned", P7: "Impact", P8: "Tidlig oppfølging", P9: "Kølle parallell", P10: "Finish",
};

const LFASE_LABEL: Record<LFase, string> = {
  L_KROPP: "L-Kropp", L_ARM: "L-Arm", L_KOLLE: "L-Kølle", L_BALL: "L-Ball", L_AUTO: "L-Auto",
};
const LFASE_INDEX: Record<LFase, number> = {
  L_KROPP: 0, L_ARM: 1, L_KOLLE: 2, L_BALL: 3, L_AUTO: 4,
};

// TrackStatus → SporChip-nøkkel. AVSLAATT (diagnostic override) vises som «står stille».
const SPOR_MAP: Record<TrackStatus, SporKey> = {
  PAA_VEI: "PAA_VEI", STAGNERER: "STAGNERER", FERDIG: "FERDIG", INAKTIV: "INAKTIV", AVSLAATT: "STAGNERER",
};

const SUGGESTION_LABEL: Record<SuggestionType, string> = {
  NEW_TASK: "Nytt krav",
  ARCHIVE_TASK: "Arkiver krav",
  RE_PRIORITIZE: "Ny prioritering",
  CHANGE_CUE: "Endre cue",
  ADJUST_GOAL: "Juster mål",
  ADD_CLUB_TARGET: "Nytt kølle-mål",
};

// Kjente TrackMan-metrikker → norsk klarspråk. Ukjente vises råt (ærlig, ikke fabrikkert).
const METRIC_LABEL: Record<string, string> = {
  dispersion_m_std: "Spredning",
  spin_axis_avg_deg: "Spinnakse",
  smash_factor_mean: "Smash-faktor",
  smash_factor_std: "Smash-stabilitet",
  carry_m_mean: "Carry",
  ball_speed_mean: "Ballhastighet",
  face_angle_std: "Kølleblad-stabilitet",
};

/* ── Hjelpere ───────────────────────────────────────────────────────── */

/** «P4.0» → «P4» (PRail/MilepaelKort bruker kortformen). */
function pKort(pNummer: string): string {
  return pNummer.replace(/\.0+$/, "");
}

function fmtKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

/** «6. juli 20:14» — relativ-nær tekst for når forslaget kom. */
function fmtForeslaatt(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }) +
    " " + d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

type TmGoalRow = { metric: string; klubb: string; inTarget: boolean };

/** Bygg en lesbar TM-mål-streng fra første mål (ekte felter, ordbok-mappet metrikk). */
function tmMaalTekst(goals: TmGoalRow[]): { tmMaal: string | null; tmNaadd: boolean } {
  const g = goals[0];
  if (!g) return { tmMaal: null, tmNaadd: false };
  const metrikk = METRIC_LABEL[g.metric] ?? g.metric;
  return { tmMaal: `${metrikk} · ${g.klubb}`, tmNaadd: g.inTarget };
}

/* ── Loader ─────────────────────────────────────────────────────────── */

async function loadData(userId: string): Promise<UtviklingsplanData> {
  const [bruker, talentRow, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.talentTracking.findUnique({ where: { userId } }),
    // Aktiv plan først; ellers nyeste. Kun én plan trekkes til merge-visningen.
    prisma.technicalPlan.findFirst({
      where: { userId },
      orderBy: [{ status: "asc" }, { startDato: "desc" }],
      include: {
        positions: {
          orderBy: { sortOrder: "asc" },
          include: {
            tasks: {
              orderBy: { sortOrder: "asc" },
              include: { tmGoals: { select: { metric: true, klubb: true, inTarget: true } } },
            },
          },
        },
        suggestions: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  const spillerNavn = bruker?.name ?? "Spiller";

  /* ── Talent-sporet ──────────────────────────────────────────────── */
  let talent: TalentData | null = null;
  if (talentRow) {
    const radar: TalentAkse[] = [
      { akse: "FYS", verdi: talentRow.fysisk ?? 0 },
      { akse: "TEK", verdi: talentRow.teknikk ?? 0 },
      { akse: "TAK", verdi: talentRow.taktikk ?? 0 },
      { akse: "MEN", verdi: talentRow.mental ?? 0 },
      { akse: "MOT", verdi: talentRow.motivasjon ?? 0 },
    ];
    // milepaeler er Json [{ tittel, dato, beskrivelse }] — les defensivt.
    const raw = Array.isArray(talentRow.milepaeler) ? talentRow.milepaeler : [];
    const milepaeler: TalentMilepael[] = [];
    for (const item of raw) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) continue;
      const m = item as Record<string, unknown>;
      const datoRaw = m.dato;
      let dato: string | null = null;
      if (typeof datoRaw === "string" || typeof datoRaw === "number") {
        const d = new Date(datoRaw);
        if (!Number.isNaN(d.getTime())) dato = fmtKortDato(d);
      }
      milepaeler.push({
        tittel: typeof m.tittel === "string" ? m.tittel : "Milepæl",
        dato,
        beskrivelse: typeof m.beskrivelse === "string" ? m.beskrivelse : null,
      });
    }
    talent = {
      niva: talentRow.niva,
      klubb: talentRow.klubb,
      region: talentRow.region,
      radar,
      milepaeler,
    };
  }

  /* ── Teknisk spor ───────────────────────────────────────────────── */
  let planData: PlanData | null = null;
  const forslag: ForslagData[] = [];

  if (plan) {
    // Posisjoner → PRail-status utledet fra tasks.
    const posisjoner: Posisjon[] = plan.positions.map((pos) => {
      const tasks = pos.tasks;
      const alleFerdig = tasks.length > 0 && tasks.every((t) => t.status === "DONE");
      const harAktiv = tasks.some((t) => t.status === "ACTIVE");
      const status: Posisjon["status"] = alleFerdig ? "done" : harAktiv ? "active" : "pending";
      return { p: pKort(pos.pNummer), status, fokus: pos.hovedfokus };
    });

    // Task → KravData
    const tilKrav = (t: (typeof plan.positions)[number]["tasks"][number]): KravData => {
      const { tmMaal, tmNaadd } = tmMaalTekst(t.tmGoals);
      return {
        tittel: t.tittel,
        status: t.status === "DONE" ? "done" : t.status === "ACTIVE" ? "active" : "pending",
        spor: SPOR_MAP[t.trackStatus],
        repsGjort: t.repsGjortDry + t.repsGjortLav + t.repsGjortFull,
        repsMaal: t.repsMaalDry + t.repsMaalLav + t.repsMaalFull,
        lFase: t.lFase ? LFASE_LABEL[t.lFase] : null,
        cs: t.cs ? csLabel(t.cs) : null,
        tmMaal,
        tmNaadd,
      };
    };

    const milepaeler: MilepaelData[] = plan.positions
      .filter((pos) => pos.tasks.length > 0)
      .map((pos) => {
        const kort = pKort(pos.pNummer);
        return {
          p: kort,
          navn: pos.navn || P_NAVN[kort] || kort,
          hovedfokus: pos.hovedfokus,
          krav: pos.tasks.map(tilKrav),
        };
      });

    // Aktiv P + neste krav: hovedfokus-posisjon → ellers første med aktiv task → ellers første.
    const fokusPos =
      plan.positions.find((p) => p.hovedfokus) ??
      plan.positions.find((p) => p.tasks.some((t) => t.status === "ACTIVE")) ??
      plan.positions[0];

    const aktivTask =
      fokusPos?.tasks.find((t) => t.status === "ACTIVE") ??
      plan.positions.flatMap((p) => p.tasks).find((t) => t.status === "ACTIVE") ??
      null;
    const nesteKrav = aktivTask ? tilKrav(aktivTask) : null;

    // Læringstrapp: index fra aktiv task sin L-fase (ellers null → tom-tilstand).
    const laeringsAktiv = aktivTask?.lFase != null ? LFASE_INDEX[aktivTask.lFase] : null;

    const aktivP = fokusPos ? pKort(fokusPos.pNummer) : "";

    planData = {
      navn: plan.navn,
      periode: periodeTekst(plan.status, plan.startDato, plan.sluttDato),
      posisjoner,
      aktivP,
      aktivNavn: fokusPos ? (fokusPos.navn || P_NAVN[aktivP] || "") : "",
      nesteKrav,
      milepaeler,
      laeringsAktiv,
    };

    // PlanSuggestion → CoachGodkjenning-rader (read-only i preview).
    for (const s of plan.suggestions) {
      const p = lesP(s.payload);
      forslag.push({
        type: SUGGESTION_LABEL[s.type] ?? s.type,
        p: p ?? undefined,
        forslag: s.reason ?? "AI Caddie foreslår en justering i planen.",
        evidens: "AI-vurdert forslag",
        foreslaatt: fmtForeslaatt(s.createdAt),
      });
    }
  }

  return { spillerNavn, talent, plan: planData, forslag };
}

/** CSNivaa-enum «CS60» er allerede visningsklar. */
function csLabel(cs: CSNivaa): string {
  return cs;
}

/** Prøv å lese en P-referanse fra suggestion.payload (Json) uten å anta struktur. */
function lesP(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const rec = payload as Record<string, unknown>;
    const cand = rec.pNummer ?? rec.p;
    if (typeof cand === "string") return pKort(cand);
  }
  return null;
}

function periodeTekst(status: string, start: Date, slutt: Date | null): string {
  const statusOrd = status === "ACTIVE" ? "Aktiv" : status === "ARCHIVED" ? "Arkivert" : "Utkast";
  const spenn = slutt ? `${fmtKortDato(start)} → ${fmtKortDato(slutt)}` : `fra ${fmtKortDato(start)}`;
  return `${statusOrd} · ${spenn}`;
}

/* ── Side ───────────────────────────────────────────────────────────── */

export default async function V2UtviklingsplanPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await loadData(user.id);

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={data.spillerNavn}>
      <UtviklingsplanV2 data={data} />
    </V2Shell>
  );
}
