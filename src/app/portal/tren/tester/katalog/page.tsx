/**
 * PlayerHQ · Trening · Tester · Katalog
 *
 * Database-drevet test-katalog med filter-pills:
 *   Alle / Standard / Mine / Coach-godkjent / Akademi
 *
 * Brukes for å finne en spesifikk test å ta, eller å se sine egne
 * custom-tester. Selve dashboardet på /portal/tren/tester forblir
 * den pixel-perfekte HTML-porten.
 */
import Link from "next/link";
import { ChevronLeft, Plus, Sparkles } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { TestKatalogFilter } from "./filter";

export const dynamic = "force-dynamic";

type FilterValg = "alle" | "standard" | "mine" | "coach-godkjent" | "akademi";

const GYLDIGE_FILTRE: FilterValg[] = [
  "alle",
  "standard",
  "mine",
  "coach-godkjent",
  "akademi",
];

function parseFilter(verdi: string | string[] | undefined): FilterValg {
  if (typeof verdi !== "string") return "alle";
  return GYLDIGE_FILTRE.includes(verdi as FilterValg)
    ? (verdi as FilterValg)
    : "alle";
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const params = await searchParams;
  const filter = parseFilter(params.filter);

  type Where = NonNullable<
    Parameters<typeof prisma.testDefinition.findMany>[0]
  >["where"];
  let where: Where = {};
  if (filter === "standard") {
    where = { isCustom: false };
  } else if (filter === "mine") {
    where = { createdById: user.id, isCustom: true };
  } else if (filter === "coach-godkjent") {
    where = { isCustom: true, isCoachApproved: true };
  } else if (filter === "akademi") {
    where = { isCustom: true, visibility: "ACADEMY" };
  } else {
    // "alle" — vis standard + alt brukeren kan se
    where = {
      OR: [
        { isCustom: false },
        { createdById: user.id },
        { isCustom: true, visibility: "ACADEMY" },
        { isCustom: true, isCoachApproved: true },
      ],
    };
  }

  const tester = await prisma.testDefinition.findMany({
    where,
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      pyramidArea: true,
      isCustom: true,
      isCoachApproved: true,
      visibility: true,
      createdById: true,
      createdBy: { select: { name: true } },
    },
  });

  function kategoriBadge(t: (typeof tester)[number]):
    | { label: string; klasse: string }
    | null {
    if (!t.isCustom) {
      return {
        label: "Standard",
        klasse: "bg-muted text-muted-foreground border-border",
      };
    }
    if (t.isCoachApproved) {
      return {
        label: "Coach-godkjent",
        klasse: "bg-primary/10 text-primary border-primary/30",
      };
    }
    if (t.visibility === "ACADEMY") {
      return {
        label: "Akademi",
        klasse: "bg-accent/20 text-accent-foreground border-accent/40",
      };
    }
    if (t.createdById === user.id) {
      return {
        label: "Egen",
        klasse: "bg-secondary text-secondary-foreground border-border",
      };
    }
    return null;
  }

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
      <div>
        <Link
          href="/portal/tren/tester"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={12} strokeWidth={1.75} /> Tilbake til tester
        </Link>
      </div>

      <PageHeader
        eyebrow="PlayerHQ · /portal/tren/tester/katalog"
        titleLead="Test"
        titleItalic="katalog"
        sub="Filtrer tester etter eierskap og synlighet."
        actions={
          <Link
            href="/portal/tren/tester/ny/egen"
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={14} strokeWidth={1.75} />
            Egen test
          </Link>
        }
      />

      <TestKatalogFilter aktiv={filter} />

      {tester.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Sparkles
            size={20}
            strokeWidth={1.5}
            className="mx-auto mb-2 text-muted-foreground"
          />
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Ingen tester her enda
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {filter === "mine"
              ? "Du har ikke laget egne tester. Trykk «Egen test» for å lage din første."
              : "Ingen tester matcher filteret. Bytt filter eller lag en egen."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tester.map((t) => {
            const badge = kategoriBadge(t);
            return (
              <li key={t.id}>
                <Link
                  href={`/portal/tren/tester/${t.id}`}
                  className="block h-full rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold leading-tight tracking-tight">
                      {t.name}
                    </h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.10em] text-secondary-foreground">
                      {t.pyramidArea}
                    </span>
                  </div>
                  {t.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                    {badge ? (
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${badge.klasse}`}
                      >
                        {badge.label}
                      </span>
                    ) : (
                      <span />
                    )}
                    {t.isCustom && t.createdBy?.name && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        av {t.createdBy.name.split(" ")[0]}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
