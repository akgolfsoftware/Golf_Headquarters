/**
 * AgencyOS — Turneringer (/admin/tournaments).
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → TournamentsScreen (mørkt
 * tema, desktop 1280): PageHead («PLANLEGGE · TURNERINGER» / «Sesong {år}.» /
 * lead + «Ny turnering») og tabell Turnering · Dato · Anlegg · Påmeldte ·
 * Status · Fellesmelding-knapp per rad (åpner komponer-panel, fasit-flyt).
 *
 * Datakilde: prisma.tournamentEntry gruppert per turnering — viser KUN
 * turneringer stallen er påmeldt i (fasit: «Turneringene stallen din
 * spiller»), kommende fra inneværende uke. Turneringskatalogen for søk/
 * påmelding bor i turnering-detalj/ny-flyten. Status-chip avledes av
 * entry-statusene: alle bekreftet → «Bekreftet», noen påmeldt (ubekreftet)
 * → «Påmelding åpen», kun trukket → «Trukket». Anlegg uten bane = «—».
 */

import Link from "next/link";
import { Plus, Trophy } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/uke-helpers";
import {
  AgChip,
  AgPage,
  AgPageHead,
  AgTable,
  AgTd,
  AgTh,
  agBtnClass,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { FellesmeldingKnapp } from "./_fellesmelding-knapp";

export const dynamic = "force-dynamic";

type Rad = {
  key: string;
  href: string | null;
  name: string;
  start: Date;
  end: Date | null;
  venue: string | null;
  paameldte: number;
  chip: { label: string; tone: "ok" | "warn" | "neu" | "lime" } | null;
};

/** «9.–10. jun» / «21. jun» / «14. aug – 16. sep» (nb-NO, uten år). */
function datoSpenn(start: Date, end: Date | null): string {
  const mnd = (d: Date) =>
    d.toLocaleDateString("nb-NO", { month: "short" }).replace(/\.$/, "");
  if (!end || start.toDateString() === end.toDateString()) {
    return `${start.getDate()}. ${mnd(start)}`;
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}.–${end.getDate()}. ${mnd(start)}`;
  }
  return `${start.getDate()}. ${mnd(start)} – ${end.getDate()}. ${mnd(end)}`;
}

/** Chip fra entry-statusene til stallens påmeldinger. */
function statusChip(statuser: string[]): Rad["chip"] {
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
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

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

  // Grupper stallens påmeldinger per turnering (katalog-koblet eller manuell).
  const perTurnering = new Map<string, Rad & { statuser: string[] }>();
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
        chip: null,
        statuser: [e.entryStatus],
      });
    }
  }

  const rader: Rad[] = [...perTurnering.values()]
    .filter((r) => r.start.getTime() >= ukeStart.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((r) => ({
      ...r,
      paameldte: r.statuser.filter((s) => s !== "WITHDRAWN").length,
      chip: statusChip(r.statuser),
    }));

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Planlegge · Turneringer"
        title="Sesong"
        italic={`${now.getFullYear()}.`}
        lead="Turneringene stallen din spiller. Send fellesmelding til alle påmeldte med ett klikk."
        actions={
          <Link href="/admin/tournaments/ny" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny turnering
          </Link>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <AgTable>
          <thead>
            <tr>
              <AgTh>Turnering</AgTh>
              <AgTh>Dato</AgTh>
              <AgTh>Anlegg</AgTh>
              <AgTh num>Påmeldte</AgTh>
              <AgTh>Status</AgTh>
              <AgTh />
            </tr>
          </thead>
          <tbody>
            {rader.length === 0 && (
              <tr>
                <td colSpan={6} className="px-[14px] py-10 text-center text-[13px] text-muted-foreground">
                  Ingen kommende turneringer med påmeldte fra stallen.
                </td>
              </tr>
            )}
            {rader.map((r) => (
              <tr key={r.key} className={agTrClass}>
                <AgTd>
                  <span className="flex items-center gap-[10px]">
                    <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-secondary text-primary">
                      <Trophy size={16} strokeWidth={1.5} />
                    </span>
                    {r.href ? (
                      <Link href={r.href} className="font-semibold text-foreground hover:underline">
                        {r.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{r.name}</span>
                    )}
                  </span>
                </AgTd>
                <AgTd>
                  <span className="font-mono text-xs">{datoSpenn(r.start, r.end)}</span>
                </AgTd>
                <AgTd>
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.venue ?? "—"}
                  </span>
                </AgTd>
                <AgTd num>{r.paameldte}</AgTd>
                <AgTd>
                  {r.chip ? <AgChip tone={r.chip.tone}>{r.chip.label}</AgChip> : "—"}
                </AgTd>
                <AgTd className="text-right">
                  <FellesmeldingKnapp navn={r.name} mottakere={r.paameldte} />
                </AgTd>
              </tr>
            ))}
          </tbody>
        </AgTable>
      </div>
    </AgPage>
  );
}
