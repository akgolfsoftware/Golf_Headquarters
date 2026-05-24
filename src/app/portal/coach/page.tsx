/**
 * /portal/coach — PlayerHQ Coach hub
 * Design: matches HubFrame-pattern fra Manglende hubs.html
 * Innhold per plan Del 3
 */

import {
  Dumbbell,
  FileText,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  User,
  Video,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function CoachHubPage() {
  await requirePortalUser();

  return (
    <HubFrame>
      <HubHeader
        eyebrow="PLAYERHQ · COACH"
        title="Din"
        titleItalic="coach"
        sub="Meldinger, notater, planer og videoer fra coachen din."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <MessageSquare size={13} strokeWidth={1.75} aria-hidden /> Meldinger
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Plus size={13} strokeWidth={2} aria-hidden /> Ny melding
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>Markus R.P.</strong> · hovedcoach
            </span>
            <HubStatSep />
            <span>
              <strong>2</strong> uleste meldinger
            </span>
            <HubStatSep />
            <span>
              <strong>4</strong> aktive planer
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>Online</strong>
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/portal/coach/melding"
          icon={MessageSquare}
          eyebrow="01 · DIALOG"
          title="Meldinger"
          data="2 uleste"
          sub="Markus · i går 17:48 — 'Bra runde, fokus på...'"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              2 NYE
            </HubPill>
          }
          cta="Åpne tråd →"
        />
        <HubCard
          href="/portal/coach/notes"
          icon={FileText}
          eyebrow="02 · OBSERVASJONER"
          title="Notater"
          data="12 notater"
          sub="Siste: 22. mai · Putt-rutine + grip"
          cta="Bla →"
        />
        <HubCard
          href="/portal/coach/plans"
          icon={FileText}
          eyebrow="03 · PROGRAM"
          title="Planer"
          data="4 aktive planer"
          sub="Spesialisering · Putt-fokus · Driver · Wedge"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              4 PUBLISERT
            </HubPill>
          }
          cta="Se planer →"
        />
        <HubCard
          href="/portal/coach/ovelser"
          icon={Dumbbell}
          eyebrow="04 · TILDELT"
          title="Øvelser"
          data="18 tildelt"
          sub="9 gjennomført · 4 i dag · 5 kommende"
          cta="Åpne →"
        />
        <HubCard
          href="/portal/coach/videoer"
          icon={Video}
          eyebrow="05 · INSTRUKSJON"
          title="Videoer"
          data="23 i biblioteket"
          sub="3 nye denne uka · merket favoritt: 7"
          statusPill={<HubPill kind="accent">+3 NYE</HubPill>}
          cta="Bla →"
        />
        <HubCard
          href="/portal/coach/ai"
          icon={Sparkles}
          eyebrow="06 · AI-CADDIE"
          title="AI-assistanse"
          data="Spør Caddie"
          sub="Lokal coaching-AI · Trent på din profil"
          tone="accent"
          cta="Start samtale →"
        />
        <HubCard
          href="/portal/coach"
          icon={User}
          eyebrow="07 · PROFIL"
          title="Min coach"
          data="Markus R.P."
          sub="Coach siden jan 2025 · GFGK · PGA-sertifisert"
          cta="Se profil →"
        />
        <HubCard
          href="/portal/onskeligokt"
          icon={Send}
          eyebrow="08 · ØNSKE"
          title="Be om økt"
          data="Send forespørsel"
          sub="Markus svarer typisk innen 4 timer"
          cta="Skriv ønske →"
        />
      </section>
    </HubFrame>
  );
}
