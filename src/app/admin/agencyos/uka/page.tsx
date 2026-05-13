// AgencyOS · Uka — 7-dagers kanban med Bookinger gruppert per dag.
// Speiler WeekScreen fra Claude artifact AK Golf AgencyOS.

import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

const DAGNAVN_KORT = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const DAGNAVN_LANG = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];

function ukeNummer(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000));
}

export default async function UkaPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const idag = new Date(now);
  idag.setHours(0, 0, 0, 0);
  const mandag = new Date(idag);
  mandag.setDate(idag.getDate() - ((idag.getDay() + 6) % 7));
  const sondag = new Date(mandag);
  sondag.setDate(mandag.getDate() + 7);

  const bookinger = await prisma.booking.findMany({
    where: {
      startAt: { gte: mandag, lt: sondag },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    orderBy: { startAt: "asc" },
    include: { user: true, serviceType: true, location: true },
  });

  // Gruppér per dag (0 = mandag)
  const dager = Array.from({ length: 7 }, (_, i) => {
    const dato = new Date(mandag);
    dato.setDate(mandag.getDate() + i);
    const erIdag = dato.getTime() === idag.getTime();
    const erHelg = i >= 5;
    const events = bookinger.filter((b) => {
      const bd = new Date(b.startAt);
      bd.setHours(0, 0, 0, 0);
      return bd.getTime() === dato.getTime();
    });
    return { dato, erIdag, erHelg, events };
  });

  const totalTimer = bookinger.reduce(
    (sum, b) => sum + (b.endAt.getTime() - b.startAt.getTime()) / (1000 * 60 * 60),
    0,
  );
  const unikeSpillere = new Set(bookinger.map((b) => b.userId)).size;
  const kapasitet = 28; // mål
  const kapasitetPct = Math.round((totalTimer / kapasitet) * 100);

  const sluttDato = new Date(sondag);
  sluttDato.setDate(sluttDato.getDate() - 1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`AgencyOS · Uke ${ukeNummer(mandag)}`}
        titleLead="Uka"
        titleItalic={`${mandag.getDate()}.–${sluttDato.getDate()}. ${sluttDato.toLocaleDateString("nb-NO", { month: "short" })}`}
        sub="Caddie balanserer kapasitet, reise og familie-tid."
        actions={
          <Link
            href="/admin/calendar"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Ny booking
          </Link>
        }
      />

      {/* Uke-KPI */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <UkeKpi label="Timer totalt" value={`${Math.round(totalTimer)}`} sub={`av ${kapasitet} mål`} />
        <UkeKpi label="Bookinger" value={String(bookinger.length)} sub="denne uka" />
        <UkeKpi label="Unike spillere" value={String(unikeSpillere)} sub="møter denne uka" />
        <UkeKpi label="Kapasitet" value={`${kapasitetPct}%`} sub={kapasitetPct < 70 ? "Rom til mer" : "Full"} />
      </div>

      {/* 7-dagers grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {dager.map((d, i) => (
          <div
            key={i}
            className={`flex min-h-[200px] flex-col rounded-lg border bg-card p-3 ${
              d.erIdag
                ? "border-primary ring-2 ring-primary/40"
                : d.erHelg
                  ? "border-border bg-secondary/30"
                  : "border-border"
            }`}
          >
            <div className="mb-3 border-b border-border pb-2">
              <div
                className={`font-mono text-[10px] uppercase tracking-[0.10em] ${
                  d.erIdag ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {DAGNAVN_KORT[i]} {d.dato.getDate()}.
              </div>
              <div className="font-display text-sm font-semibold tracking-tight">
                {d.erIdag ? (
                  <>
                    <em>I dag</em>
                  </>
                ) : (
                  DAGNAVN_LANG[i]
                )}
              </div>
            </div>
            {d.events.length === 0 ? (
              <div className="flex flex-1 items-center justify-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {d.erHelg ? "— beskyttet —" : "— ledig —"}
              </div>
            ) : (
              <ul className="space-y-2">
                {d.events.map((e) => {
                  const navn = e.user?.name ?? e.guestName ?? "Gjest";
                  const dur = Math.round((e.endAt.getTime() - e.startAt.getTime()) / (1000 * 60));
                  return (
                    <li
                      key={e.id}
                      className="rounded-md border border-border bg-background p-2 text-xs"
                    >
                      <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {e.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })} · {dur} min
                      </div>
                      <div className="mt-0.5 truncate font-semibold text-foreground">{navn}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {e.serviceType.name}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Vis full måned eller drag-and-drop i full kalender
        </div>
        <Link
          href="/admin/calendar"
          className="mt-2 inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-secondary"
        >
          Åpne kalender →
        </Link>
      </div>
    </div>
  );
}

function UkeKpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}
