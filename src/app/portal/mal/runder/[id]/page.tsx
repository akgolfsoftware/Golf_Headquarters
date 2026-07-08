/**
 * PlayerHQ · Runde-detalj (/portal/mal/runder/[id]) — portet FRA fersk
 * Claude Design-fasit (ph-screens.jsx · RoundDetailScreen).
 *
 * Struktur (fasit): eyebrow «{BANE} · {DATO}» → h1 «{score} {to-par}.» (em
 * primary italic) → accent-kort (stor to-par + «{score} slag · Par {par} ·
 * 18 hull» + SG total) → scorecard UT 1–9 / INN 10–18 (kun når Shot-data
 * finnes — ellers ærlig tomtekst, aldri fabrikkerte hulltall) → SecHead
 * STROKES GAINED + 4 diverging SG-barer (sgOtt/sgApp/sgArg/sgPutt) →
 * knapperad «Se SG-trend» + «Del med coach».
 *
 * Ekte Prisma-data. Lead (tee/spilletid) utelatt — Round-modellen har ikke
 * feltene. Server component, auth-guard via requirePortalUser.
 *
 * Slag-registrering (B3): scorecard-blokken lenker til ./slag (SlagWizard +
 * UpGame-import) — kun for rundens eier. Detaljsiden forblir ren visning.
 */
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { cn } from "@/lib/utils";

/** Birdie/par/bogey/dobbel+ — fasitens scorecard-farger (kun DS-tokens). */
function scoreFarge(diff: number): string {
  if (diff <= -1) return "text-success";
  if (diff === 0) return "text-foreground";
  if (diff === 1) return "text-warning";
  return "text-destructive";
}

