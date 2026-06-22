/**
 * PlayerHQ Coach SG-hub (/portal/coach/sg-hub) — hybrid-design 2026-06-17.
 *
 * Spiller-siden av coach SG-sammenligning:
 *   1. "SG per kategori" H2H — 4 kategorier med bilateral progress-bar
 *   2. Insight-kort: "Hva du jobber mot" (lime left-border)
 *   3. Inngangspunkter til Utstyr og Per-kølle i SG-hub
 *
 * Data: siste BrukerSgInput per spiller.
 * Coachens referanseverdier er statiske til coach-profil har egne data.
 */

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

// Coach-referanseverdier — statisk til coach har BrukerSgInput-data
const COACH_SG = { ott: 0.8, app: 0.9, arg: 0.2, putt: 0.6 } as const;

type SgKey = keyof typeof COACH_SG;

const SG_KATEGORIER: { key: SgKey; label: string }[] = [
  { key: "ott",  label: "OTT"  },
  { key: "app",  label: "APP"  },
  { key: "arg",  label: "ARG"  },
  { key: "putt", label: "PUTT" },
];

function fillPct(sg: number): number {
  return Math.min(48, Math.abs(sg) * 25);
}

export default async function CoachSgHubPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Siste SG-input for spilleren
  const sgInput = await prisma.brukerSgInput.findFirst({
    where: { userId: user.id },
    orderBy: { dato: "desc" },
  });

  const spillerSG = {
    ott:  sgInput?.sgOtt  ?? 0,
    app:  sgInput?.sgApp  ?? 0,
    arg:  sgInput?.sgArg  ?? 0,
    putt: sgInput?.sgPutt ?? 0,
  };

  const ingenData = !sgInput;

  // Coach-profil
  const coach = await prisma.user.findFirst({
    where: { role: "COACH" },
    select: { id: true, name: true },
  });
  const coachNavn  = coach?.name ?? "Anders Kristiansen";
  const coachFirst = coachNavn.split(" ")[0];
  const coachLast  = coachNavn.split(" ").slice(1).join(" ");

  // Finn kategorien med størst gap
  let storsteGap = SG_KATEGORIER[0];
  let storsteGapVerdi = 0;
  for (const cat of SG_KATEGORIER) {
    const gap = COACH_SG[cat.key] - spillerSG[cat.key];
    if (gap > storsteGapVerdi) { storsteGapVerdi = gap; storsteGap = cat; }
  }

  return (
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[860px] md:pb-8">

      {/* Tilbake */}
      <div className="mb-3 px-4 md:px-0">
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
      </div>

      {/* Header */}
      <div className="mb-4 px-4 md:px-0">
        <div className="mb-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Sammenlign med coach
        </div>
        <h1 className="font-display text-[22px] font-bold leading-[1.04] tracking-[-0.03em] text-foreground">
          {coachFirst}
          <em className="font-medium italic text-primary"> {coachLast}</em>
        </h1>
        <div className="mt-1 text-[13px] text-muted-foreground">
          Head Coach &middot; SG-data til inspirasjon
        </div>
      </div>

      <div className="space-y-3 px-3 md:px-0">

        {/* H2H — SG per kategori */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-[14px] font-bold text-foreground">
              SG per kategori
            </span>
            <div className="flex gap-3 font-mono text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-[3px] w-2.5 rounded-[1px] bg-primary"
                />
                {user.name.split(" ")[0]}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-[3px] w-2.5 rounded-[1px] opacity-50"
                  style={{ background: "#7BA428" }}
                />
                {coachFirst}
              </span>
            </div>
          </div>

          {ingenData ? (
            <p className="py-2 text-[13px] text-muted-foreground">
              Ingen SG-data ennå. Logg runder for å se sammenligningen mot coach.
            </p>
          ) : (
            <div className="space-y-2.5">
              {SG_KATEGORIER.map(({ key, label }) => {
                const mine    = spillerSG[key];
                const cSg     = COACH_SG[key];
                const minePos  = mine >= 0;
                const coachPos = cSg >= 0;
                const minePct  = fillPct(mine);
                const coachPct = fillPct(cSg);
                const valColor = minePos ? "#1A7D56" : "#A32D2D";

                return (
                  <div
                    key={key}
                    className="grid grid-cols-[44px_1fr_44px] items-center gap-2.5"
                  >
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                      {label}
                    </span>

                    <div
                      className="relative h-3 overflow-hidden rounded-full border border-border bg-secondary"
                    >
                      <span
                        className="absolute inset-y-0 z-10 w-px opacity-35"
                        style={{ left: "50%", background: "#5E5C57" }}
                        aria-hidden
                      />
                      {/* Coach ghost */}
                      <span
                        className="absolute bottom-1 top-1 rounded-full opacity-40"
                        style={{
                          background: "#7BA428",
                          ...(coachPos
                            ? { left: "50%", width: `${coachPct}%` }
                            : { right: "50%", width: `${coachPct}%` }),
                        }}
                        aria-hidden
                      />
                      {/* Player fill */}
                      <span
                        className="absolute bottom-1 top-1 rounded-full"
                        style={{
                          ...(minePos
                            ? {
                                left: "50%",
                                width: `${minePct}%`,
                                background: "linear-gradient(90deg,var(--forest),#1A7D56)",
                              }
                            : {
                                right: "50%",
                                width: `${minePct}%`,
                                background: "linear-gradient(90deg,#d98f8f,#A32D2D)",
                              }),
                        }}
                      />
                    </div>

                    <span
                      className="text-right font-mono text-[11px] font-semibold tabular-nums"
                      style={{ color: valColor }}
                    >
                      {mine >= 0 ? "+" : ""}
                      {mine.toFixed(1).replace(".", ",")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insight — lime left-border */}
        {!ingenData && storsteGapVerdi > 0 && (
          <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 shadow-sm">
            <div className="mb-1.5 font-display text-[13px] font-bold text-foreground">
              Hva du jobber mot
            </div>
            <p className="text-[13px] leading-[1.55] text-foreground">
              {coachFirst} er{" "}
              <em className="font-medium italic text-primary">
                +{storsteGapVerdi.toFixed(1)} SG {storsteGap.label}
              </em>{" "}
              over deg. Det er her den st&oslash;rste gevinsten finnes &mdash; fokusert arbeid i 6&ndash;8 uker kan lukke gapet.
            </p>
          </div>
        )}

        {/* Utstyr-link */}
        <Link
          href="/portal/mal/sg-hub/equipment"
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <div className="font-display text-[14px] font-bold text-foreground">
              Utstyr
              <em className="font-medium italic text-primary">-gap</em>
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">
              Din bag vs {coachFirst} Kristiansen
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </Link>

        {/* Per-k&oslash;lle-link */}
        <Link
          href="/portal/mal/sg-hub"
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <div className="font-display text-[14px] font-bold text-foreground">
              Coach
              <em className="font-medium italic text-primary"> per k&oslash;lle</em>
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted-foreground">
              Per-k&oslash;lle carry, fart og launch
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        </Link>

      </div>
    </div>
  );
}
