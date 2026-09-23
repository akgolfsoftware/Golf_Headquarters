import "server-only";

import { prisma } from "@/lib/prisma";
import { Capability } from "@/lib/auth/cbac";
import { canUser } from "@/lib/auth/effective-capabilities";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { hentTnArbeidskontekst, hentTnSpillere, type TnBruker } from "@/lib/domain/tn-arbeidsflate";
import { coachLagreGruppePeriode, coachSlettGruppePeriode, coachRullUtGruppeAarsplan } from "@/lib/workbench/gruppe-periode-actions";
import {
  loadSession,
  loadSources,
  createSession,
  createSessionFromSource,
  addDrillFromSource,
  moveSession,
  deleteSession,
  publishSessions,
  setSessionTemplate,
  updateSeriesSession,
  type CreateSessionInput,
} from "@/lib/workbench/wb-actions";
import { forrigeSourceId, parseSourceId } from "@/lib/workbench/sources-map";
import { addDays } from "@/lib/domain/workbench/operations";
import type { RecurrencePolicy, WorkbenchSession, SourceItem } from "@/lib/domain/workbench/types";

/**
 * Lesedata OG skrivewrappere for TN-22 Workbench/kalender
 * (14.09.2026-utvidelsen, rettet etter Codex-review samme dag —
 * `root-review-plan.md`).
 *
 * Ingen ny motor eller tabell: gruppenivået kaller de samme
 * gruppeperiode-actionene som `/admin/grupper/[id]/workbench`, og
 * spillernivået kaller de samme actionene i `src/lib/workbench/wb-actions.ts`
 * som `/admin/workbench/[playerId]` — men ALDRI direkte fra siden lenger.
 * Alle skrivinger går via de TN-spesifikke wrapperne under, som legger på
 * TRE ting den delte motoren ikke selv gjør:
 *
 *  1. TN-ROLLEPORT: kun TN-rolle COACH (eller platform-ADMIN) får skrive.
 *     `harCoachTilgangTilSpiller`/`coachScopedPlayerWhere` sin tredje gren
 *     (G5) slipper et TN-ASSISTANT-medlem gjennom på lik linje med et
 *     TN-COACH-medlem — det er riktig for LESING (samme som
 *     `hentViewerRolleIGruppe` i tn-post.ts), men for SKRIVING skal
 *     ASSISTANT være innsyn, ikke redigering (samme skille som
 *     `eierGruppen` i admin/grupper/[id]/actions.ts). Wrapperne under er
 *     derfor den eksplisitte TN-rolleporten Codex ba om — de endrer og
 *     utvider ALDRI selve `coachScopedPlayerWhere`/`ensurePlanAccess`.
 *  2. ROSTER-PORT: den valgte spilleren må faktisk være et AKTIVT TN-
 *     spillermedlem (`kontekst.spillere`) — en personlig coach-relasjon
 *     utenfor TN gir ikke tilgang til en TN-side, og en utmeldt/ukjent
 *     spiller-id avvises uansett platform-rolle.
 *  3. EIERSKAPS-PORT: en økt-mutasjon (flytt/slett/publiser) verifiserer at
 *     økten FAKTISK tilhører den valgte spilleren FØR den kaller den delte
 *     actionen — et forfalsket `sessionId` i skjemaet for en annen spiller
 *     avvises her, ikke bare i UI-et.
 */

const TN_KJENTE_ROLLER = new Set(["PLAYER", "ASSISTANT", "COACH", "ADMIN"]);

/**
 * GLOBAL rolleport (User.role — platform-rollen, IKKE GroupMember.role).
 * TN-gruppemedlemskap alene skal aldri gi trener-/administrasjonskontekst
 * til noen hvis PLATTFORM-rolle ikke også er trenerens/adminens: en rad der
 * GroupMember.role="COACH" men User.role="PLAYER"/"PARENT" (feilregistrert,
 * eller i prinsippet mulig siden GroupMember.role er en fri streng, ikke en
 * DB-enum — se schema-kommentaren) skal ALDRI regnes som trener. Dette er en
 * ekstra, eksplisitt sjekk utover `kontekst.kanAdministrere` (som kun ser på
 * GroupMember.role og ADMIN — se rettelsen i `hentTnWorkbenchKontekst`).
 */
function erGlobalTrenerRolle(bruker: TnBruker): boolean {
  return bruker.role === "COACH" || bruker.role === "ADMIN";
}

