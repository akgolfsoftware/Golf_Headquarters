import { AdminLaster } from "@/app/team-wang/_components/wang-admin-logginn/admin-ui";
import { WangSide, WangSkjelett } from "@/components/wang/trener/wang-ui";

/** Lastetilstand for Administrasjon (WANG-24 · Laster): skjelett med listeform, ingen spinner. */
export default function WangAdminLaster() {
  return (
    <WangSide>
      <div aria-hidden="true" style={{ display: "grid", gap: 8 }}>
        <WangSkjelett hoyde={12} bredde={180} />
        <WangSkjelett hoyde={40} bredde="min(420px, 100%)" />
      </div>
      <AdminLaster tekst="Henter administrasjon" />
    </WangSide>
  );
}
