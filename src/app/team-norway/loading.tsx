import { TnLaster, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Lastetilstand for Team Norway. Ren server-markup uten klientavhengighet. */
export default function TeamNorwayLoading() {
  return (
    <TnSkallSkjelett>
      <TnLaster tekst="Henter Team Norway …" />
    </TnSkallSkjelett>
  );
}
