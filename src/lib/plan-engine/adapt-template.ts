/**
 * Tilpasningsmotoren: gjør en standardmal-uke om til en personlig uke ved hjelp
 * av spillerens signaler. Ren TypeScript, ingen prisma, ingen AI — deterministisk
 * og testbar. Hver justering får en norsk klarspråk-begrunnelse.
 *
 * Låst prinsipp: dette er ANBEFALINGER, aldri sperrer. Motoren fjerner/endrer
 * kun i forslaget den selv produserer — den rører aldri spillerens eksisterende
 * økter, og forslaget må aktivt tas i bruk av spilleren/coachen.
 */

import type { LPhase, PyramidArea, SkillArea, SessionEnvironment } from "@/generated/prisma/client";
import type { WorkbenchFokus, SgKategori } from "@/lib/workbench/fokus";
import { SG_FOKUS_LABEL } from "@/lib/workbench/fokus";
import { CANON_PERIOD_ADJUSTMENT } from "@/lib/workbench/canon-period-adjustment";

/** Mal-økt slik den kommer fra PlanTemplateSession (én uke). */
export interface MalOkt {
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment;
}

/** Fasiliteter spilleren faktisk har tilgang til (speiler FacilityPrefs). */
export interface FasilitetTilgang {
  range: boolean;
  putting: boolean;
  shortgame: boolean;
  trackman: boolean;
  course9: boolean;
  course18: boolean;
  gym: boolean;
  video: boolean;
}

export interface PlayerSignals {
  /** Aktivt fokus (coach vinner over SG-gap). Null = ingen kilde. */
  fokus: WorkbenchFokus | null;
  /** Spillerens aktive periodefase. Null = ingen sesongplan. */
  aktivFase: LPhase | null;
  /** Plan-etterlevelse siste 28 dager (0–100). Null = ingen forfalte økter. */
  adherencePct: number | null;
  /** Null = ingen preferanser lagret → anta alt tilgjengelig. */
  fasiliteter: FasilitetTilgang | null;
  /** Dager til neste påmeldte turnering. Null = ingen kommende. */
  dagerTilTurnering: number | null;
  /** Spillerens ønskede antall økter/uke fra onboarding. Kutter aldri økter — kun informativt (brukes i AI-prompt). */
  okterPerUke: number | null;
  /** Foretrukne treningsdager (dagNr 1–7, man=1) fra onboarding. Null/tom/alle 7 = ingen preferanse. */
  foretrukneDager: number[] | null;
}

export interface AdaptertUke {
  okter: MalOkt[];
  /** Klarspråk-begrunnelser for hver justering som ble gjort. */
  justeringer: string[];
}

const SG_TIL_SKILLAREA: Record<SgKategori, SkillArea> = {
  OTT: "TEE_TOTAL",
  APP: "TILNAERMING",
  ARG: "AROUND_GREEN",
  PUTT: "PUTTING",
};

/** Miljø → fasilitet(er) som kreves. HJEM krever aldri noe. */
function harFasilitetFor(env: SessionEnvironment, f: FasilitetTilgang): boolean {
  switch (env) {
    case "RANGE":
      return f.range;
    case "BANE":
      return f.course9 || f.course18;
    case "GYM":
      return f.gym;
    case "SIMULATOR":
      return f.trackman;
    case "STUDIO":
      return f.trackman || f.video;
    case "HJEM":
      return true;
  }
}

function rundNed15(min: number): number {
  return Math.max(15, Math.round((min / 15)) * 15);
}

const DAG_KORT: string[] = ["", "man", "tir", "ons", "tor", "fre", "lør", "søn"];

/**
 * Flytt økter til spillerens foretrukne treningsdager — ren dag-flytting,
 * verken dropper eller legger til økter. Grupperer per uke (preferansen
 * gjelder ukentlig), no-op for uker der øktene allerede ligger på
 * foretrukne dager.
 *
 * n = antall økter i uka, k = antall foretrukne dager (P, sortert stigende):
 * - n=1:        midterste foretrukne dag.
 * - 2≤n≤k:      jevn spredning inkl. endepunktene (distinkte dager garantert).
 * - n>k:        balansert fylling, maks ⌈n/k⌉ økter per dag.
 */
function flyttOktTilForetrukneDager(
  okter: MalOkt[],
  foretrukneDager: number[] | null,
): { okter: MalOkt[]; justering: string | null } {
  if (!foretrukneDager || foretrukneDager.length === 0 || foretrukneDager.length >= 7) {
    return { okter, justering: null };
  }
  const P = [...new Set(foretrukneDager)].sort((a, b) => a - b);
  const k = P.length;

  const ukeGrupper = new Map<number, MalOkt[]>();
  for (const o of okter) {
    if (!ukeGrupper.has(o.ukeNr)) ukeGrupper.set(o.ukeNr, []);
    ukeGrupper.get(o.ukeNr)!.push(o);
  }

  let noeFlyttet = false;
  const resultat: MalOkt[] = [];

  for (const [, ukeOkter] of [...ukeGrupper.entries()].sort((a, b) => a[0] - b[0])) {
    if (ukeOkter.every((o) => P.includes(o.dagNr))) {
      resultat.push(...ukeOkter);
      continue;
    }
    const sortert = [...ukeOkter].sort((a, b) => a.dagNr - b.dagNr || a.title.localeCompare(b.title, "nb"));
    const n = sortert.length;
    sortert.forEach((okt, i) => {
      const idx = n === 1 ? Math.floor(k / 2) : n <= k ? Math.round((i * (k - 1)) / (n - 1)) : Math.floor((i * k) / n);
      resultat.push({ ...okt, dagNr: P[idx] });
    });
    noeFlyttet = true;
  }

  if (!noeFlyttet) return { okter, justering: null };

  const dagNavn = P.map((d) => DAG_KORT[d]).join(", ");
  return {
    okter: resultat,
    justering: `Øktene er lagt på dagene du foretrekker (${dagNavn}).`,
  };
}