export type TnWorkbenchKontekst = {
  gruppeId: string;
  gruppeNavn: string;
  /** ASSISTANT eller COACH i TN-gruppen, OG platform-rolle COACH/ADMIN (lesetilgang til trenerflater) — IKKE skriverett alene, se `kanAdministrere`. */
  erTrener: boolean;
  /** TN-rolle PLAYER OG platform-rolle PLAYER — begge må stemme. */
  erSpiller: boolean;
  /** TN-rolle COACH (eller ADMIN) OG platform-rolle COACH/ADMIN — eneste kombinasjon som får skrive (gruppeplan, økter, oppgaver). */
  kanAdministrere: boolean;
  /** Aktive spillermedlemmer i TN-gruppen — grunnlaget for spillervelgeren OG roster-porten. */
  spillere: { id: string; navn: string }[];
};

/**
 * Null for enhver ukjent/legacy rolleverdi (f.eks. GUEST) — fail-closed,
 * samme prinsipp som `hentViewerRolleIGruppe` i tn-post.ts.
 *
 * To rettelser (14.09.2026, andre Codex-runde):
 *  1. `erTrener`/`kanAdministrere` regnet tidligere ADMIN som «ikke trener»
 *     fordi sjekken var `rolle === "COACH" || rolle === "ASSISTANT"` — en
 *     ADMIN uten eget TN-medlemskap har `kontekst.rolle === "ADMIN"` (se
 *     `hentTnOversiktForBruker`) og falt dermed utenfor. Rettet: egen
 *     boolean som inkluderer ADMIN eksplisitt.
 *  2. Lagt til en EKSPLISITT global platform-rolleport (`erGlobalTrenerRolle`)
 *     i tillegg til GroupMember.role — se kommentaren der. `kontekst.
 *     kanAdministrere` fra den delte `hentTnArbeidskontekst` sjekker KUN
 *     `bruker.role === "ADMIN" || oversikt.rolle === "COACH"`, uten selv å
 *     kreve at bruker.role er COACH i COACH-tilfellet. Denne fila stoler
 *     derfor ikke på den verdien alene lenger — begge må stemme.
 */
export async function hentTnWorkbenchKontekst(bruker: TnBruker): Promise<TnWorkbenchKontekst | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || !TN_KJENTE_ROLLER.has(kontekst.rolle)) return null;
  const globalTrener = erGlobalTrenerRolle(bruker);
  const tnRolleErTrenerAktig = kontekst.rolle === "COACH" || kontekst.rolle === "ASSISTANT" || kontekst.rolle === "ADMIN";
  const tnRolleErCoachAktig = kontekst.rolle === "COACH" || kontekst.rolle === "ADMIN";
  const spillerside = await hentTnSpillere(bruker);
  return {
    gruppeId: kontekst.gruppe.id,
    gruppeNavn: kontekst.gruppe.name,
    erTrener: globalTrener && tnRolleErTrenerAktig,
    erSpiller: bruker.role === "PLAYER" && kontekst.rolle === "PLAYER",
    kanAdministrere: globalTrener && tnRolleErCoachAktig,
    spillere: (spillerside?.rader ?? []).map((r) => ({ id: r.id, navn: r.navn })),
  };
}

/** Er denne id-en faktisk et AKTIVT TN-spillermedlem nå (roster-porten)? */
function erAktivTnSpiller(kontekst: TnWorkbenchKontekst, spillerId: string): boolean {
  return kontekst.spillere.some((s) => s.id === spillerId);
}

/**
 * Full skrivetilgang til en TN-spillers PERSONLIGE plan: TN-rolle COACH
 * (eller platform-ADMIN), spilleren er et aktivt TN-medlem, OG samme
 * personlige coach-tilgang som Workbench ellers krever
 * (`harCoachTilgangTilSpiller` — G5 gir dette automatisk for et TN-COACH-
 * medlem via gruppemedlemskapet, se `coached.ts`). Alle tre må stå.
 */
async function kanSkrivePersonligPlan(bruker: TnBruker, kontekst: TnWorkbenchKontekst, spillerId: string): Promise<boolean> {
  if (!kontekst.kanAdministrere) return false;
  if (!erGlobalTrenerRolle(bruker)) return false;
  if (!erAktivTnSpiller(kontekst, spillerId)) return false;
  return harCoachTilgangTilSpiller({ id: bruker.id, role: bruker.role }, spillerId);
}

