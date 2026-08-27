/**
 * v2: AgencyOS Innstillinger → Tilgang & roller.
 *
 * To faner (G6, 2026-08-16):
 *  - «Roller» — CBAC-matrisen (read-only): rolle-defaults fra can().
 *  - «Per trener» — ADMIN velger coach og toggler capabilities; effektiv
 *    tilstand = rolle-default ± GRANT/REVOKE-override (user_capabilities).
 *
 * Server component. Beskrivelsene bor i cbac.ts (CAPABILITY_BESKRIVELSER)
 * så matrisen, per-trener-fanen og inviter-flaten deler samme tekst.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  Capability,
  CAPABILITY_BESKRIVELSER,
  ROLE_CAPABILITIES,
  can,
} from "@/lib/auth/cbac";
import { beregnEffektive } from "@/lib/auth/effective-capabilities-core";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import {
  AdminTilgangTrainLock,
  type AdminTilgangV2Row,
} from "@/components/admin/v2/oppsett/AdminTilgangTrainLock";
import {
  AdminTilgangPerTrenerTrainLock,
  type PerTrenerCoach,
} from "@/components/admin/v2/oppsett/AdminTilgangPerTrenerTrainLock";

export const dynamic = "force-dynamic";

const ROLLER: UserRole[] = ["ADMIN", "COACH", "PLAYER", "PARENT", "GUEST"];

export default async function V2TilgangPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  await requirePortalUser({ allow: ["ADMIN"] });
  const { fane } = await searchParams;
  const perTrener = fane === "per-trener";

  const capabilities = Object.values(Capability);

  const faneStil = (aktiv: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    height: 36,
    padding: "0 16px",
    borderRadius: TL.radius.pill,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    background: aktiv ? TL.dim : "transparent",
    color: aktiv ? TL.text : TL.mute,
  });

  const faneVelger = (
    <div style={{ display: "flex", gap: 6 }}>
      <Link href="/admin/settings/tilgang" style={faneStil(!perTrener)}>
        Roller
      </Link>
      <Link href="/admin/settings/tilgang?fane=per-trener" style={faneStil(perTrener)}>
        Per trener
      </Link>
    </div>
  );

  if (!perTrener) {
    const rader: AdminTilgangV2Row[] = capabilities.map((cap) => ({
      id: cap,
      beskrivelse: CAPABILITY_BESKRIVELSER[cap],
      tillatt: Object.fromEntries(
        ROLLER.map((rolle) => [rolle, can(rolle, cap)]),
      ) as Record<UserRole, boolean>,
    }));

    return (
      <V2Shell bredde="kolonne" nav={AGENCYOS_NAV}>
        <TlTilbake href="/admin/settings">Innstillinger</TlTilbake>
        {faneVelger}
        <AdminTilgangTrainLock roller={ROLLER} rader={rader} />
      </V2Shell>
    );
  }

  // «Per trener»: coaches + deres overrides → effektiv tilstand per capability.
  const coaches = await prisma.user.findMany({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  const overrides = await prisma.userCapability.findMany({
    where: { userId: { in: coaches.map((c) => c.id) } },
    select: { userId: true, capability: true, mode: true },
  });

  const trenere: PerTrenerCoach[] = coaches.map((coach) => {
    const egne = overrides.filter((o) => o.userId === coach.id);
    const effektive = beregnEffektive(ROLE_CAPABILITIES.COACH, egne);
    return {
      id: coach.id,
      navn: coach.name,
      epost: coach.email,
      rader: capabilities.map((cap) => {
        const override = egne.find((o) => o.capability === cap);
        return {
          capability: cap,
          beskrivelse: CAPABILITY_BESKRIVELSER[cap],
          standard: can("COACH", cap),
          override:
            override?.mode === "GRANT" || override?.mode === "REVOKE"
              ? override.mode
              : null,
          effektiv: effektive.has(cap),
        };
      }),
    };
  });

  return (
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV}>
      <TlTilbake href="/admin/settings">Innstillinger</TlTilbake>
      {faneVelger}
      <AdminTilgangPerTrenerTrainLock trenere={trenere} />
    </V2Shell>
  );
}
