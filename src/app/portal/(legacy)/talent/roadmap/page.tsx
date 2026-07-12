/**
 * PlayerHQ — Talent · Roadmap (MOBILE-FIRST 430px)
 *
 * Utviklings-roadmap bygget på ekte data:
 *  - Faser fra SeasonPlan.periodBlocks (L-fase + periode + fokus) — ingen
 *    fabrikerte fremdrifts-prosenter (DB har ikke per-mål-progresjon).
 *  - Turneringer fra SeasonPlan.tournamentEntries (navn + dato).
 *  - Milepæler fra TalentTracking.milepaeler (DB).
 *  - KPI-strip er avledet av ekte tellinger.
 *
 * Når data mangler vises ærlige tom-tilstander, ikke demo-tall. Pre-beta-stripe
 * beholdt fordi sesongplan-funksjonen fortsatt er under utbygging.
 */
import Link from "next/link";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  Circle,
  Flag,
  Trophy,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { LPhase } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Milepael = {
  tittel: string;
  dato: string;
  beskrivelse?: string;
  oppnadd?: boolean;
};

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json.filter(
    (m): m is Milepael =>
      typeof m === "object" &&
      m !== null &&
      typeof (m as Milepael).tittel === "string",
  );
}

const LPHASE_NAVN: Record<LPhase, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialisering",
  TURNERING: "Turneringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function periodeTekst(start: Date, end: Date): string {
  const a = MND_KORT[start.getMonth()];
  const b = MND_KORT[end.getMonth()];
  return a === b ? a : `${a} – ${b}`;
}

function datoTekst(d: Date): string {
  return `${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

export default async function RoadmapPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const ar = new Date().getFullYear();

  const [tracking, sesongplan] = await Promise.all([
    prisma.talentTracking.findUnique({
      where: { userId: user.id },
      select: { niva: true, milepaeler: true },
    }),
    prisma.seasonPlan.findFirst({
      where: { userId: user.id, year: ar },
      include: {
        periodBlocks: { orderBy: { startDate: "asc" } },
        tournamentEntries: {
          where: { entryStatus: { not: "WITHDRAWN" } },
          include: { tournament: { select: { name: true, startDate: true } } },
        },
      },
    }),
  ]);
  if (!tracking) return null;

  const milepaeler = parseMilepaeler(tracking.milepaeler);

  const faser = (sesongplan?.periodBlocks ?? []).map((b) => ({
    id: b.id,
    navn: LPHASE_NAVN[b.lPhase],
    periode: periodeTekst(b.startDate, b.endDate),
    fokus: b.focus ?? null,
  }));

  const turneringer = (sesongplan?.tournamentEntries ?? [])
    .map((e) => {
      const navn = e.tournament?.name ?? e.manualName ?? null;
      const dato = e.tournament?.startDate ?? e.manualDate ?? null;
      return navn ? { id: e.id, navn, dato } : null;
    })
    .filter((t): t is { id: string; navn: string; dato: Date | null } => t !== null)
    .sort((a, b) => (a.dato?.getTime() ?? 0) - (b.dato?.getTime() ?? 0));

  return (
    <div className="mx-auto flex max-w-[480px] flex-col gap-4">
      {/* Pre-beta-stripe */}
      <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-warning">
          PRE-BETA · Sesongplan-funksjonen er under utbygging
        </p>
      </div>

      {/* Tilbake */}
      <Link
        href="/portal/talent"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Tilbake til talent
      </Link>

      {/* Header */}
      <header>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.6)]" />
          </span>
          TALENT · ROADMAP · {tracking.niva}
        </span>
        <h1 className="mt-1.5 font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
          Min vei mot{" "}
          <em className="font-normal italic text-primary">neste nivå</em>.
        </h1>
        <p className="mt-1.5 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
          Sesong {ar}
        </p>
      </header>

      {/* KPI-strip — ekte tellinger */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { lbl: "Faser", v: faser.length, sub: "i sesongplan" },
          { lbl: "Turneringer", v: turneringer.length, sub: "planlagt" },
          { lbl: "Milepæler", v: milepaeler.length, sub: "registrert" },
        ].map((b) => (
          <div
            key={b.lbl}
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5"
          >
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              {b.lbl}
            </span>
            <span className="font-mono text-[18px] font-bold leading-none tabular-nums tracking-[-0.02em] text-foreground">
              {b.v}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
              {b.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Faser fra sesongplan */}
      <section className="flex flex-col gap-3" aria-label="Faser i sesongplan">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            Sesongplan · faser
          </span>
        </div>
        {faser.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Ingen sesongplan for {ar} ennå. Faser dukker opp her når planen er
              lagt i Workbench.
            </p>
            <Link
              href="/portal/planlegge"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-foreground transition hover:bg-secondary"
            >
              Gå til planlegging
            </Link>
          </div>
        ) : (
          faser.map((fase) => (
            <article
              key={fase.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">
                  {fase.navn}
                </h3>
                <span className="ml-auto font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                  {fase.periode}
                </span>
              </div>
              {fase.fokus && (
                <p className="mt-1 font-display text-[13px] italic text-muted-foreground">
                  {fase.fokus}
                </p>
              )}
            </article>
          ))
        )}
      </section>

      {/* Turneringer fra sesongplan */}
      {turneringer.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4" aria-label="Planlagte turneringer">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Planlagte turneringer
            </span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {turneringer.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                  {t.navn}
                </span>
                {t.dato && (
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {datoTekst(t.dato)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Milepæler fra DB */}
      {milepaeler.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4" aria-label="Personlige milepæler">
          <div className="mb-3 flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Personlige milepæler
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {milepaeler.map((m, i) => (
              <li key={`${m.tittel}-${i}`} className="flex items-start gap-3">
                {m.oppnadd ? (
                  <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                )}
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-tight text-foreground">
                    {m.tittel}
                  </div>
                  {m.dato && (
                    <div className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                      {m.dato}
                    </div>
                  )}
                  {m.beskrivelse && (
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {m.beskrivelse}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tom-tilstand når ingenting finnes */}
      {faser.length === 0 &&
        turneringer.length === 0 &&
        milepaeler.length === 0 && (
          <p className={cn("text-center font-mono text-[11px] text-muted-foreground")}>
            Ingen roadmap-data registrert ennå.
          </p>
        )}
    </div>
  );
}
