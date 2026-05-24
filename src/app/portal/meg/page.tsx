/**
 * /portal/meg — PlayerHQ Meg hub
 * Design: docs/design-handoff/2026-05-24-hubs/project/manglende-hubs/hubs-player.jsx (PlayerMeg)
 */

import {
  Briefcase,
  CalendarCheck,
  CreditCard,
  FileText,
  HeartPulse,
  HelpCircle,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubCard,
  HubPill,
  BagStrip,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function MegPage() {
  await requirePortalUser();

  return (
    <HubFrame>
      <HubHeader
        eyebrow="PLAYERHQ · MIN PROFIL"
        title="Hei,"
        titleItalic="Anders."
        sub="Bilde, navn og kontaktinfo — samt alt du eier i appen."
        actions={
          <button className="hub-btn btn-outline" type="button">
            <User size={13} strokeWidth={1.75} aria-hidden /> Rediger raskt
          </button>
        }
      />

      <section className="meg-hero">
        <div className="meg-av-wrap">
          <div className="meg-av">AK</div>
          <div className="meg-av-tier">A1</div>
        </div>
        <div className="meg-info">
          <div className="meg-name-row">
            <h2>Anders Kristiansen</h2>
            <span className="pill-tier-pro">PRO</span>
          </div>
          <div className="meg-contact">
            <span className="mc-row">
              <span className="mc-lbl">E-POST</span>
              <span>anders@akgolf.no</span>
            </span>
            <span className="mc-row">
              <span className="mc-lbl">TELEFON</span>
              <span>+47 481 22 184</span>
            </span>
            <span className="mc-row">
              <span className="mc-lbl">KLUBB</span>
              <span>Gamle Fredrikstad GK</span>
            </span>
            <span className="mc-row">
              <span className="mc-lbl">HCP</span>
              <span>-- · Pro</span>
            </span>
          </div>
        </div>
        <div className="meg-side">
          <span className="ms-lbl">NESTE FAKTURA</span>
          <span className="ms-val">kr 300</span>
          <span className="ms-sub">15. juni · PRO-abonnement</span>
        </div>
      </section>

      <section className="hub-grid">
        <HubCard
          href="/portal/meg/profil/rediger"
          icon={User}
          eyebrow="01 · IDENTITET"
          title="Profil"
          data="Bilde + navn"
          sub="Synlig for coach og foreldre"
          cta="Rediger →"
        />
        <HubCard
          href="/portal/meg/innstillinger"
          icon={Settings}
          eyebrow="02 · PREFERANSER"
          title="Innstillinger"
          data="Personvern, varsler, språk"
          sub="+5 andre seksjoner"
          cta="Åpne →"
        />
        <HubCard
          href="/portal/meg/sikkerhet"
          icon={Shield}
          eyebrow="03 · KONTO"
          title="Sikkerhet"
          data="2FA aktivert"
          sub="Sist innlogget i dag · 08:14 fra iPhone"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              2FA
            </HubPill>
          }
          cta="Se logger →"
        />
        <HubCard
          href="/portal/meg/abonnement"
          icon={CreditCard}
          eyebrow="04 · BETALING"
          title="Abonnement"
          data="PRO · 300 kr / mnd"
          sub="Neste faktura 15. juni · Visa ••5114"
          statusPill={<HubPill kind="forest">PRO</HubPill>}
          cta="Administrer →"
        />
        <HubCard
          href="/portal/meg/bookinger"
          icon={CalendarCheck}
          eyebrow="05 · TIMER"
          title="Bookinger"
          data="1 kommende"
          sub="Markus R.P. · 28. mai · 4 historikk"
          cta="Se →"
        />
        <HubCard
          href="/portal/meg/helse"
          icon={HeartPulse}
          eyebrow="06 · KROPP"
          title="Helse"
          data="Siste logg 22. mai"
          sub="HR-hvile 52 · søvn 7t 14m · ingen skader"
          cta="Logg ny →"
        />
        <HubCard
          href="/portal/meg/utstyrsbag"
          icon={Briefcase}
          eyebrow="07 · UTSTYR"
          title="Utstyrsbag"
          data="14 køller registrert"
          sub="Driver Stealth 2 · 7-iron P790 · TM2024 setup"
          visual={
            <BagStrip
              clubs={["D", "3w", "5w", "4i", "5i", "6i", "7i", "8i", "9i", "PW", "GW", "SW", "LW", "P"]}
            />
          }
          cta="Åpne bag →"
        />
        <HubCard
          href="/portal/meg/dokumenter"
          icon={FileText}
          eyebrow="08 · ARKIV"
          title="Dokumenter"
          data="3 dokumenter"
          sub="Kontrakt 2026 · Forsikring · Reise-DOK"
          cta="Se arkiv →"
        />
        <HubCard
          href="/portal/meg/help"
          icon={HelpCircle}
          eyebrow="09 · HJELP"
          title="Hjelp"
          data="Søk hjelp"
          sub="47 artikler · chat med AK-support"
          cta="Åpne →"
        />
      </section>
    </HubFrame>
  );
}
