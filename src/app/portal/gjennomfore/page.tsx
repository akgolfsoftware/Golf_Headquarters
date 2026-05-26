/**
 * /portal/gjennomfore — PlayerHQ Gjennomføre hub
 *
 * Pre-BETA empty-state: ingen mock-data, ingen hardkoda navn/tall.
 * Hero viser ekte bruker fra session. Alle HubCards bruker tone="empty"
 * inntil Live-økt/booking/TrackMan-integrasjonene er live i juni.
 */

import { Activity, Calendar, CalendarCheck, PlayCircle, Plus, Radio } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

function initials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function GjennomforePage() {
  const user = await requirePortalUser();
  const visningsnavn = user.name ?? "Spiller";
  const tier = (user.tier ?? "GRATIS") as "GRATIS" | "PRO" | "ELITE";

  return (
    <HubFrame>
      <HubHeader
        eyebrow="PLAYERHQ · PRO"
        title="Gjør"
        titleItalic="jobben"
        sub="Dagens program, kalender, live-økt og bookinger."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <Calendar size={13} strokeWidth={1.75} aria-hidden /> Kalender
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Plus size={13} strokeWidth={2} aria-hidden /> Ny økt
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>0</strong> økter i dag
            </span>
            <HubStatSep />
            <span>
              <strong>0</strong> denne uka
            </span>
            <HubStatSep />
            <span>
              <strong>0</strong> kommende bookinger
            </span>
          </>
        }
      />

      <section className="player-hero-card">
        <div className="phc-left">
          <div className="phc-av">{initials(user.name)}</div>
          <div>
            <div className="eyebrow">SPILLER · SESONG 2026</div>
            <h2>{visningsnavn}</h2>
            <div className="phc-meta">
              <span className="pill pill-tier">{tier}</span>
              <span className="phc-mono">
                HCP {user.hcp != null ? user.hcp.toFixed(1).replace(".", ",") : "—"}
              </span>
            </div>
          </div>
        </div>
        <div className="phc-right">
          <div className="phc-stat">
            <span className="phc-lbl">I DAG</span>
            <span className="phc-val">Ingen økt</span>
            <span className="phc-sub">planlegg fra Treningsplan</span>
          </div>
          <div className="phc-stat">
            <span className="phc-lbl">NESTE</span>
            <span className="phc-val">—</span>
            <span className="phc-sub">ingen kommende økter</span>
          </div>
        </div>
      </section>

      <section className="hub-grid">
        <HubCard
          href="/portal/planlegge"
          icon={PlayCircle}
          eyebrow="01 · NÅVÆRENDE"
          title="I dag"
          data="Ingen økter planlagt"
          sub="Bygg en plan i Planlegge-fanen for å se dagens program her."
          tone="empty"
          cta="Til Planlegge →"
        />
        <HubCard
          href="/portal/kalender"
          icon={Calendar}
          eyebrow="02 · UKA"
          title="Kalender"
          data="Ingen økter denne uka"
          sub="Når coachen din legger inn økter, vises de her."
          tone="empty"
          cta="Åpne kalender →"
        />
        <HubCard
          icon={Activity}
          eyebrow="03 · SANNTID"
          title="Live-økt"
          data="Live-økter kommer i juni"
          sub="Start fra fullscreen-modus når funksjonen er live."
          tone="empty"
          cta="Mer info →"
        />
        <HubCard
          href="/portal/booking"
          icon={CalendarCheck}
          eyebrow="04 · COACH"
          title="Booking"
          data="Ingen aktive bookinger"
          sub="Book Pro-time, Trackman eller gruppeøkt."
          tone="empty"
          cta="Book time →"
        />
        <HubCard
          href="/portal/mal/trackman"
          icon={Radio}
          eyebrow="05 · UTSTYR"
          title="TrackMan"
          data="Ingen sesjoner enda"
          sub="Importer fra TrackMan eller logg en ny sesjon."
          tone="empty"
          cta="Logg sesjon →"
        />
      </section>
    </HubFrame>
  );
}
