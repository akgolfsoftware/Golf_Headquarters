import type { ReactNode } from "react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { WangAppSkall } from "@/components/wang/WangAppSkall";
import { TnShell } from "@/components/team-norway/tn-shell";
import { WangBrandFrame } from "@/components/precision/brand/WangBrandFrame";
import { TnBrandFrame } from "@/components/precision/brand/TnBrandFrame";
import "@/styles/precision-grupper.css";

/** Kun presentasjon. Sidens eksisterende serverport avgjør all tilgang. */
export function GroupContextShell({ group, user, children }: {
  group: { id: string; slug: string | null; program: string | null };
  user: { name: string | null; role: string };
  children: ReactNode;
}) {
  const trener = user.role === "ADMIN" || user.role === "COACH";
  const navn = user.name ?? "Bruker";
  const innhold = <div className="group-content">{children}</div>;
  if (group.slug === "team-norway") return <TnBrandFrame><TnShell aktiv="workbench" brukerNavn={navn}
    rolle={user.role === "ADMIN" ? "Administrator" : trener ? "Trener" : "Lesetilgang"}
    groupId={group.id} visTrenerflater={trener} kanAdministrere={user.role === "ADMIN"}>
    <div className="pa-root" data-org="team-norway">{innhold}</div>
  </TnShell></TnBrandFrame>;
  const wang = group.program === "WANG_TOPPIDRETT" || group.program === "WANG_UNG";
  if (wang && trener) return <WangBrandFrame>
    <WangAppSkall rolle={user.role === "ADMIN" ? "Sportssjef" : "Trener"} brukerNavn={navn} aktivtOmraade="trening">
      {innhold}
    </WangAppSkall>
  </WangBrandFrame>;
  if (!trener) return <PlayerHQSkall innboksHref="/portal/innboks" uleste={0}>{innhold}</PlayerHQSkall>;
  return <AgencyOSSkall navn={navn}>{innhold}</AgencyOSSkall>;
}
