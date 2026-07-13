/**
 * AgencyOS — Turneringer (/admin/tournaments) — v2.
 *
 * Datakilde: prisma.tournamentEntry gruppert per turnering — viser KUN
 * turneringer stallen er påmeldt i, kommende fra inneværende uke. Status-chip
 * avledes av entry-statusene: alle bekreftet → «Bekreftet», noen påmeldt
 * (ubekreftet) → «Påmelding åpen», kun trukket → «Trukket». Logikk bevart
 * 1:1 fra den tidligere legacy-siden — kun visuelt portert til v2.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/uke-helpers";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTurneringerV2, type AdminTurneringV2Row, type TurneringChipTone } from "@/components/admin/v2/AdminTurneringerV2";

export const dynamic = "force-dynamic";

type RadIntern = AdminTurneringV2Row & { statuser: string[] };

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
function statusChip(statuser: string[]): { label: string; tone: TurneringChipTone } | null {
  const aktive = statuser.filter((s) => s === "PLANNED" || s === "CONFIRMED");
  if (aktive.length === 0) {
    if (statuser.some((s) => s === "COMPLETED" || s === "DNF")) {
      return { label: "Gjennomført", tone: "neu" };
    }
    if (statuser.some((s) => s === "WITHDRAWN")) {
      return { label: "Trukket", tone: "neu" };
    }
    return null;
  }
  if (aktive.every((s) => s === "CONFIRMED")) return { label: "Bekreftet", tone: "ok" };
  return { label: "Påmelding åpen", tone: "lime" };
}

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

  const perTurnering = new Map<string, { start: Date; end: Date | null } & RadIntern>();
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
        navn: t?.name ?? e.manualName ?? "(uten navn)",
        start,
        end: t?.endDate ?? e.manualEndDate ?? null,
        anlegg: t ? (t.course?.name ?? (t.location || null)) : null,
        datoTekst: "",
        paameldte: 0,
        chip: null,
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
      navn: r.navn,
      datoTekst: datoSpenn(r.start, r.end),
      anlegg: r.anlegg,
      paameldte: r.statuser.filter((s) => s !== "WITHDRAWN").length,
      chip: statusChip(r.statuser),
    }));

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTurneringerV2 data={{ sesong: now.getFullYear(), rader }} />
    </V2Shell>
  );
}