/**
 * Kan viewer LESE denne TN-spillerens personlige plan? Spilleren selv (KUN
 * når rolle-/roster-kontrollen faktisk bekrefter at viewer ER en aktiv TN-
 * spiller — se merknad under), eller en TN-COACH/ASSISTANT med personlig
 * coach-tilgang OG spilleren er et aktivt TN-medlem. Bredere enn
 * skrivetilgangen (ASSISTANT kan lese).
 *
 * Selv-ID-snarveien lå tidligere FØRST og stolte blindt på `bruker.id ===
 * spillerId` uten noen rolle-/rosterkontroll i det hele tatt. Rettet: krever
 * nå `kontekst.erSpiller` (som selv krever BÅDE TN-rolle PLAYER OG platform-
 * rolle PLAYER, se `hentTnWorkbenchKontekst`) — en trener som av en eller
 * annen grunn har samme id som `spillerId` (bør ikke skje, men skal uansett
 * ikke gi et implisitt smutthull) faller nå videre til trener-sjekken under.
 */
export async function harTnPersonligPlanLesetilgang(bruker: TnBruker, kontekst: TnWorkbenchKontekst, spillerId: string): Promise<boolean> {
  if (kontekst.erSpiller && bruker.id === spillerId) return true;
  if (!kontekst.erTrener) return false;
  if (!erAktivTnSpiller(kontekst, spillerId)) return false;
  return harCoachTilgangTilSpiller({ id: bruker.id, role: bruker.role }, spillerId);
}

export type TnHandlingResultat = { ok: true } | { ok: false; feil: string };

/**
 * Kan viewer administrere GRUPPENS årsplan? Krever BÅDE `kontekst.
 * kanAdministrere` (TN-rolle COACH/ADMIN) OG en eksplisitt global platform-
 * rollesjekk (`erGlobalTrenerRolle`) — ikke bare den ene. `kanAdministrere`
 * gjør riktignok allerede dette internt nå (se `hentTnWorkbenchKontekst`),
 * men gruppehandlinger gjentar sjekken eksplisitt her: dette er skriving mot
 * en delt ressurs (hele gruppens plan, ikke bare én spiller), og skal aldri
 * hvile på at kontekst-beregningen andre steder forblir riktig.
 */
function kanAdministrereTnGruppe(bruker: TnBruker, kontekst: TnWorkbenchKontekst): boolean {
  return kontekst.kanAdministrere && erGlobalTrenerRolle(bruker);
}

/** TN-rollegjenbruk av `coachLagreGruppePeriode` — krever TN-COACH/ADMIN OG platform-COACH/ADMIN, bundet til DENNE gruppen. */
export async function tnLagrePeriode(bruker: TnBruker, kontekst: TnWorkbenchKontekst, input: unknown): Promise<TnHandlingResultat> {
  if (!kanAdministrereTnGruppe(bruker, kontekst)) return { ok: false, feil: "Du har ikke rettighet til å redigere gruppens årsplan." };
  const res = await coachLagreGruppePeriode(kontekst.gruppeId, input);
  return res.ok ? { ok: true } : { ok: false, feil: res.error ?? "Kunne ikke lagre." };
}

export async function tnSlettPeriode(bruker: TnBruker, kontekst: TnWorkbenchKontekst, periodeId: string): Promise<TnHandlingResultat> {
  if (!kanAdministrereTnGruppe(bruker, kontekst)) return { ok: false, feil: "Du har ikke rettighet til å redigere gruppens årsplan." };
  const res = await coachSlettGruppePeriode(kontekst.gruppeId, periodeId);
  return res.ok ? { ok: true } : { ok: false, feil: res.error ?? "Kunne ikke slette." };
}

export async function tnRullUtAarsplan(bruker: TnBruker, kontekst: TnWorkbenchKontekst): Promise<TnHandlingResultat> {
  if (!kanAdministrereTnGruppe(bruker, kontekst)) return { ok: false, feil: "Du har ikke rettighet til å rulle ut gruppens årsplan." };
  const res = await coachRullUtGruppeAarsplan(kontekst.gruppeId);
  return res.ok ? { ok: true } : { ok: false, feil: res.error ?? "Kunne ikke rulle ut." };
}

