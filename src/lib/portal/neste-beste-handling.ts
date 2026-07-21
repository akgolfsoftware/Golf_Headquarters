/**
 * Neste beste handling — ren regelmotor for PlayerHQ Hjem sin primær-CTA.
 * Én regel vinner (høyest prioritet); resten er implisitt sekundært (synlig
 * andre steder på Hjem — dagens-plan-kortet, ukeplan osv). Ingen fabrikkerte
 * tilstander: alle input kommer fra ekte DashboardData-felter.
 *
 * Prioritet (høyest øverst):
 *  1. Ny treningsplan venter på godkjenning → «Godta ny plan»
 *  2. Dagens økt er ikke startet/fullført → «Start [økt]»
 *  3. Ukeplanen er helt tom (ingen økter noen dag) → «Planlegg uka»
 *  4. Fallback: samme CTA som før regelmotoren fantes.
 *
 * NB: «Uført runde (GolfBox-synk uten føring)» fra planen er bevisst utelatt
 * — GolfBox-synk er en stub uten ekte API-tilgang (src/app/portal/(legacy)/
 * mal/runder/actions.ts), og vi viser aldri en handling basert på data vi
 * ikke faktisk har.
 */

export type NesteHandlingInput = {
  /** Har spilleren en TrainingPlan med status PENDING_PLAYER? */
  harPlanTilGodkjenning: boolean;
  /** Dagens første/pågående økt (samme felt som today i DashboardData). */
  dagensOkt: { href: string; title: string; status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SKIPPED" } | null;
  /** Har ukeplanen NOEN økter noen dag denne uken? */
  ukenHarOkter: boolean;
};

export type NesteHandling = {
  tekst: string;
  href: string;
  ikon: string;
  /** Hvilken regel som vant — til unit-testing og ev. UI-debug. */
  regel: "plan-godkjenning" | "start-okt" | "planlegg-uke" | "hviledag" | "fallback";
};

export function nesteBesteHandling(input: NesteHandlingInput): NesteHandling {
  if (input.harPlanTilGodkjenning) {
    return {
      tekst: "Godta ny plan",
      href: "/portal/planlegge/workbench",
      ikon: "check-circle",
      regel: "plan-godkjenning",
    };
  }

  if (input.dagensOkt && input.dagensOkt.status !== "COMPLETED" && input.dagensOkt.status !== "CANCELLED" && input.dagensOkt.status !== "SKIPPED") {
    return {
      tekst: "Start dagens økt",
      href: input.dagensOkt.href,
      ikon: "play",
      regel: "start-okt",
    };
  }

  if (!input.ukenHarOkter) {
    return {
      tekst: "Planlegg uka",
      href: "/portal/planlegge/workbench?zoom=uke",
      ikon: "calendar-plus",
      regel: "planlegg-uke",
    };
  }

  // Hviledag eller alt fullført i dag, men uken har økter — ikke «Start dagens økt»
  // mot en tom/ferdig dag (tidligere feil fallback til /gjennomfore).
  if (!input.dagensOkt) {
    return {
      tekst: "Åpne Workbench",
      href: "/portal/planlegge/workbench?zoom=uke",
      ikon: "calendar",
      regel: "hviledag",
    };
  }

  return {
    tekst: "Se uka",
    href: "/portal/planlegge/workbench?zoom=uke",
    ikon: "calendar",
    regel: "fallback",
  };
}

/**
 * Plukker dagens FØRSTE ØKT SOM IKKE ER UNNAGJORT — ikke bare todayAll[0].
 * En spiller kan ha flere økter samme dag (f.eks. morgen FYS fullført,
 * ettermiddag TEK fortsatt planlagt); todayAll[0] ville da plukket den
 * fullførte morgenøkten og latt ettermiddagsøkten forsvinne fra
 * «neste beste handling». Listen forventes sortert stigende på starttid
 * (samme rekkefølge som getAllTodaysSessions).
 */
export function finnDagensAktiveOkt<T extends { status: string }>(todayAll: T[]): T | null {
  return (
    todayAll.find((s) => s.status !== "COMPLETED" && s.status !== "CANCELLED" && s.status !== "SKIPPED") ?? null
  );
}
