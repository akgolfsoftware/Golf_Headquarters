/** Prøvefil for turneringskoblingen fra Spiller 360 (AG-08 › Koble turneringsprofil). Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { SideHode } from "@/components/precision/pa-a4";
import { TurneringKoblingKlient, type KoblingKlientProps } from "@/app/admin/spillere/[id]/turnering-kobling/kobling-klient";
import { laster, feil } from "./_s360";

export const sti = "/admin/spillere/u1/turnering-kobling";
const forslag: KoblingKlientProps["initialForslag"] = [
  { id: "p1", name: "Eira Solvang", country: "NOR", tier: "amateur-no", birthYear: 2010, entriesCount: 12, alreadyLinkedTo: null },
  { id: "p2", name: "Eira Solvang Haraldsen-Nygård", country: "NOR", tier: "junior-no", birthYear: 2009, entriesCount: 3, alreadyLinkedTo: "Mathias Tveit" },
];
const S = (p: Partial<KoblingKlientProps>) => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Jonas Brekke"><div className="a8-side" style={{ maxWidth: 820 }}>
    <SideHode kicker="Stall · Spiller 360 · Turneringsprofil" title="Eira Solvang" sub="Koble denne PlayerHQ-kontoen til en person i turneringsbasen." />
    <TurneringKoblingKlient spillerId="u1" spillerNavn="Eira Solvang" current={null} initialForslag={forslag} {...p} />
  </div></AgencyOSSkall></AdminRolleProvider>
);
export const tilstander = {
  data: <S />,
  koblet: <S current={{ id: "p1", name: "Eira Solvang", tier: "amateur-no", country: "NOR", birthYear: 2010, entriesCount: 12 }} />,
  tom: <S initialForslag={[]} />,
  laster,
  feil,
};
