/**
 * PlayerHQ Turneringer (/portal/tren/turneringer) — portet FRA fersk Claude
 * Design-fasit (ph-screens.jsx · TournamentsScreen).
 *
 * REN lese-oversikt (kanon: å planlegge mot en turnering skjer i Workbench):
 * eyebrow «OVERSIKT · {år}» → «{N} påmeldt.» → lead → accent-kort (lime
 * venstrekant) → turneringsliste (trophy + navn + dato·kategori + status-chip
 * + chevron) → primary «Planlegg i Workbench». Ekte TournamentEntry-data.
 */

import Link from "next/link";
import { Trophy, ChevronRight, LayoutTemplate } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticBadge } from "@/components/athletic/badge";

export const dynamic = "force-dynamic";

const TALLORD = ["Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];
const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

export default async function TurneringerPage() {
  const user = await requirePortalUser();
  const aar = new Date().getFullYear();

  const entries = await prisma.tournamentEntry.findMany({
    where: { userId: user.id, entryStatus: { in: ["PLANNED", "CONFIRMED"] } },
    include: { tournament: { select: { name: true, startDate: true, location: true } } },
    orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
    take: 30,
  });

  const rader = entries
    .map((e) => {
      const dato = e.tournament?.startDate ?? e.manualDate ?? null;
      return {
        id: e.id,
        navn: e.tournament?.name ?? e.manualName ?? "Turnering",
        dato: dato ? `${dato.getDate()}. ${MND[dato.getMonth()]}` : "—",
        kategori: e.category ?? e.tournament?.location ?? "Turnering",
        bekreftet: e.entryStatus === "CONFIRMED",
      };
    })
    .filter((r) => r.dato !== "—");

  const antall = rader.length;
  const antallOrd = antall <= 12 ? TALLORD[antall] : String(antall);

  return (
    <div className="mx-auto w-full max-w-[460px] px-1 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <AthleticEyebrow>OVERSIKT · {aar}</AthleticEyebrow>
      <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
        {antallOrd} <em className="font-normal italic text-primary">påmeldt.</em>
      </h1>
      <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
        Hva som kommer. Å planlegge mot en turnering skjer i Workbench.
      </p>

      <div className="my-4 max-w-[640px] rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
        Dette er en ren oversikt. Trykk{" "}
        <b className="text-foreground">«Planlegg i Workbench»</b> for å legge en turnering i årsplanen.
      </div>

      <div className="max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card px-4">
        {rader.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">Ingen kommende turneringer i planen ennå.</p>
        ) : (
          rader.map((t) => (
            <Link
              key={t.id}
              href={`/portal/tren/turneringer/${t.id}`}
              className="flex w-full items-center gap-3.5 border-b border-border py-3.5 last:border-b-0 transition-colors hover:bg-secondary/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Trophy className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold tracking-[-0.005em] text-foreground">{t.navn}</span>
                <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                  {t.dato} · {t.kategori}
                </span>
              </span>
              <AthleticBadge variant="ok">{t.bekreftet ? "Bekreftet" : "Påmeldt"}</AthleticBadge>
              <ChevronRight className="h-[18px] w-[18px] shrink-0 text-muted-foreground/60" strokeWidth={2} aria-hidden />
            </Link>
          ))
        )}
      </div>

      <div className="mt-4 max-w-[640px]">
        <Link
          href="/portal/planlegge"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <LayoutTemplate className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden />
          Planlegg i Workbench
        </Link>
      </div>
    </div>
  );
}