/**
 * Tilpass én mal-uke til spilleren. Reglene (i rekkefølge):
 * 1. Fasilitetsfilter — dropp økter spilleren ikke har anlegg til.
 * 2. Taper — ≤7 dager til turnering: 25 % kortere økter, FYS-økter droppes.
 * 3. Compliance — lav etterlevelse: færre/kortere økter så uka blir overkommelig.
 * 4. Fokus-vridning — inntil 2 tekniske/slag-økter vris mot fokusområdet.
 * 5. Dag-flytting — legg øktene på spillerens foretrukne treningsdager.
 * 6. CANON-avvik — mal-fase ≠ spillerens aktive fase: kun rådgivende merknad.
 */
export function adaptTemplateWeek(
  malOkter: MalOkt[],
  malFase: LPhase,
  signaler: PlayerSignals,
): AdaptertUke {
  const justeringer: string[] = [];
  let okter = malOkter.map((o) => ({ ...o }));

  // 1. Fasilitetsfilter
  if (signaler.fasiliteter) {
    const f = signaler.fasiliteter;
    const beholdt: MalOkt[] = [];
    for (const okt of okter) {
      if (harFasilitetFor(okt.environment, f)) {
        beholdt.push(okt);
      } else {
        justeringer.push(
          `«${okt.title}» er tatt ut — den krever anlegg du ikke har tilgang til.`,
        );
      }
    }
    okter = beholdt;
  }

  // 2. Taper før turnering
  if (signaler.dagerTilTurnering != null && signaler.dagerTilTurnering <= 7) {
    const utenFys = okter.filter((o) => o.pyramidArea !== "FYS");
    const droppetFys = okter.length - utenFys.length;
    okter = utenFys.map((o) => ({ ...o, varighetMin: rundNed15(o.varighetMin * 0.75) }));
    justeringer.push(
      `Turnering om ${signaler.dagerTilTurnering} dager: øktene er kortet ned` +
        (droppetFys > 0 ? ` og ${droppetFys} fysisk økt${droppetFys > 1 ? "er" : ""} er tatt ut` : "") +
        ` så du møter uthvilt.`,
    );
  }

  // 3. Compliance-skalering (hoppes over i taper-uker — allerede redusert)
  else if (signaler.adherencePct != null) {
    if (signaler.adherencePct < 50 && okter.length > 2) {
      // Dropp økta fra området med flest økter (minst kritisk å miste én av flere).
      const antallPerOmrade = new Map<PyramidArea, number>();
      for (const o of okter) antallPerOmrade.set(o.pyramidArea, (antallPerOmrade.get(o.pyramidArea) ?? 0) + 1);
      const storst = [...antallPerOmrade.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const idx = okter.map((o) => o.pyramidArea).lastIndexOf(storst);
      const droppet = okter[idx];
      okter = okter.filter((_, i) => i !== idx);
      okter = okter.map((o) => ({ ...o, varighetMin: rundNed15(o.varighetMin * 0.8) }));
      justeringer.push(
        `Du har gjennomført under halvparten av planen i det siste — uka er gjort lettere (én økt færre, «${droppet.title}» tatt ut, og kortere økter) så den blir overkommelig.`,
      );
    } else if (signaler.adherencePct < 75) {
      okter = okter.map((o) => ({ ...o, varighetMin: rundNed15(o.varighetMin * 0.85) }));
      justeringer.push(
        `Gjennomføringen har vært litt lav — øktene er kortet noe ned så uka blir lettere å fullføre.`,
      );
    }
  }

  // 4. Fokus-vridning: inntil 2 SLAG/TEK-økter vris mot fokusområdet.
  if (signaler.fokus?.kategori) {
    const mal = SG_TIL_SKILLAREA[signaler.fokus.kategori];
    const label = SG_FOKUS_LABEL[signaler.fokus.kategori];
    let vridd = 0;
    okter = okter.map((o) => {
      if (vridd >= 2) return o;
      const kanVris =
        (o.pyramidArea === "SLAG" || o.pyramidArea === "TEK") && o.skillArea !== mal;
      if (!kanVris) return o;
      vridd++;
      return { ...o, skillArea: mal };
    });
    if (vridd > 0) {
      const kilde = signaler.fokus.kilde === "coach" ? "coachens fokus" : "ditt svakeste område";
      justeringer.push(
        `${vridd} økt${vridd > 1 ? "er" : ""} er vridd mot ${label.toLowerCase()} (${kilde}).`,
      );
    }
  }

  // 5. Dag-flytting: legg øktene på spillerens foretrukne treningsdager.
  const { okter: flyttet, justering: dagJustering } = flyttOktTilForetrukneDager(okter, signaler.foretrukneDager);
  okter = flyttet;
  if (dagJustering) justeringer.push(dagJustering);

  // 6. CANON-avvik: mal-fase vs spillerens aktive fase — kun rådgivende, aldri sperre.
  if (signaler.aktivFase && signaler.aktivFase !== malFase) {
    const retninger = CANON_PERIOD_ADJUSTMENT[signaler.aktivFase];
    const opp = (Object.keys(retninger) as PyramidArea[]).filter((a) => retninger[a] === "opp");
    justeringer.push(
      `Malen er laget for en annen periode enn den du er i nå — i din periode anbefales mer ${opp.join(" og ")}. Du kan fint bruke den likevel.`,
    );
  }

  return { okter, justeringer };
}
