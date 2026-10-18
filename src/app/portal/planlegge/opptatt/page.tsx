// PlayerHQ Opptatt tid — Precision Athletics, pakke 17b (utkast plan-hjelpere.html, 16.10.2026).
/**
 * Uka med egne avtaler, Google-kalenderen og øktene i planen, lista over faste avtaler og Google-koblingen.
 * Bare spillerens egne avtaler leses og endres (opptatt-actions scoper på innlogget bruker).
 * Erstatter /portal/kalender/opptatt, som sender hit.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { osloInstant, OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { ukenummer } from "@/lib/uke-helpers";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
import { byggUke, fasteAvtaler } from "@/lib/portal-plan/opptatt-uke";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHOpptattTid } from "@/components/portal/precision/PHOpptattTid";

export const dynamic = "force-dynamic";
export const metadata = { title: "Opptatt tid · PlayerHQ" };

const DAG_MS = 86_400_000;
const OSLO_KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" });
const OSLO_SYNK = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Mandagen (UTC-midnatt) i uka for en Oslo-dato «YYYY-MM-DD». */
function mandagFor(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  return new Date(t - ((new Date(t).getUTCDay() + 6) % 7) * DAG_MS);
}

export default async function OpptattTidPage({ searchParams }: { searchParams: Promise<{ uke?: string }> }) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { uke } = await searchParams;
  const naa = new Date();
  const idag = OSLO_YMD_FMT.format(naa);
  const mandag = mandagFor(uke && /^\d{4}-\d{2}-\d{2}$/.test(uke) && !Number.isNaN(Date.parse(uke)) ? uke : idag);
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  const sondag = new Date(mandag.getTime() + 6 * DAG_MS);
  const fra = osloInstant(mandag.getUTCFullYear(), mandag.getUTCMonth() + 1, mandag.getUTCDate(), 0, 0);
  const nesteMandag = new Date(mandag.getTime() + 7 * DAG_MS);
  const til = osloInstant(nesteMandag.getUTCFullYear(), nesteMandag.getUTCMonth() + 1, nesteMandag.getUTCDate(), 0, 0);

  const [blokker, okter, google, uleste] = await Promise.all([
    prisma.playerBusyBlock.findMany({
      where: { userId: user.id, OR: [{ recurring: "WEEKLY" }, { endAt: { gte: new Date(Math.min(fra.getTime(), naa.getTime())) } }] },
      orderBy: { startAt: "asc" },
      take: 200,
      select: { id: true, title: true, startAt: true, endAt: true, recurring: true, isPrivate: true, kind: true },
    }),
    loadVisibleSessionRange(user.id, fra.toISOString(), til.toISOString()),
    prisma.googleCalendarConnection.findUnique({
      where: { userId: user.id },
      select: {
        googleEmail: true, lastSyncAt: true, status: true,
        subscriptions: {
          where: { active: true },
          select: {
            syncPush: true, syncPull: true,
            events: {
              where: { startAt: { lt: til }, endAt: { gt: fra }, status: { not: "cancelled" }, transparency: "opaque" },
              select: { startAt: true, endAt: true, allDay: true },
              take: 100,
            },
          },
        },
      },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  const googleHendelser = (google?.subscriptions ?? []).filter((s) => s.syncPull).flatMap((s) => s.events);
  const perId = new Map(blokker.map((b) => [b.id, b]));
  const avtaler = fasteAvtaler(blokker, naa).flatMap((a) => {
    const b = perId.get(a.id);
    return b ? [{ ...a, startISO: b.startAt.toISOString(), sluttISO: b.endAt.toISOString(), kind: b.kind }] : [];
  });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHOpptattTid data={{
        ukeNr: ukenummer(fra),
        ukeTekst: `${OSLO_KORT.format(mandag)}–${OSLO_KORT.format(sondag)}`,
        forrigeHref: `/portal/planlegge/opptatt?uke=${ymd(new Date(mandag.getTime() - 7 * DAG_MS))}`,
        nesteHref: `/portal/planlegge/opptatt?uke=${ymd(nesteMandag)}`,
        dager: byggUke({
          mandag: ymd(mandag), idag, fra, til, blokker,
          okter: okter.map((o) => ({ title: o.title, startTime: o.startTime, pyramidArea: o.pyramidArea ?? null })),
          google: googleHendelser,
        }),
        avtaler,
        google: google ? {
          epost: google.googleEmail,
          synket: google.lastSyncAt ? OSLO_SYNK.format(google.lastSyncAt) : null,
          beggeVeier: google.subscriptions.some((s) => s.syncPush),
          status: google.status,
        } : null,
      }} />
    </PlayerHQSkall>
  );
}
