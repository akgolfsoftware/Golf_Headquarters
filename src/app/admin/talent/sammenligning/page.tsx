/**
 * /admin/talent/sammenligning — B10 Multi-spiller sammenligning.
 * Pixel-port av public/design-handover/agencyos/components-multi-compare.html.
 *
 * Tre nivåer på ekte Prisma-data:
 *   1. Side-om-side — 2-4 spillere (?ids=id1,id2,...), SG-kategorier +
 *      pyramide-fordeling + siste test, med best-badge per metrikk.
 *   2. Kohort-rangering — alle PLAYER på siste SG-total mot null-linjen.
 *   3. Region-fordeling — spillere gruppert på region / hjemmeklubb.
 *
 * Server Component. Roller: COACH, ADMIN.
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { MultiCompare } from "@/components/admin/multi-compare/multi-compare";
import { loadMultiCompare } from "@/lib/admin-compare/multi-compare-data";

export const dynamic = "force-dynamic";

type Search = Promise<{ ids?: string }>;

export default async function TalentSammenligning({ searchParams }: { searchParams: Search }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const ids = (sp.ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const data = await loadMultiCompare(ids);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Talent · B10 Sammenligning"
        titleItalic="Side om side"
        titleTrail={data.players.length >= 2 ? `· ${data.players.length} spillere` : "· kohort & region"}
        sub="Tre nivåer: 2–4 spillere parallelt, hele stallen rangert på SG, og geografisk fordeling. Referanse er PGA Tour-baseline."
        actions={
          <Link
            href="/admin/talent"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            Tilbake
          </Link>
        }
      />

      <MultiCompare data={data} />
    </div>
  );
}
