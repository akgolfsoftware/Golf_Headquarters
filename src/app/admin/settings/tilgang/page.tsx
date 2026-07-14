/**
 * AgencyOS — Innstillinger · Tilgang (`/admin/settings/tilgang`), v2. Port
 * av `(legacy)/settings/tilgang/page.tsx` (2026-07-14, AgencyOS Bølge 3.34)
 * — samme read-only CBAC-matrise (`@/lib/auth/cbac`).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminInnstillingerTilgangV2, type TilgangRadV2 } from "@/components/admin/v2/AdminInnstillingerTilgangV2";
import { Capability, can } from "@/lib/auth/cbac";
import type { UserRole } from "@/generated/prisma/client";

const ROLLER: UserRole[] = ["ADMIN", "COACH", "PLAYER", "PARENT", "GUEST"];

const CAPABILITY_BESKRIVELSE: Record<Capability, string> = {
  [Capability.VIEW_OWN_PROFILE]: "Se egen profil",
  [Capability.EDIT_OWN_PROFILE]: "Endre egen profil",
  [Capability.VIEW_OWN_BOOKINGS]: "Se egne bookinger",
  [Capability.CREATE_BOOKING]: "Opprette booking",
  [Capability.VIEW_CHILDREN]: "Se egne barn (forelder)",
  [Capability.VIEW_ALL_PLAYERS]: "Se alle spillere",
  [Capability.EDIT_PLAYER_PLAN]: "Endre spiller-plan",
  [Capability.VIEW_FINANCE]: "Se økonomidata",
  [Capability.MANAGE_FACILITIES]: "Administrere fasiliteter",
  [Capability.MANAGE_USERS]: "Administrere brukere",
};

export default async function TilgangPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const rader: TilgangRadV2[] = Object.values(Capability).map((cap) => ({
    capability: cap,
    beskrivelse: CAPABILITY_BESKRIVELSE[cap],
    tillatt: Object.fromEntries(ROLLER.map((r) => [r, can(r, cap)])),
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminInnstillingerTilgangV2 roller={ROLLER} rader={rader} />
    </V2Shell>
  );
}
