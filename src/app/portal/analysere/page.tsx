/**
 * /portal/analysere — PlayerHQ Analysere hub
 *
 * Pre-BETA empty-state: ingen mock-data, ingen fake-statistikk.
 * Banner øverst forklarer at statistikk kommer når brukeren har
 * logget runder. Alle HubCards bruker tone="empty".
 */

import {
  BarChart3,
  ClipboardCheck,
  Download,
  Flag,
  Map,
  Plus,
  Radio,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function AnalyserePage() {
  await requirePortalUser();

  return (
    <HubFrame>
      <HubHeader
        eyebrow="PLAYERHQ · PRO"
        title="Forstå spillet"
        titleItalic="ditt"
        sub="Statistikk, Strokes Gained, runder, TrackMan, tester og AI-innsikt."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <Download size={13} strokeWidth={1.75} aria-hidden /> Eksporter
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Plus size={13} strokeWidth={2} aria-hidden /> Logg runde
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>0</strong> runder
            </span>
            <HubStatSep />
            <span>
              <strong>0</strong> tester
            </span>
            <HubStatSep />
            <span>
              <strong>0</strong> TrackMan-sesjoner
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/portal/mal/runder/ny"
          icon={Sparkles}
          eyebrow="KOM I GANG"
          title="Logg første runde"
          data="Statistikk og analyser kommer her"
          sub="Når du har logget dine første runder, ser du SG-fordeling, trender og AI-innsikt. Begynn med å legge til en runde fra Mål-fanen."
          tone="accent"
          cta="Legg til runde →"
        />
        <HubCard
          href="/portal/statistikk"
          icon={BarChart3}
          eyebrow="01 · OVERSIKT"
          title="Statistikk"
          data="0 runder loggført"
          sub="Snitt, GIR og driver-distanse vises når du har minst 3 runder."
          tone="empty"
          cta="Til statistikk →"
        />
        <HubCard
          href="/portal/mal/sg-hub"
          icon={TrendingUp}
          eyebrow="02 · NØKKELTALL"
          title="Strokes Gained"
          data="Ingen data enda"
          sub="SG-fordeling (Tee · Approach · Around · Putt) krever shot-by-shot-runder."
          tone="empty"
          cta="Lær mer om SG →"
        />
        <HubCard
          href="/portal/mal/runder"
          icon={Flag}
          eyebrow="03 · RUNDER"
          title="Runder"
          data="Ingen runder enda"
          sub="Logg din første runde for å bygge runde-historikken."
          tone="empty"
          cta="Logg runde →"
        />
        <HubCard
          href="/portal/mal/trackman"
          icon={Radio}
          eyebrow="04 · ØVELSE"
          title="TrackMan"
          data="Ingen sesjoner enda"
          sub="Importer fra TrackMan eller logg en ny range-sesjon."
          tone="empty"
          cta="Importer →"
        />
        <HubCard
          href="/portal/tren/tester"
          icon={ClipboardCheck}
          eyebrow="05 · MÅLINGER"
          title="Tester"
          data="Ingen test-resultater enda"
          sub="Test-batteriet (CMJ, Squat, Wedge 50m, 5-iron carry) starter når coach tildeler tester."
          tone="empty"
          cta="Se tester →"
        />
        <HubCard
          icon={Sparkles}
          eyebrow="06 · AI-CADDIE"
          title="AI-Innsikt"
          data="Anbefalinger kommer"
          sub="Caddie analyserer SG-data og foreslår fokus-områder etter første runde."
          tone="empty"
          cta="Mer info →"
        />
        <HubCard
          href="/portal/mal/baner"
          icon={Map}
          eyebrow="07 · GEOGRAFI"
          title="Baner"
          data="Ingen baner spilt"
          sub="Når du logger runder, bygger vi geografisk oversikt over banene dine."
          tone="empty"
          cta="Utforsk baner →"
        />
        <HubCard
          href="/portal/mal/leaderboard"
          icon={Trophy}
          eyebrow="08 · POSISJON"
          title="Leaderboard"
          data="Ingen rangering enda"
          sub="Du blir rangert i din spillerklasse etter første loggførte runde."
          tone="empty"
          cta="Se leaderboard →"
        />
      </section>
    </HubFrame>
  );
}