/** Kan viewer skrive gruppens årsplan? Krever TN-COACH/ADMIN OG platform-COACH/ADMIN — kapasiteten `EDIT_GROUP_PLANS` sjekkes uansett inne i selve actionen. */
export async function kanRedigereTnGruppeplan(bruker: TnBruker, kontekst: TnWorkbenchKontekst): Promise<boolean> {
  if (!kanAdministrereTnGruppe(bruker, kontekst)) return false;
  return canUser({ id: bruker.id, role: bruker.role }, Capability.EDIT_GROUP_PLANS);
}

export type TnGruppePeriodeRad = {
  id: string;
  lPhase: string;
  startDate: Date;
  endDate: Date;
  focus: string | null;
  weeklyVolMin: number | null;
  weeklyVolMax: number | null;
};

/** Gruppens periodeblokker (årsplan) — samme rader som admin-gruppeworkbenchen leser. */
export async function hentTnGruppePerioder(groupId: string): Promise<TnGruppePeriodeRad[]> {
  return prisma.groupPeriodBlock.findMany({
    where: { groupId },
    orderBy: { startDate: "asc" },
    select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true, weeklyVolMin: true, weeklyVolMax: true },
  });
}

export type TnGruppeTimeRad = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  location: string | null;
  kind: string | null;
};

/**
 * Faktisk UTC-forskyvning (minutter, positivt = foran UTC) for Europe/Oslo
 * på et gitt tidspunkt — +60 om vinteren, +120 i sommertid. Beregnes med
 * `Intl` (ingen tidssone-bibliotek i prosjektet), ikke en hardkodet tabell,
 * så DST-datoene aldri kan gå ut av synk med de faktiske reglene.
 */
function osloOffsetMinutter(instant: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Oslo",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  const somOmDetVarUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((somOmDetVarUtc - instant.getTime()) / 60_000);
}

/**
 * Det FAKTISKE UTC-tidspunktet for Europe/Oslo-midnatt på en kalenderdag —
 * DST-riktig (sommertid/vintertid), ikke en antakelse om at serveren kjører
 * i én bestemt sone. To iterasjoner er nok: midnatt faller aldri på selve
 * DST-overgangsøyeblikket (som i Norge alltid er kl. 01–03 lokal tid), så
 * forskyvningen stabiliserer seg på første forsøk.
 */
export function osloMidnattUtc(dateIso: string): Date {
  const [aar, maned, dag] = dateIso.split("-").map(Number);
  let utcMs = Date.UTC(aar, maned - 1, dag, 0, 0, 0);
  for (let i = 0; i < 2; i++) {
    const offset = osloOffsetMinutter(new Date(utcMs));
    utcMs = Date.UTC(aar, maned - 1, dag, 0, 0, 0) - offset * 60_000;
  }
  return new Date(utcMs);
}

/**
 * Gruppens faste/ad-hoc treningstider i et gitt vindu.
 * `fraIso`/`tilIso` er Europe/Oslo-kalenderdager (YYYY-MM-DD, inklusiv) —
 * IKKE UTC-dager. Øvre grense er DEN FAKTISKE Oslo-midnatten dagen ETTER
 * `tilIso` (`lt`, eksklusiv). En tidligere versjon brukte ren UTC-midnatt
 * (`T00:00:00.000Z`), som i sommertid ligger 2 timer FØR faktisk Oslo-
 * midnatt — en økt som starter 22:00–23:59 Oslo tid siste dag i vinduet
 * (UTC 20:00–21:59) ville uansett vært innenfor selv med den gamle grensen
 * her, men grensen var likevel feil forankret og ville gitt galt resultat
 * for økter rundt UTC-midnatt/Oslo-morgen (00:00–01:59 Oslo sommertid =
 * 22:00–23:59 UTC DAGEN FØR). `GroupSchedule.startAt` avgjør hvilken dag en
 * økt tilhører — en økt som krysser midnatt (f.eks. 23:00–01:00) telles på
 * STARTDAGEN, aldri splittet eller dobbelttalt, uansett hvor lenge den varer.
 */
export async function hentTnGruppeTimer(groupId: string, fraIso: string, tilIso: string): Promise<TnGruppeTimeRad[]> {
  const fra = osloMidnattUtc(fraIso);
  const tilEksklusiv = osloMidnattUtc(addDays(tilIso, 1));
  return prisma.groupSchedule.findMany({
    where: { groupId, startAt: { gte: fra, lt: tilEksklusiv } },
    orderBy: { startAt: "asc" },
    select: { id: true, title: true, startAt: true, endAt: true, location: true, kind: true },
  });
}

