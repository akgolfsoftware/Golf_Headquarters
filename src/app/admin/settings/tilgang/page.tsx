/**
 * v2: AgencyOS Innstillinger → Tilgang & roller. Read-only CBAC-matrise —
 * viser hvilke capabilities hver rolle har i dag. Speiler den ekte
 * /admin/(legacy)/settings/tilgang-flaten, men i v2-språket (V2Shell +
 * v2-komponentbiblioteket). Ingen DB-kall: can() er en ren/synkron
 * funksjon som slår opp i en hardkodet rolle→capability-tabell.
 *
 * Lagring i DB krever større refaktor (per-org overrides) — V1 er read-only.
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Capability, can } from "@/lib/auth/cbac";
import type { UserRole } from "@/generated/prisma/client";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminTilgangV2,
  type AdminTilgangV2Row,
} from "@/components/admin/v2/AdminTilgangV2";

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

export default async function V2TilgangPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const capabilities = Object.values(Capability);

  const rader: AdminTilgangV2Row[] = capabilities.map((cap) => ({
    id: cap,
    beskrivelse: CAPABILITY_BESKRIVELSE[cap],
    tillatt: Object.fromEntries(
      ROLLER.map((rolle) => [rolle, can(rolle, cap)]),
    ) as Record<UserRole, boolean>,
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV}>
      <TilbakeLenke href="/admin/settings">Innstillinger</TilbakeLenke>
      <AdminTilgangV2 roller={ROLLER} rader={rader} />
    </V2Shell>
  );
}
