import { hentWangGruppeOversikt } from "@/lib/gruppe-kalender";
import { WangGruppeOversikt } from "@/components/wang-kalender/wang-gruppe-oversikt";
import { EmptyState, PageHeader } from "@/components/wang";

export const revalidate = 300;

export default async function TeamWangPage() {
  const data = await hentWangGruppeOversikt();

  if (!data) {
    return (
      <EmptyState
        icon="calendar"
        title="Gruppeoversikten er ikke klar ennå"
        description="WANG Toppidrett Fredrikstad Golf er ikke satt opp i systemet. Kom tilbake senere."
        actionLabel={undefined}
        onAction={undefined}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="WANG Toppidrett Golf Fredrikstad"
        description="Komplett oversikt for elever og foreldre: årsplan, periodisering, treningsplan, samlinger og praktisk informasjon for hele gruppen. Ingen personlige spillerdata vises her."
        action={undefined}
        activeTab={undefined}
        onTabChange={undefined}
      />
      <WangGruppeOversikt data={data} />
    </div>
  );
}