// ---------------------------------------------------------------------------
// Personlig plan — skrivewrappere med TN-rolleport + roster-port + eierskapsport
// ---------------------------------------------------------------------------

export async function tnOpprettOkt(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: Omit<CreateSessionInput, "playerId">,
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const res = await createSession({ ...input, playerId: spillerId });
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

/** Henter økten og verifiserer at den faktisk tilhører `spillerId` (eierskapsporten). */
async function hentOktForSpiller(spillerId: string, sessionId: string): Promise<{ feil: string } | { data: WorkbenchSession }> {
  const res = await loadSession(sessionId);
  if (!res.ok) return { feil: res.error };
  if (!res.data) return { feil: "Fant ikke økten." };
  if (res.data.playerId !== spillerId) return { feil: "Denne økten tilhører ikke valgt spiller." };
  return { data: res.data };
}

export async function tnFlyttOkt(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: { sessionId: string; newDate: string; newStartMinute: number },
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const eier = await hentOktForSpiller(spillerId, input.sessionId);
  if ("feil" in eier) return { ok: false, feil: eier.feil };
  const res = await moveSession(input);
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

export async function tnSlettOkt(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  sessionId: string,
  bekreftelse: string,
): Promise<TnHandlingResultat> {
  if (bekreftelse.trim().toUpperCase() !== "SLETT") {
    return { ok: false, feil: "Skriv SLETT for å bekrefte slettingen." };
  }
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const eier = await hentOktForSpiller(spillerId, sessionId);
  if ("feil" in eier) return { ok: false, feil: eier.feil };
  const res = await deleteSession(sessionId);
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

export async function tnPubliserOkt(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  sessionId: string,
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const eier = await hentOktForSpiller(spillerId, sessionId);
  if ("feil" in eier) return { ok: false, feil: eier.feil };
  const res = await publishSessions([sessionId]);
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

// ---------------------------------------------------------------------------
// Andre økt-modeller (`TrainingSessionV2`, `TrainingPlanSession`) — LESING,
// ALDRI slått sammen med WorkbenchSession-lista.
//
// Spilleren har historisk hatt økter i minst tre separate modeller
// (`WorkbenchSession` er dagens, `TrainingSessionV2` og `TrainingPlanSession`
// er fortsatt aktivt lest/skrevet andre steder i appen — bl.a.
// `src/lib/portal/idag-data.ts`, `/admin/kalender`, `/portal/tren/fys-plan`,
// og `resolveLiveSession` slår dem opp i nøyaktig denne rekkefølgen:
// TrainingSessionV2 → TrainingPlanSession → WorkbenchSession). De er ALDRI
// slått sammen her — hver vises i egen, tydelig merket liste, og lenker til
// SAMME kanoniske `/portal/live/[id]`-statusruter som WorkbenchSession
// allerede bruker (bekreftet i `resolve-live-session.ts`: den slår opp id-en
// på tvers av alle tre modellene, så lenken er reell for alle tre — ikke en
// antakelse). Ingen redigering er bygget for disse to — kun lesing, siden
// oppdraget spesifikt ba om at de bevares synlige, ikke at de gjøres
// redigerbare fra TN.
// ---------------------------------------------------------------------------

export type TnAnnenOktRad = {
  id: string;
  title: string;
  start: Date;
  status: string;
  kilde: "TRAININGSESSION_V2" | "TRAININGPLAN_SESSION";
};

/** `TrainingSessionV2` for spilleren i vinduet — direkte `studentId`-felt. */
export async function hentTnTrainingSessionV2(spillerId: string, fra: Date, til: Date): Promise<TnAnnenOktRad[]> {
  const rader = await prisma.trainingSessionV2.findMany({
    where: { studentId: spillerId, startTime: { gte: fra, lt: til } },
    orderBy: { startTime: "asc" },
    select: { id: true, title: true, startTime: true, status: true },
  });
  return rader.map((r) => ({ id: r.id, title: r.title, start: r.startTime, status: r.status, kilde: "TRAININGSESSION_V2" as const }));
}

/** `TrainingPlanSession` for spilleren i vinduet — spilleren eies via `plan.userId`, ikke et direkte felt på selve økten. */
export async function hentTnTrainingPlanSession(spillerId: string, fra: Date, til: Date): Promise<TnAnnenOktRad[]> {
  const rader = await prisma.trainingPlanSession.findMany({
    where: { plan: { userId: spillerId }, scheduledAt: { gte: fra, lt: til } },
    orderBy: { scheduledAt: "asc" },
    select: { id: true, title: true, scheduledAt: true, status: true },
  });
  return rader.map((r) => ({ id: r.id, title: r.title, start: r.scheduledAt, status: r.status, kilde: "TRAININGPLAN_SESSION" as const }));
}

// ---------------------------------------------------------------------------
// Kopier / mal / seriegjennomgang — gjenbruker eksisterende motor
// (createSessionFromSource/setSessionTemplate/updateSeriesSession), aldri en
// ny kopi av WorkbenchV2.
// ---------------------------------------------------------------------------

/** Kopier en eksisterende økt til en ny dato/tid for SAMME spiller — bruker `createSessionFromSource` (samme mekanisme som «forrige uke»-kildepanelet). */
export async function tnKopierOkt(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: { kildeSessionId: string; nyDato: string; nyStartMinutt: number },
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  // Kildescope: kilden må faktisk tilhøre SAMME spiller vi kopierer til — en
  // TN-trener skal aldri kunne kopiere en annen spillers økt inn i denne
  // spillerens plan ved å oppgi et forfalsket kilde-id.
  const kilde = await hentOktForSpiller(spillerId, input.kildeSessionId);
  if ("feil" in kilde) return { ok: false, feil: kilde.feil };

  const res = await createSessionFromSource({
    playerId: spillerId,
    sourceId: forrigeSourceId(input.kildeSessionId),
    date: input.nyDato,
    startMinute: input.nyStartMinutt,
  });
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

/** Lagre/fjern en økt som mal i kildepanelet — samme eierskapskontroll som de andre øktmutasjonene. */
export async function tnSettMal(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  sessionId: string,
  erMal: boolean,
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const eier = await hentOktForSpiller(spillerId, sessionId);
  if ("feil" in eier) return { ok: false, feil: eier.feil };
  const res = await setSessionTemplate(sessionId, erMal);
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

/**
 * Kildepanelet (øvelsesbank + spillerens egne maler + forrige uke) for valgt
 * spiller — samme underliggende spørring som AgencyOS Workbench
 * (`loadSources`). Kun trener (skriverett) trenger dette: det brukes til å
 * VELGE en kilde å legge til, ikke til passiv lesing.
 */
export async function hentTnKilder(bruker: TnBruker, kontekst: TnWorkbenchKontekst, spillerId: string): Promise<SourceItem[]> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) return [];
  const res = await loadSources({ playerId: spillerId });
  return res.ok ? res.data : [];
}

/**
 * `createSessionFromSource`/`addDrillFromSource` sitt DRILL-oppslag
 * (`prisma.exerciseDefinition.findUnique({ where: { id } })`) er et RÅTT
 * oppslag uten synlighetsfilter — det finner en spillers PRIVATE øvelse
 * (source PLAYER, ikke COACH_PLAYERS) like gjerne som en delt SYSTEM-øvelse.
 * `loadSources` derimot filtrerer riktig (SYSTEM / COACH_PLAYERS / egen).
 * Denne funksjonen er derfor den faktiske synlighetsporten: en `sourceId`
 * er kun lovlig å bruke for `spillerId` hvis den faktisk dukker opp i
 * spillerens EGET kildepanel.
 */
async function erLovligKildeForSpiller(spillerId: string, sourceId: string): Promise<boolean> {
  const res = await loadSources({ playerId: spillerId });
  if (!res.ok) return false;
  return res.data.some((s) => s.id === sourceId);
}

/** Opprett en økt direkte fra en lagret mal eller øvelse — samme kildescope-verifisering: malen/øvelsen må faktisk dukke opp i valgt spillers eget kildepanel. */
export async function tnOpprettFraMal(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: { sourceId: string; dato: string; startMinutt: number },
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const kilde = parseSourceId(input.sourceId);
  if (!kilde) return { ok: false, feil: "Ukjent kilde." };
  if (kilde.kind === "MAL" || kilde.kind === "FORRIGE") {
    const eier = await hentOktForSpiller(spillerId, kilde.sessionId);
    if ("feil" in eier) return { ok: false, feil: "Malen tilhører ikke valgt spiller." };
  } else {
    // DRILL: den delte handlingen slår øvelsen opp uten synlighetsfilter —
    // vi verifiserer derfor selv at øvelsen faktisk er lovlig for spilleren
    // (SYSTEM, delt av coach, eller spillerens egen) FØR den brukes.
    if (!(await erLovligKildeForSpiller(spillerId, input.sourceId))) {
      return { ok: false, feil: "Øvelsen er ikke tilgjengelig for denne spilleren." };
    }
  }
  const res = await createSessionFromSource({ playerId: spillerId, sourceId: input.sourceId, date: input.dato, startMinute: input.startMinutt });
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

/** Legg en øvelse fra kildepanelet til en EKSISTERENDE økt — samme synlighets- og eierskapsport som `tnOpprettFraMal`. */
export async function tnLeggTilOvelseIOkt(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: { sessionId: string; sourceId: string },
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const eier = await hentOktForSpiller(spillerId, input.sessionId);
  if ("feil" in eier) return { ok: false, feil: eier.feil };
  const kilde = parseSourceId(input.sourceId);
  if (!kilde || kilde.kind !== "DRILL") return { ok: false, feil: "Kun øvelser kan legges til en eksisterende økt." };
  if (!(await erLovligKildeForSpiller(spillerId, input.sourceId))) {
    return { ok: false, feil: "Øvelsen er ikke tilgjengelig for denne spilleren." };
  }
  const res = await addDrillFromSource({ sessionId: input.sessionId, sourceId: input.sourceId });
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

/** Rediger tittel/pyramide/miljø/notater på én økt — eller denne+fremover/hele serien når økten er del av en gjentakelse. */
export async function tnRedigerOktInnhold(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  input: {
    sessionId: string;
    policy: RecurrencePolicy;
    patch: { title?: string; pyramid?: WorkbenchSession["pyramid"]; notes?: string };
  },
): Promise<TnHandlingResultat> {
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  const eier = await hentOktForSpiller(spillerId, input.sessionId);
  if ("feil" in eier) return { ok: false, feil: eier.feil };

  // Den delte `serieMalRammer`/`sessionsMatchingPolicy` slår opp HELE serien
  // via `seriesId` ALENE, uten et `playerId`-filter — for `policy !==
  // "DENNE"` verifiserer vi derfor selv at HVER økt i serien faktisk
  // tilhører spilleren FØR den delte, bredere handlingen kalles. Uten dette
  // ville en (uventet, men ikke DB-umulig) serie som spenner flere spillere
  // latt en TN-trener endre en annen spillers økter via policy-parameteren.
  if (input.policy !== "DENNE" && eier.data.seriesId) {
    const serieRader = await prisma.workbenchSession.findMany({
      where: { seriesId: eier.data.seriesId },
      select: { playerId: true },
    });
    if (serieRader.some((r) => r.playerId !== spillerId)) {
      return { ok: false, feil: "Serien inneholder økter som ikke tilhører valgt spiller — bruk «Kun denne økten»." };
    }
  }

  const res = await updateSeriesSession({ sessionId: input.sessionId, patch: input.patch, policy: input.policy });
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}

/**
 * Gjennomgang-før-publisering: verifiser at HVER oppgitte økt faktisk
 * tilhører valgt spiller FØR den samlede publiseringen kjøres — coachen ser
 * (i UI-et) hele det konkrete utvalget av økter med tittel/dato/tid rett
 * over avkrysningsboksene, ikke bare ett enkelt-øktnavn, før trykk.
 */
export async function tnPubliserFlere(
  bruker: TnBruker,
  kontekst: TnWorkbenchKontekst,
  spillerId: string,
  sessionIds: string[],
): Promise<TnHandlingResultat> {
  if (sessionIds.length === 0) return { ok: false, feil: "Ingen økter valgt." };
  if (!(await kanSkrivePersonligPlan(bruker, kontekst, spillerId))) {
    return { ok: false, feil: "Du har ikke skriverett til denne spillerens plan." };
  }
  for (const id of sessionIds) {
    const eier = await hentOktForSpiller(spillerId, id);
    if ("feil" in eier) return { ok: false, feil: `${eier.feil} (${id})` };
  }
  const res = await publishSessions(sessionIds);
  return res.ok ? { ok: true } : { ok: false, feil: res.error };
}
