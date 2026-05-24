/**
 * /admin/settings — CoachHQ Innstillinger (sub-hub for Admin-seksjonen)
 *
 * Fjernet bruk av forbudt CoachhqStubsShell (memory-regel: ALDRI "AK GOLF"-tekst).
 * Bruker HubFrame-pattern fra Manglende hubs hand-off.
 */

import {
  Calendar,
  Key,
  Lock,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { HubFrame, HubHeader, HubStatSep, HubCard, HubPill } from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <HubFrame>
      <HubHeader
        eyebrow="COACHHQ · ADMIN"
        title="Innstillinger"
        sub="Sikkerhet, API-nøkler, kalender-sync og tilgangsstyring."
        stats={
          <>
            <span>
              <strong>Sist endret</strong> 22. mai
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>2FA aktivert</strong>
            </span>
            <HubStatSep />
            <span>
              <strong>4</strong> aktive API-nøkler
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/settings/security"
          icon={Lock}
          eyebrow="01 · KONTO"
          title="Sikkerhet"
          data="2FA aktivert"
          sub="Passord sist endret 14. mai · 4 aktive sesjoner"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              SIKRET
            </HubPill>
          }
          cta="Administrer →"
        />
        <HubCard
          href="/admin/settings/api"
          icon={Key}
          eyebrow="02 · INTEGRASJON"
          title="API-nøkler"
          data="4 aktive nøkler"
          sub="Stripe · Resend · DataGolf · Notion"
          cta="Se nøkler →"
        />
        <HubCard
          href="/admin/settings/calendar"
          icon={Calendar}
          eyebrow="03 · KALENDER"
          title="Kalender-sync"
          data="Google Calendar tilkoblet"
          sub="2-veis sync · sist sync 11:42"
          statusPill={
            <HubPill kind="ok" dot="d-pulse">
              SYNC OK
            </HubPill>
          }
          cta="Konfigurer →"
        />
        <HubCard
          href="/admin/settings/tilgang"
          icon={ShieldCheck}
          eyebrow="04 · TILGANG"
          title="Tilgangsstyring"
          data="4 coacher · 2 admin"
          sub="Sist endret tilgang 19. mai"
          cta="Administrer →"
        />
        <HubCard
          href="/admin/klubb/innstillinger"
          icon={SettingsIcon}
          eyebrow="05 · KLUBB"
          title="Klubb-info"
          data="Gamle Fredrikstad GK"
          sub="Org.nr · adresse · åpningstider"
          cta="Rediger →"
        />
      </section>
    </HubFrame>
  );
}
