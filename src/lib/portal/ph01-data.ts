import "server-only";

/**
 * Lastere som PH-01 I dag (Precision Athletics) trenger i tillegg til
 * getDashboardData: dagsform, historikk for fullførte økter og pop-up.
 */
import { prisma } from "@/lib/prisma";
import { beregnFullfortHistorikk, type FullfortHistorikk } from "./ph01-fullfort";

const OSLO_ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });

/** Oslo-dagen som @db.Date-verdi (UTC-midnatt), jf. gotchas §Tid og datoer. */
export function osloDagSomDbDato(naa: Date): Date {
  const [a, m, d] = OSLO_ISO.format(naa).split("-").map(Number);
  return new Date(Date.UTC(a!, m! - 1, d!));
}

/** Dagens dagsform 1–5, eller null. Tabellen kan mangle til skriptet er kjørt. */
export async function hentDagsform(userId: string, naa: Date): Promise<number | null> {
  try {
    const rad = await prisma.playerDailyForm.findUnique({
      where: { userId_date: { userId, date: osloDagSomDbDato(naa) } },
      select: { value: true },
    });
    return rad?.value ?? null;
  } catch {
    return null;
  }
}

/** Alle spillerens økter i begge modeller, for rekke og milepæler. */
export async function hentFullfortHistorikk(userId: string, naa: Date): Promise<FullfortHistorikk> {
  const [wb, v2] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        playerId: userId,
        hiddenByPlayer: false,
        needsPlayerApproval: false,
        status: { in: ["PUBLISHED", "IN_PROGRESS", "COMPLETED", "SKIPPED"] },
        date: { lte: osloDagSomDbDato(naa) },
      },
      select: { date: true, status: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: userId, status: { not: "CANCELLED" }, startTime: { lte: naa } },
      select: { startTime: true, status: true },
    }),
  ]);
  return beregnFullfortHistorikk(
    [...wb.map((o) => ({ dato: o.date, status: o.status })), ...v2.map((o) => ({ dato: o.startTime, status: o.status }))],
    naa,
  );
}

const PLAN_TYPER = ["plan", "PLAN_ADJUSTMENT_PENDING", "plan_action_applied"];
const MELDING_TYPER = ["coach_message", "MESSAGE", "melding"];

export type IDagPopup = { id: string; kind: string; title: string; body: string | null; createdAt: Date; href: string };

/**
 * Pop-up bare for melding fra coach eller endring i planen (runde 8): siste
 * uleste varsel av de typene, sendt i dag.
 */
export async function hentIDagPopup(userId: string, naa: Date): Promise<IDagPopup | null> {
  const dagStart = new Date(osloDagSomDbDato(naa).getTime() - 2 * 3_600_000);
  const v = await prisma.notification.findFirst({
    where: { userId, readAt: null, type: { in: [...PLAN_TYPER, ...MELDING_TYPER] }, createdAt: { gte: dagStart } },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, title: true, body: true, createdAt: true, link: true },
  });
  if (!v) return null;
  // Varselet må være fra i dag etter Oslo-kalenderen, ikke bare de siste timene.
  if (OSLO_ISO.format(v.createdAt) !== OSLO_ISO.format(naa)) return null;
  return {
    id: v.id,
    kind: PLAN_TYPER.includes(v.type) ? "Endring i planen" : "Melding fra coach",
    title: v.title,
    body: v.body,
    createdAt: v.createdAt,
    href: v.link ?? "/portal/varsler",
  };
}
