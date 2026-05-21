/**
 * /admin/plan-templates — Mal-bibliotek.
 *
 * Server-komponent som henter alle PlanTemplate fra DB, transformerer til
 * serialiserbare rader og sender til klient-komponenten LibraryView.
 */

import { Plus } from "lucide-react";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import {
  LibraryView,
  type TemplateRow,
} from "@/components/admin/plan-templates/library-view";
import { readFordeling } from "@/components/admin/plan-templates/shared";

export const dynamic = "force-dynamic";

export default async function PlanTemplatesPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const templates = await prisma.planTemplate.findMany({
    orderBy: [{ kategori: "asc" }, { lPhase: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { sessions: true } },
    },
  });

  // Heuristikk for "special": navn inneholder "special" eller "spesial" og er
  // ikke en av baseline-nivåene. Faller tilbake til kategori-fase-bucket.
  function detectSpecial(name: string): boolean {
    const n = name.toLowerCase();
    return n.includes("special") || n.includes("spesial-program");
  }

  const rows: TemplateRow[] = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    kategori: t.kategori,
    lPhase: t.lPhase,
    varighetUker: t.varighetUker,
    ukentligOktAntall: t.ukentligOktAntall,
    fordeling: readFordeling(t.disciplinFordeling),
    minAlder: t.minAlder,
    maxAlder: t.maxAlder,
    approved: t.approved,
    usageCount: t.usageCount,
    effectivenessAvg: t.effectivenessAvg,
    sessionCount: t._count.sessions,
    updatedAt: t.updatedAt.toISOString(),
    isSpecial: detectSpecial(t.name),
  }));

  const brukt = rows.filter((r) => r.usageCount > 0).length;
  const best = rows
    .filter((r) => r.effectivenessAvg != null)
    .sort((a, b) => (b.effectivenessAvg ?? 0) - (a.effectivenessAvg ?? 0))[0];

  const niveauer = new Set(rows.map((r) => r.kategori)).size;
  const faser = new Set(rows.map((r) => r.lPhase)).size;
  const specials = rows.filter((r) => r.isSpecial).length;

  const eyebrow = `MAL-BIBLIOTEK · ${rows.length} BASELINE · ${niveauer} NIVÅER × ${faser} FASER + ${specials} SPECIAL`;

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <PageHeader
        eyebrow={eyebrow}
        titleLead="Plan-"
        titleItalic="maler"
        sub="Anders sitt baseline-bibliotek for treningsplaner. Justeres av AI per spiller."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/plan-templates/ny"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Ny mal
            </Link>
          </div>
        }
      />

      <AgentStrip>
        Coach Anders, du har <strong>{rows.length} maler</strong>.{" "}
        <strong>{brukt}</strong> er brukt minst én gang.
        {best ? (
          <>
            {" "}
            Best presterende: <strong>&ldquo;{best.name}&rdquo;</strong> med{" "}
            {best.effectivenessAvg && best.effectivenessAvg >= 0 ? "+" : ""}
            {best.effectivenessAvg?.toFixed(1)} SG-Total snitt.
          </>
        ) : (
          <> Ingen effektivitets-data ennå — kjør planer for å bygge baseline.</>
        )}
      </AgentStrip>

      <LibraryView templates={rows} />
    </div>
  );
}
