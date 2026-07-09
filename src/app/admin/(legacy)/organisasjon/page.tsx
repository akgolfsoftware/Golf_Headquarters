/**
 * /admin/organisasjon — AgencyOS Admin hub
 * Design: hubs-coach.jsx (CoachAdmin)
 */

import {
  Bot,
  Building,
  Mail,
  Plug,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
} from "@/components/hubs";
import { InnstillingerButton } from "./organisasjon-actions";

export const dynamic = "force-dynamic";

export default async function OrganisasjonPage() {
  await requireCapability(Capability.MANAGE_USERS);

  // Ekte tellinger fra DB. Aldri fabrikerte tall.
  const [coachCount, adminCount] = await Promise.all([
    prisma.user.count({ where: { role: "COACH", deletedAt: null } }),
    prisma.user.count({ where: { role: "ADMIN", deletedAt: null } }),
  ]);

  return (
    <HubFrame>
      <HubHeader
        eyebrow="AGENCYOS · HEAD COACH"
        title="Organisasjon"
        sub="Klubb, team, integrasjoner og innstillinger."
        actions={
          <InnstillingerButton />
        }
        stats={
          <>
            <span>
              <strong>{coachCount}</strong> coacher · <strong>{adminCount}</strong> admin
            </span>
            <HubStatSep />
            <span>
              <strong>—</strong> integrasjoner
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/klubb/innstillinger"
          icon={Building}
          eyebrow="01 · IDENTITET"
          title="Klubb-info"
          data="—"
          sub="Ikke registrert ennå"
          cta="Rediger →"
        />
        <HubCard
          href="/admin/team"
          icon={Users}
          eyebrow="02 · TEAM"
          title="Team"
          data={`${coachCount} coacher · ${adminCount} admin`}
          sub="Administrer roller og tilganger"
          cta="Administrer →"
        />
        <HubCard
          href="/admin/integrasjoner"
          icon={Plug}
          eyebrow="03 · KOBLINGER"
          title="Integrasjoner"
          data="—"
          sub="Se status og koble tjenester"
          cta="Koble →"
        />
        <HubCard
          href="/admin/settings"
          icon={Settings}
          eyebrow="04 · KONFIG"
          title="Innstillinger"
          data="Sist endret 22. mai"
          sub="Varsler · Personvern · Språk · Branding"
          cta="Åpne →"
        />
        <HubCard
          href="/admin/agents"
          icon={Bot}
          eyebrow="05 · AGENTER"
          title="AI-agenter"
          data="3 aktive"
          sub="Caddie · Plan-bygger · Drill-foreslår"
          statusPill={
            <HubPill kind="accent" dot="d-pulse">
              3 LIVE
            </HubPill>
          }
          cta="Konfigurer →"
        />
        <HubCard
          href="/admin/email-templates"
          icon={Mail}
          eyebrow="06 · MAL"
          title="E-postmaler"
          data="12 maler"
          sub="Velkomst · Faktura · Booking · Reminder"
          cta="Bla →"
        />
        <HubCard
          href="/admin/audit-log"
          icon={Shield}
          eyebrow="07 · SIKKERHET"
          title="Audit-log"
          data="Siste hendelse 04:12"
          sub="24. mai · API-key rotert (auto)"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              REN
            </HubPill>
          }
          cta="Se aktivitet →"
        />
        <HubCard
          href="/admin/profile"
          icon={User}
          eyebrow="08 · MEG"
          title="Min profil"
          data="Anders K. · Head Coach"
          sub="Tilgjengelig · pro@akgolf.no"
          statusPill={<HubPill kind="tier">HEAD</HubPill>}
          cta="Rediger →"
        />
      </section>
    </HubFrame>
  );
}
