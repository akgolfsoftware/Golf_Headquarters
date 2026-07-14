/**
 * AgencyOS — Turneringer-hub (`/admin/tournaments`), v2.
 *
 * Port av `src/app/admin/(legacy)/tournaments/page.tsx` (2026-07-13, AgencyOS
 * Bølge 1.1) — samme datamodell/-logikk (prisma.tournamentEntry gruppert per
 * turnering, KUN turneringer stallen er påmeldt i, kommende fra inneværende
 * uke), ny v2-presentasjon i `AdminTurneringerV2`. Detalj-siden
 * (`/admin/tournaments/[id]`) er allerede v2 og urørt.
 *
 * `actions.ts`/`tournament-form.tsx`/`_fellesmelding-knapp.tsx` bor fortsatt
 * under `(legacy)/tournaments/` — de er delt logikk som også detalj-siden
 * bruker, IKKE gammel UI (se `plans/legacy-portering-prioritet.md`).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/uke-helpers";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTurneringerV2, type AdminTurneringV2Row } from "@/components/admin/v2/AdminTurneringerV2";
import type { StatusTone } from "@/components/v2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turneringer · AgencyOS (v2)" };

/** «9.–10. jun» / «21. jun» / «14. aug – 16. sep» (nb-NO, uten år). */
function datoSpenn(start: Date, end: Date | null): string {
  const mnd = (d: Date) => d.toLocaleDateString("nb-NO", { month: "short" }).replace(/\.$/, "");
  if (!end || start.toDateString() === end.toDateString()) {
    return `${start.getDate()}. ${mnd(start)}`;
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}.–${end.getDate()}. ${mnd(start)}`;
  }
  return `${start.getDate()}. ${mnd(start)} – ${end.getDate()}. ${mnd(end)}`;
}

/** Chip fra entry-statusene til stallens påmeldinger. */
function statusChip(statuser: string[]): { label: string; tone: StatusTone } | null {
  const aktive = statuser.filter((s) => s === "PLANNED" || s === "CONFIRMED");
  if (aktive.length === 0) {
    if (statuser.some((s) => s === "COMPLETED" || s === "DNF")) {
      return { label: "Gjennomført", tone: "info" };
    }
    if (statuser.some((s) => s === "WITHDRAWN")) {
      return { label: "Trukket", tone: "info" };
    }
    return null;
  }
  if (aktive.every((s) => s === "CONFIRMED")) return { label: "Bekreftet", tone: "up" };
  return { label: "Påmelding åpen", tone: "lime" };
}

type RadInternal = AdminTurneringV2Row & { start: Date; end: Date | null; statuser: string[] };

export default async function TurneringerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const ukeStart = startOfWeek(now);

  const entries = await prisma.tournamentEntry.findMany({
    select: {
      entryStatus: true,
      tournamentId: true,
      manualName: true,
      manualDate: true,
      manualEndDate: true,
      tournament: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          location: true,
          course: { select: { name: true } },
        },
      },
    },
  });

  const perTurnering = new Map<string, RadInternal>();
  for (const e of entries) {
    const t = e.tournament;
    const key = t ? t.id : `manuell:${e.manualName ?? "?"}:${e.manualDate?.toISOString() ?? "?"}`;
    const start = t?.startDate ?? e.manualDate;
    if (!start) continue;
    const eksisterende = perTurnering.get(key);
    if (eksisterende) {
      eksisterende.statuser.push(e.entryStatus);
    } else {
      perTurnering.set(key, {
        key,
        href: t ? `/admin/tournaments/${t.id}` : null,
        name: t?.name ?? e.manualName ?? "(uten navn)",
        start,
        end: t?.endDate ?? e.manualEndDate ?? null,
        venue: t ? (t.course?.name ?? (t.location || null)) : null,
        paameldte: 0,
        datoSpenn: "",
        status: null,
        statuser: [e.entryStatus],
      });
    }
  }

  const rader: AdminTurneringV2Row[] = [...perTurnering.values()]
    .filter((r) => r.start.getTime() >= ukeStart.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((r) => ({
      key: r.key,
      href: r.href,
      name: r.name,
      datoSpenn: datoSpenn(r.start, r.end),
      venue: r.venue,
      paameldte: r.statuser.filter((s) => s !== "WITHDRAWN").length,
      status: statusChip(r.statuser),
    }));

  return (
    <V2Shell aktiv="tournaments" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTurneringerV2 ar={now.getFullYear()} nyHref="/admin/tournaments/ny" rader={rader} />
    </V2Shell>
  );
}
