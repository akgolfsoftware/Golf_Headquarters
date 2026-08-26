/**
 * Kanonisk gruppetaksonomi + aktivt-medlemskap-fragmenter (plan G1).
 *
 * De åtte AK Golf-administrerte gruppene har fast slug — slug er identiteten,
 * fritekst-navn er visning. Alle oppslag på kanoniske grupper skal gå via slug
 * (`prisma.group.findUnique({ where: { slug } })`), aldri via navn.
 *
 * «Aktivt medlemskap» = `GroupMember.endedAt: null`. Utmelding er soft-end
 * (raden beholdes, endedAt settes); re-innmelding nuller endedAt. Spørringer
 * som mener «medlem nå» MÅ bruke fragmentene her — håndskrevne where-klausuler
 * uten endedAt-filter er feilen som lar utmeldte spillere forbli synlige.
 *
 * Ren modul (ingen IO) — trygg å importere fra klient og server.
 */

import { z } from "zod";

import type { PlayerProgram, Prisma } from "@/generated/prisma/client";

/**
 * Gruppemedlem-roller (plan G5). `GroupMember.role` er et String-felt i DB —
 * denne lista er kanon for lovlige verdier, og zod-schemaet er porten ved
 * API-/action-grensene (invariant 6: aldri `as`-cast på forretningsdata).
 * PLAYER = spiller · ASSISTANT = hjelpetrener (kun innsyn) · COACH = trener
 * (innsyn + redigering av gruppen).
 */
export const GRUPPEMEDLEM_ROLLER = ["PLAYER", "ASSISTANT", "COACH"] as const;

export type GruppemedlemRolle = (typeof GRUPPEMEDLEM_ROLLER)[number];

export const gruppemedlemRolleSchema = z.enum(GRUPPEMEDLEM_ROLLER);

export type KanoniskGruppeSlug =
  | "gfgk-mini"
  | "gfgk-basis"
  | "gfgk-utvikling"
  | "gfgk-elite"
  | "wang-toppidrett"
  | "wang-ung"
  | "ak-golf-academy"
  | "ak-golf-junior-academy"
  | "team-norway";

export interface KanoniskGruppe {
  slug: KanoniskGruppeSlug;
  navn: string;
  // GFGK Basis/Utvikling deler GFGK_BREDDE — enum-verdien heter allerede
  // «Bredde/Utvikling», og slug (ikke program) er gruppens identitet.
  // null for eksterne organisasjoner (Team Norway) — de er ikke et AK
  // Golf-coachingprogram, medlemmene er allerede innmeldt et annet sted
  // (WANG/GFGK/Academy) for selve coachingprogrammet sitt.
  program: PlayerProgram | null;
  // A1 | A2 | A3 | A4 | A5 — null der nivåstigen ikke gjelder
  level: string | null;
  // Group.kind: kontrakt | program | adhoc. «ekstern» = organisasjonen eies
  // ikke av AK Golf (Team Norway) — innsyn skjer KUN via EksternLeserGruppe +
  // DelingsSamtykke (src/lib/auth/ekstern-leser-scope.ts), aldri via
  // managedByAkGolf-fritaket under.
  kind: "kontrakt" | "program" | "ekstern";
  // Administrert av AK Golf: aktivt PLAYER-medlemskap gir gratis full
  // PlayerHQ-tilgang (aktivtAkGruppeMedlemskapWhere/resolveTilgang). Team
  // Norway er EKSPLISITT false — å stå i gruppen skal aldri i seg selv gi
  // gratis abonnement eller datainnsyn (samme GDPR-standpunkt som i
  // samtykke-regler.ts: medlemskap alene er aldri delingsgrunnlag).
  managedByAkGolf: boolean;
}

export const KANONISKE_GRUPPER: readonly KanoniskGruppe[] = [
  { slug: "gfgk-mini", navn: "GFGK Junior Mini U10", program: "GFGK_MINI", level: "A5", kind: "program", managedByAkGolf: true },
  { slug: "gfgk-basis", navn: "GFGK Junior Basis U13", program: "GFGK_BREDDE", level: "A4", kind: "program", managedByAkGolf: true },
  { slug: "gfgk-utvikling", navn: "GFGK Junior Utvikling U15", program: "GFGK_BREDDE", level: "A3", kind: "program", managedByAkGolf: true },
  { slug: "gfgk-elite", navn: "GFGK Junior Elite U19", program: "GFGK_ELITE", level: "A2", kind: "program", managedByAkGolf: true },
  { slug: "wang-toppidrett", navn: "WANG Toppidrett Fredrikstad", program: "WANG_TOPPIDRETT", level: null, kind: "kontrakt", managedByAkGolf: true },
  { slug: "wang-ung", navn: "WANG Ung Fredrikstad", program: "WANG_UNG", level: null, kind: "kontrakt", managedByAkGolf: true },
  { slug: "ak-golf-academy", navn: "AK Golf Academy", program: "AK_ACADEMY", level: null, kind: "program", managedByAkGolf: true },
  { slug: "ak-golf-junior-academy", navn: "AK Golf Junior Academy", program: "AK_ACADEMY_JUNIOR", level: null, kind: "program", managedByAkGolf: true },
  { slug: "team-norway", navn: "Team Norway Golf", program: null, level: null, kind: "ekstern", managedByAkGolf: false },
] as const;

export function kanoniskGruppe(slug: KanoniskGruppeSlug): KanoniskGruppe {
  const gruppe = KANONISKE_GRUPPER.find((g) => g.slug === slug);
  if (!gruppe) throw new Error(`Ukjent kanonisk gruppe-slug: ${slug}`);
  return gruppe;
}

/** Aktivt medlemskap uansett rolle (spillere, hjelpetrenere, trenere). */
export function aktivtMedlemskapWhere(): Prisma.GroupMemberWhereInput {
  return { endedAt: null };
}

/** Aktivt SPILLER-medlemskap — utrulling av planer og tilgangsregler. */
export function aktivtSpillerMedlemskapWhere(): Prisma.GroupMemberWhereInput {
  return { endedAt: null, role: "PLAYER" };
}

/**
 * Aktivt TRENER-medlemskap (COACH eller ASSISTANT) for en gitt bruker —
 * innsynsporten i G5: en coach som selv er trener/hjelpetrener i en gruppe
 * ser gruppens spillere (coachScopedPlayerWhere, tredje gren). Gir IKKE
 * redigering alene — den porten (eierGruppen) krever role COACH.
 */
export function aktivtTrenerMedlemskapWhere(userId: string): Prisma.GroupMemberWhereInput {
  return { userId, role: { in: ["COACH", "ASSISTANT"] }, endedAt: null };
}

/**
 * Kontrakten til resolveTilgang (plan A3): aktivt spiller-medlemskap i en
 * AK Golf-administrert gruppe gir gratis full PlayerHQ-tilgang.
 */
export function aktivtAkGruppeMedlemskapWhere(): Prisma.GroupMemberWhereInput {
  return { endedAt: null, role: "PLAYER", group: { managedByAkGolf: true } };
}

/**
 * User-where-fragment: brukeren har minst ett aktivt AK-gruppemedlemskap.
 * Brukes i spørringer som filtrerer spillere på gratis-via-gruppe.
 */
export function harAktivtAkGruppeMedlemskapWhere(): Prisma.UserWhereInput {
  return { groupMemberships: { some: aktivtAkGruppeMedlemskapWhere() } };
}
