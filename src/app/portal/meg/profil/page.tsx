/**
 * PlayerHQ · Meg · Rediger profil (/portal/meg/profil) — portet FRA fersk
 * Claude Design-fasit: ph-screens.jsx (ProfilScreen) via MeSub-skallet.
 *
 * Avatar 72px + «Bytt bilde» (ekte opplasting via lib/storage/avatar) →
 * skjema-grid (1 kol mobil / 2 kol md) → «Lagre endringer» + «Avbryt».
 * EKTE Prisma-data: navn/e-post/telefon/hcp/hjemmeklubb fra User, gruppe via
 * GroupMember-relasjonen (coach-styrt, read-only). Dominant hånd finnes ikke
 * i Prisma User — vises som tomt placeholder-felt (lagres ikke).
 *
 * Server component. Auth-guard via requirePortalUser. Lagring gjenbruker
 * oppdaterProfil-server-action (../actions.ts).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MeSub } from "@/components/portal/meg/meg-sub";
import { ProfilRedigerForm } from "./profil-rediger-form";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await requirePortalUser();

  // Gruppe er en relasjon (GroupMember → Group), ikke et User-felt.
  const medlemskap = await prisma.groupMember.findFirst({
    where: { userId: user.id },
    orderBy: { joinedAt: "asc" },
    select: { group: { select: { name: true } } },
  });

  return (
    <MeSub
      eyebrow="MEG · PROFIL"
      title="Rediger"
      italic="profil."
      lead="Dette ser coachen din og vises på topplister."
    >
      <ProfilRedigerForm
        initial={{
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          hcp: user.hcp,
          homeClub: user.homeClub ?? "",
          gruppe: medlemskap?.group.name ?? "",
          avatarUrl: user.avatarUrl,
        }}
      />
    </MeSub>
  );
}
