/**
 * PlayerHQ · Tren · Årsplan · Rediger periode
 *
 * Migrert fra public/design/batch3/arsplan-periode-rediger.html.
 * Lar coach/spiller justere én periodeblokk: meta, fokus, intensitet, vedlegg.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { PeriodeRedigerForm } from "./form";

export default async function PeriodeRedigerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser();
  const { id } = await params;
  // Hardkodet demo-data — i produksjon hentes fra prisma.periodBlock.findUnique
  return (
    <div className="space-y-7 pb-32">
      <PageHeader
        eyebrow="PlayerHQ · Tren · Årsplan"
        titleLead="Rediger"
        titleItalic="periode"
        actions={
          <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Periode-ID <strong className="text-foreground">{id.slice(0, 12)}</strong>
          </span>
        }
      />
      <PeriodeRedigerForm periodeId={id} />
    </div>
  );
}
