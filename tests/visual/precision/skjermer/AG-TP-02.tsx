/** Prøvefil for AG-TP-02 Før og nå. Syntetiske data, oppdiktede navn. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AGTP02ForOgNaa, type ForOgNaaOppgave } from "@/components/admin/precision/AGTP02ForOgNaa";

export const sti = "/admin/spillere/u1/plan/plan1/for-og-na";
const oppgaver: ForOgNaaOppgave[] = [
  { id: "t1", p: "P4.0", posisjon: "Toppen av baksvingen", tittel: "Venstre arm strak på toppen", bildeUrl: "/icon-512-maskable.png", videoUrl: "https://eksempel.no/video" },
  { id: "t2", p: "P7.0", posisjon: "Treffpunktet", tittel: "Hendene foran ballen i treff med et langt oppgavenavn som brytes", bildeUrl: null, videoUrl: null },
];
const S = (p: { tilstand: "data" | "tom" | "laster" | "feil"; oppgaver?: ForOgNaaOppgave[] }) => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke">
    <AGTP02ForOgNaa tilstand={p.tilstand} spiller={{ id: "u1", navn: "Eira Solvang" }} planId="plan1" oppgaver={p.oppgaver ?? oppgaver} valgtId="t1" />
  </AgencyOSSkall></AdminRolleProvider>
);
export const tilstander = {
  data: <S tilstand="data" />,
  utenBilde: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><AGTP02ForOgNaa tilstand="data" spiller={{ id: "u1", navn: "Eira Solvang" }} planId="plan1" oppgaver={oppgaver} valgtId="t2" /></AgencyOSSkall></AdminRolleProvider>,
  tom: <S tilstand="tom" oppgaver={[]} />,
  laster: <S tilstand="laster" />,
  feil: <S tilstand="feil" />,
};