function tilParTekst(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

type HullScore = { par: number; score: number };

/** Én ni-hulls blokk i scorecardet (9-kolonners grid, jf. fasitens Nine). */
function NiHull({
  label,
  fra,
  hull,
}: {
  label: string;
  fra: number;
  hull: Map<number, HullScore>;
}) {
  const numre = Array.from({ length: 9 }, (_, i) => fra + i);
  const kjente = numre.filter((n) => hull.has(n));
  const parSum = kjente.reduce((a, n) => a + (hull.get(n)?.par ?? 0), 0);
  const scoreSum = kjente.reduce((a, n) => a + (hull.get(n)?.score ?? 0), 0);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-foreground">
          {label}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          Par {parSum} · <b className="font-bold text-foreground">{scoreSum}</b>
        </span>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {numre.map((n) => {
          const h = hull.get(n);
          return (
            <span key={n} className="text-center">
              <span className="block whitespace-nowrap font-mono text-[8px] text-muted-foreground">
                {h ? `${n} · par ${h.par}` : n}
              </span>
              <span
                className={cn(
                  "mt-0.5 block font-mono text-[15px] font-bold tabular-nums",
                  h ? scoreFarge(h.score - h.par) : "text-muted-foreground",
                )}
              >
                {h ? h.score : "–"}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Diverging SG-bar (senter-null) — kopiert mønster fra
 * src/components/portal/analysere/analysere-faner.tsx (SGBar), scale 0.7
 * jf. fasit. null ⇒ tom bane + «—», aldri fabrikkert verdi.
 */
function SgRad({ navn, verdi }: { navn: string; verdi: number | null }) {
  const scale = 0.7;
  const w = verdi == null ? 0 : Math.min(Math.abs(verdi) / scale, 1) * 50;
  const pos = (verdi ?? 0) >= 0;
  return (
    <div className="grid grid-cols-[118px_1fr_58px] items-center gap-3 py-2.5">
      <span className="text-[13px] font-medium text-foreground">{navn}</span>
      <span className="relative h-2 rounded-full bg-muted">
        <span className="absolute bottom-0 left-1/2 top-0 w-px bg-border" />
        {verdi != null && (
          <span
            className={"absolute bottom-0 top-0 rounded-full " + (pos ? "bg-primary" : "bg-destructive")}
            style={pos ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }}
          />
        )}
      </span>
      <span
        className={cn(
          "text-right font-mono text-xs font-semibold",
          verdi == null ? "text-muted-foreground" : pos ? "text-success" : "text-destructive",
        )}
      >
        {verdi == null ? "—" : `${pos ? "+" : "−"}${Math.abs(verdi).toFixed(2)}`}
      </span>
    </div>
  );
}

export default async function RundeDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: true,
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
    },
  });

  if (!runde) notFound();
  if (runde.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  const par = runde.course.par;
  const diff = runde.score - par;
  const tilParH1 = diff === 0 ? "even par." : `${tilParTekst(diff)}.`;

  const datoTekst = runde.playedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Hull-for-hull fra Shot-modellen: score per hull = antall registrerte slag.
  const hull = new Map<number, HullScore>();
  for (const s of runde.shots) {
    const e = hull.get(s.holeNumber);
    if (e) e.score += 1;
    else hull.set(s.holeNumber, { par: s.holePar, score: 1 });
  }
  const harHullData = hull.size > 0;
  const erEier = runde.userId === user.id;

  const sgTotal = runde.sgTotal;
  const sgTotalTekst =
    sgTotal == null
      ? "—"
      : `${sgTotal >= 0 ? "+" : "−"}${Math.abs(sgTotal).toFixed(1).replace(".", ",")}`;

  return (
    <div className="mx-auto w-full max-w-[460px] px-1 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <Link
        href="/portal/mal/runder"
        className="mb-2 inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Alle runder
      </Link>

      {/* Header — eyebrow + score-headline */}
      <div>
        <AthleticEyebrow>
          {runde.course.name} · {datoTekst}
        </AthleticEyebrow>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
          {runde.score} <em className="font-normal italic text-primary">{tilParH1}</em>
        </h1>
      </div>

      {/* Accent-kort — to-par + slag + SG total */}
      <div className="mt-4 flex max-w-[520px] items-center gap-4 rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5">
        <span className="font-mono text-[38px] font-extrabold leading-none tracking-[-0.03em] text-foreground">
          {tilParTekst(diff)}
        </span>
        <div className="flex-1">
          <div className="font-mono text-base font-extrabold text-foreground">
            {runde.score} slag
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Par {par} · 18 hull
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "font-mono text-base font-extrabold",
              sgTotal == null
                ? "text-muted-foreground"
                : sgTotal >= 0
                  ? "text-success"
                  : "text-destructive",
            )}
          >
            {sgTotalTekst}
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            SG total
          </div>
        </div>
      </div>

      {/* Scorecard UT/INN — kun ekte Shot-data, ellers ærlig tomtekst */}
      <div className="mt-3 max-w-[520px] rounded-2xl border border-border bg-card p-[18px]">
        {harHullData ? (
          <div className="space-y-3">
            <NiHull label="UT · 1–9" fra={1} hull={hull} />
            <NiHull label="INN · 10–18" fra={10} hull={hull} />
            {erEier && (
              <Link
                href={`/portal/mal/runder/${id}/slag`}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-primary transition-opacity hover:opacity-80"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                Rediger slag
              </Link>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">
              Hull-for-hull mangler for denne runden.
            </p>
            {erEier && (
              <Link
                href={`/portal/mal/runder/${id}/slag`}
                className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Registrer slag-for-slag
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Strokes Gained */}
      <div className="mb-3 mt-7 flex items-baseline justify-between">
        <AthleticEyebrow>Strokes Gained</AthleticEyebrow>
      </div>
      <div className="max-w-[520px] rounded-2xl border border-border bg-card p-[18px]">
        <SgRad navn="Off the tee" verdi={runde.sgOtt} />
        <SgRad navn="Approach" verdi={runde.sgApp} />
        <SgRad navn="Around green" verdi={runde.sgArg} />
        <SgRad navn="Putting" verdi={runde.sgPutt} />
      </div>

      {/* Knapperad */}
      <div className="mt-4 flex max-w-[520px] gap-2.5">
        <Link
          href="/portal/analysere"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-primary px-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary transition-colors hover:bg-primary/5"
        >
          Se SG-trend
        </Link>
        <Link
          href="/portal/coach/melding"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-primary px-4 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Del med coach
        </Link>
      </div>
    </div>
  );
}
