/**
 * Kommunikasjon — datalasting per fane (MASTERPLAN 15.7).
 *
 * Kun den AKTIVE fanens fulle innhold lastes fra siden — aldri alle fire
 * samtidig (samme prinsipp som src/lib/admin/turnering/lastere.ts). Unntak:
 * "innboks" (saker) lastes alltid — se begrunnelse på lastKommunikasjonInnboks.
 *
 * "utkast" og "sendt" er IKKE to tabeller — de er statusfiltre på samme
 * InnboksEpost-tabell (loadEpostVedStatus i src/lib/innboks/data.ts), samme
 * mønster som Turneringes "alle"/"mine-spillere" deler datakilde via filter.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { loadInnboksSaker, type InnboksData } from "@/lib/admin/innboks-saker";
import { loadEpostVedStatus, tellEpostVedStatus, type InnboksEpostVm } from "@/lib/innboks/data";
import type { AdminEmailV2Data, AdminEmailV2Template } from "@/components/admin/v2/AdminEmailV2";
import type { KommunikasjonFaneId } from "./faner";

/** Status-verdiene på InnboksEpost — se kommentar i prisma/schema.prisma. */
const UTKAST_STATUSER = ["NY", "UTKAST_KLART"];
const SENDT_STATUSER = ["SENDT", "ARKIVERT"];

/**
 * Fane «Innboks» — flyttet ORDRETT fra src/app/admin/innboks/page.tsx (samme
 * loader, samme rolle-scoping). Lastes uansett aktiv fane (ikke bare når
 * "innboks" er valgt): datakilden er allerede rolle-scopet og bundet med
 * `take`-grenser på hver delkilde (maks 40/30/30/30/20 rader), så kostnaden
 * ved å alltid vise et ferskt «åpne saker»-tall i fanepillen er lav — samme
 * avveining som å ikke bygge en egen, dupliserende telle-spørring for et
 * fem-kilders sak-system (PlanAction/CaddieDraft/SessionRequest/Notification/
 * AppFeedback/Sak).
 */
export async function lastKommunikasjonInnboks(user: {
  id: string;
  role: string;
  name?: string | null;
}): Promise<InnboksData> {
  return loadInnboksSaker(user);
}

/** Fane «Utkast» — venter på deg (ikke sendt ennå). ADMIN-only, se page.tsx. */
export async function lastKommunikasjonUtkast(): Promise<InnboksEpostVm[]> {
  return loadEpostVedStatus(UTKAST_STATUSER);
}

/** Fane «Sendt» — ferdigbehandlet (sendt eller arkivert). ADMIN-only, se page.tsx. */
export async function lastKommunikasjonSendt(): Promise<InnboksEpostVm[]> {
  return loadEpostVedStatus(SENDT_STATUSER);
}

function fmtDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Fane «Maler» — flyttet ORDRETT fra src/app/admin/email-templates/page.tsx
 * (samme Prisma-spørring og samme slug-prefiks-gruppering).
 */
export async function lastKommunikasjonMaler(): Promise<AdminEmailV2Data> {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const maler: AdminEmailV2Template[] = templates.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    subject: t.subject,
    body: t.body,
    active: t.active,
    gruppe: t.slug.includes("-") ? t.slug.split("-")[0] : "andre",
    sistEndret: fmtDato(t.updatedAt),
    opprettet: fmtDato(t.createdAt),
  }));

  const grupper = Array.from(new Set(maler.map((m) => m.gruppe))).sort();

  return {
    total: maler.length,
    aktive: maler.filter((m) => m.active).length,
    grupper,
    maler,
  };
}

/** Fanetellinger — billige count-spørringer for pillene (utkast/sendt/maler). */
export async function kommunikasjonFaneTellinger(
  innboksApne: number,
): Promise<Partial<Record<KommunikasjonFaneId, number>>> {
  const [utkast, sendt, maler] = await Promise.all([
    tellEpostVedStatus(UTKAST_STATUSER),
    tellEpostVedStatus(SENDT_STATUSER),
    prisma.emailTemplate.count(),
  ]);
  return { innboks: innboksApne, utkast, sendt, maler };
}
