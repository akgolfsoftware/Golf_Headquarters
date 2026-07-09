/**
 * AgencyOS — Plan-maler (/admin/plan-templates).
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → PlanTemplatesScreen (mørkt
 * tema, desktop 1280): PageHead («PLANLEGGE · PLAN-MALER» / «{N} maler.» /
 * lead + «Ny mal») og 3-kolonners grid av mal-tiles (ikon + navn +
 * «Brukt N×» + fase/varighet). Klikk på tile → mal-detalj.
 *
 * Datakilde: prisma.planTemplate m/ usageCount og økt-antall (_count).
 * Ikon velges deterministisk fra malens L-fase (Grunn/Spesial/Turnering).
 * Ruta var tidligere redirect til /admin/plans/templates — nå kanonisk
 * skjerm (redirecten i next.config.ts er fjernet i samme endring).
 */

import Link from "next/link";
import { Plus, Sprout, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
import type { LPhase } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const TALLORD = [
  "Null",
  "Én",
  "To",
  "Tre",
  "Fire",
  "Fem",
  "Seks",
  "Sju",
  "Åtte",
  "Ni",
  "Ti",
  "Elleve",
  "Tolv",
];

const FASE_IKON: Record<LPhase, LucideIcon> = {
  GRUNN: Sprout,
  SPESIAL: Target,
  TURNERING: Trophy,
};

const FASE_LABEL: Record<LPhase, string> = {
  GRUNN: "grunnfase",
  SPESIAL: "spesialfase",
  TURNERING: "turneringsfase",
};

export default async function PlanMalerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const maler = await prisma.planTemplate.findMany({
    orderBy: [{ usageCount: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      kategori: true,
      lPhase: true,
      varighetUker: true,
      usageCount: true,
      _count: { select: { sessions: true } },
    },
  });

  const antall = maler.length;
  const tittel = antall < TALLORD.length ? TALLORD[antall] : String(antall);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Planlegge · Plan-maler"
        title={tittel}
        italic="maler."
        lead="Gjenbrukbare plan-skjeletter. Velg en mal når du lager ny plan for å spare tid."
        actions={
          <Link href="/admin/plan-templates/ny" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny mal
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {antall === 0 && (
          <div className="rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground lg:col-span-3">
            Ingen maler ennå — opprett den første.
          </div>
        )}
        {maler.map((m) => {
          const Ikon = FASE_IKON[m.lPhase];
          return (
            <Link
              key={m.id}
              href={`/admin/plan-templates/${m.id}`}
              className="flex flex-col gap-[10px] rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary"
            >
              <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-secondary text-primary">
                <Ikon size={20} strokeWidth={1.5} />
              </span>
              <span className="font-display text-base font-bold leading-[1.2] tracking-[-0.015em] text-foreground">
                {m.name}
              </span>
              <span className="mt-auto font-mono text-[10px] leading-none text-muted-foreground">
                <b className="font-bold text-primary">Brukt {m.usageCount}×</b>{" "}
                Kat. {m.kategori} · {m.varighetUker} uker · {FASE_LABEL[m.lPhase]}
              </span>
            </Link>
          );
        })}
      </div>
    </AgPage>
  );
}
