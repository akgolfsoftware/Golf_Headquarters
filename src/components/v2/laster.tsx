/* AK Golf HQ v2 — V2Laster (skeleton) for tynne loading.tsx-filer.
   Skilt ut fra feil-laste.tsx 07.09.2026 og BEVISST UTEN "use client":
   Next 16.3 sin createComponentStylesAndScripts (app-render) lager
   <script async src> for loading.tsx-grensens klient-chunks UTEN CSP-nonce
   (get-layer-assets.js sender nonce, den gjør det ikke). Når en side
   suspenderer lenge nok til at fallbacken streames, blokkerer 'strict-dynamic'
   chunken — målt i prod 05.09.2026 på /admin/analyse og /admin/spillere/[id].
   Feilen ligger også i Next sine forhåndskompilerte prod-runtime-bundler, så
   den kan ikke patches lokalt. Som ren serverkomponent bærer loading.tsx ingen
   klient-JS, og Next har ingen tag å skrive.
   IKKE legg "use client", hooks eller klientkomponenter (Knapp, Icon, Link)
   inn her — da kommer feilen tilbake. Vakt: tests/e2e/csp-konsoll.spec.ts.
   V2Feil (feilinnhold, trenger onClick) bor fortsatt i feil-laste.tsx. */

import type { CSSProperties } from "react";
import { TL } from "@/lib/v2/train-lock";

/* ── V2Laster ─────────────────────────────────────────── */
/* .v2-skel-pulsen bor statisk i src/styles/v2/motion.css (FASIT §4b). */

const PANEL_STYLE: CSSProperties = { background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "18px 20px", minWidth: 0 };

function SkelBlock({ w, h, r = 8, style }: { w?: number | string; h: number; r?: number; style?: CSSProperties }) {
  return <div className="v2-skel" style={{ width: w ?? "100%", height: h, borderRadius: r, flex: "none", ...style }} />;
}

/** Skeleton-liste — dekker rad-baserte skjermer (Rad-mønsteret i core.tsx). */
function ListeSkel() {
  return (
    <div style={PANEL_STYLE}>
      <SkelBlock w={96} h={9} r={4} style={{ marginBottom: 16 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 4 ? `1px solid ${TL.hair}` : "none" }}>
          <SkelBlock w={30} h={30} r={9999} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <SkelBlock w="60%" h={12} />
            <SkelBlock w="35%" h={10} />
          </div>
          <SkelBlock w={44} h={18} r={9999} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton-kortgrid — dekker KPI-/kort-baserte skjermer (Kort/KpiFlis-mønsteret). */
function KortSkel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={PANEL_STYLE}>
          <SkelBlock w={64} h={9} r={4} />
          <SkelBlock w="70%" h={30} style={{ marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton-dashboard — hero-tall + KPI-rad + graf, dekker oversiktsskjermer. */
function DashboardSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={PANEL_STYLE}>
        <SkelBlock w={120} h={9} r={4} />
        <SkelBlock w={180} h={56} style={{ marginTop: 14 }} />
      </div>
      <KortSkel />
      <div style={PANEL_STYLE}>
        <SkelBlock w={100} h={9} r={4} style={{ marginBottom: 16 }} />
        <SkelBlock h={96} r={12} />
      </div>
    </div>
  );
}

/* ── Skjerm-speilede skeletons (P4, masterplan Del 3c) ──
   Hver variant speiler MÅLSKJERMENS faktiske layout — samme hode, KPI-grid,
   panelstruktur og kolonnedeling som V2-komponenten den venter på. Aldri
   generiske firkanter: endres målskjermens layout, oppdater varianten her. */

/** Sidehode: (avatar) + caps-linje + tittel-linje, ev. CTA-pill til høyre. */
function HodeSkel({ avatar = false, cta = false, ingress = false }: { avatar?: boolean; cta?: boolean; ingress?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {avatar && <SkelBlock w={46} h={46} r={9999} />}
        <div>
          <SkelBlock w={140} h={9} r={4} />
          <SkelBlock w={220} h={26} style={{ marginTop: 12 }} />
          {ingress && <SkelBlock w={300} h={11} style={{ marginTop: 12 }} />}
        </div>
      </div>
      {cta && (
        <div className="hidden md:block">
          <SkelBlock w={128} h={36} r={9999} />
        </div>
      )}
    </div>
  );
}

/** KPI-rad — samme responsive grid-klasser som målskjermens KpiFlis-rad. */
function KpiRadSkel({ antall = 4, cls = "grid grid-cols-2 lg:grid-cols-4" }: { antall?: number; cls?: string }) {
  return (
    <div className={cls} style={{ gap: 16 }}>
      {Array.from({ length: antall }).map((_, i) => (
        <div key={i} style={PANEL_STYLE}>
          <SkelBlock w={64} h={9} r={4} />
          <SkelBlock w="70%" h={30} style={{ marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

/** Én Rad-silhuett: leading (avatar/klokkeslett/status-dott) + to linjer + chip. */
function RadSkel({ leading = "avatar", last = false }: { leading?: "avatar" | "tid" | "dott"; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: last ? "none" : `1px solid ${TL.hair}` }}>
      {leading === "tid" ? (
        <SkelBlock w={44} h={11} r={4} />
      ) : (
        <SkelBlock w={leading === "dott" ? 26 : 30} h={leading === "dott" ? 26 : 30} r={9999} />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <SkelBlock w="60%" h={12} />
        <SkelBlock w="35%" h={10} />
      </div>
      <SkelBlock w={44} h={18} r={9999} />
    </div>
  );
}

/** Kort med eyebrow + n Rad-silhuetter (Kort/Rad-mønsteret i core.tsx). */
function RadPanelSkel({ rader = 4, leading = "avatar" as "avatar" | "tid" | "dott" }) {
  return (
    <div style={PANEL_STYLE}>
      <SkelBlock w={96} h={9} r={4} style={{ marginBottom: 10 }} />
      {Array.from({ length: rader }).map((_, i) => (
        <RadSkel key={i} leading={leading} last={i === rader - 1} />
      ))}
    </div>
  );
}

/** Filterrad: caps-etikett + chips (FilterChips-mønsteret). */
function FilterSkel() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <SkelBlock w={48} h={9} r={4} />
      <SkelBlock w={72} h={26} r={9999} />
      <SkelBlock w={84} h={26} r={9999} />
      <SkelBlock w={64} h={26} r={9999} />
    </div>
  );
}

/** TallHero-kort: eyebrow + hero-tall + underlinje, ev. trendgraf. */
function HeroPanelSkel({ trend = false }: { trend?: boolean }) {
  return (
    <div style={PANEL_STYLE}>
      <SkelBlock w={140} h={9} r={4} />
      <SkelBlock w={150} h={44} style={{ marginTop: 14 }} />
      <SkelBlock w={180} h={10} style={{ marginTop: 10 }} />
      {trend && <SkelBlock h={72} r={12} style={{ marginTop: 14 }} />}
    </div>
  );
}

/** /admin/agencyos — konsollen (tidl. CockpitV2): hode m/avatar · 4 KPI · kø · innboks · (timer | stall-uka). */
function CockpitSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HodeSkel avatar />
      <KpiRadSkel />
      <RadPanelSkel rader={3} />
      <RadPanelSkel rader={3} />
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        <RadPanelSkel rader={4} leading="tid" />
        <HeroPanelSkel />
      </div>
    </div>
  );
}

/** /admin/bookinger — AdminBookingerV2: hode m/CTA · 4 KPI · filter · (liste | heatmap). */
function BookingerSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HodeSkel cta />
      <KpiRadSkel />
      <FilterSkel />
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]" style={{ gap: 16, alignItems: "start" }}>
        <RadPanelSkel rader={6} />
        <div style={PANEL_STYLE}>
          <SkelBlock w={140} h={9} r={4} style={{ marginBottom: 16 }} />
          <SkelBlock h={220} r={12} />
          <SkelBlock w="55%" h={10} style={{ marginTop: 12 }} />
        </div>
      </div>
    </div>
  );
}

/** /admin/spillere — StallV2: hode m/CTA · 3 filterrader · (spillerliste | spillersammendrag). */
function StallSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HodeSkel cta />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <FilterSkel />
        <FilterSkel />
        <FilterSkel />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: 16, alignItems: "start" }}>
        <RadPanelSkel rader={7} />
        <div style={PANEL_STYLE}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SkelBlock w={44} h={44} r={9999} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <SkelBlock w="50%" h={14} />
              <SkelBlock w="70%" h={10} />
            </div>
          </div>
          <SkelBlock w={150} h={44} style={{ marginTop: 16 }} />
          <SkelBlock h={64} r={12} style={{ marginTop: 12 }} />
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkelBlock key={i} h={10} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** /admin/godkjenninger — AdminGodkjenningerV2: hode m/ingress · filter · seksjoner per spiller med sak-kort. */
function GodkjenningerSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HodeSkel ingress cta />
      <FilterSkel />
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <SkelBlock w={26} h={26} r={9999} />
            <SkelBlock w={120} h={12} />
          </div>
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} style={PANEL_STYLE}>
              <SkelBlock w="70%" h={13} />
              <SkelBlock w="45%" h={10} style={{ marginTop: 8 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <SkelBlock w={96} h={32} r={9999} />
                <SkelBlock w={80} h={32} r={9999} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** /portal — PH-01 I dag laster (B1): skjelett i kortgeometri, ingen spinner. */
function HjemSkel() {
  const kort: CSSProperties = {
    background: TL.elev,
    borderRadius: TL.radius.card,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SkelBlock w={140} h={11} r={4} />
      <SkelBlock w={90} h={34} r={8} />
      <div style={kort}>
        <SkelBlock w="30%" h={10} r={5} />
        <SkelBlock w="62%" h={22} r={8} />
        <SkelBlock w="40%" h={10} r={5} />
        <SkelBlock w="100%" h={48} r={999} style={{ marginTop: 8 }} />
      </div>
      <div style={kort}>
        <SkelBlock w="24%" h={10} r={5} />
        <SkelBlock w="44%" h={14} r={6} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={kort}>
          <SkelBlock w="56%" h={24} r={8} />
          <SkelBlock w="70%" h={10} r={5} />
        </div>
        <div style={kort}>
          <SkelBlock w="32%" h={24} r={8} />
          <SkelBlock w="78%" h={10} r={5} />
        </div>
      </div>
    </div>
  );
}

/** /portal/planlegge — PlanV2 (B1 «Plan laster»): dagstripe (7 piller) + to ukekort. */
function PlanSkel() {
  const kort: CSSProperties = { background: TL.elev, borderRadius: TL.radius.card, padding: 20, display: "flex", flexDirection: "column", gap: 12 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SkelBlock w={110} h={11} r={4} />
      <SkelBlock w={70} h={30} r={8} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <SkelBlock key={i} w={44} h={56} r={9999} style={{ flex: "none" }} />
        ))}
      </div>
      <div style={kort}>
        <SkelBlock w="52%" h={14} r={6} />
        <SkelBlock w="38%" h={10} r={5} />
      </div>
      <div style={kort}>
        <SkelBlock w="30%" h={14} r={6} />
        <SkelBlock w="46%" h={10} r={5} />
      </div>
    </div>
  );
}

/** /portal/meg — Meg (B1 «Meg laster»): avatar-sirkel + navn/undertekst + innstillings-kort. */
function MegSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <SkelBlock w={84} h={84} r={9999} />
        <SkelBlock w={160} h={18} r={7} />
        <SkelBlock w={210} h={10} r={5} />
      </div>
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <SkelBlock w="34%" h={12} r={5} />
        <SkelBlock w="42%" h={12} r={5} />
        <SkelBlock w="28%" h={12} r={5} />
        <SkelBlock w="38%" h={12} r={5} />
      </div>
    </div>
  );
}

/** /portal/gjennomfore — GjorV2: hode · runde-kort · KPI-rad · øvelser · (neste økt | avslutt-flyt). */
function GjorSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HodeSkel />
      <div style={PANEL_STYLE}>
        <SkelBlock w={60} h={9} r={4} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <SkelBlock w="45%" h={14} />
            <SkelBlock w="75%" h={10} style={{ marginTop: 8 }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SkelBlock w={150} h={36} r={9999} />
            <SkelBlock w={130} h={36} r={9999} />
          </div>
        </div>
      </div>
      <KpiRadSkel antall={3} cls="grid grid-cols-2 md:grid-cols-3" />
      <RadPanelSkel rader={4} leading="dott" />
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: 16 }}>
        <HeroPanelSkel />
        <div style={PANEL_STYLE}>
          <SkelBlock w={110} h={9} r={4} />
          <SkelBlock w="90%" h={10} style={{ marginTop: 12 }} />
          <SkelBlock w="70%" h={10} style={{ marginTop: 6 }} />
          <SkelBlock w={140} h={36} r={9999} style={{ marginTop: 12 }} />
        </div>
      </div>
    </div>
  );
}

/** /portal/analysere — AnalyseHub laster (B1): hero-tall + 3 KPI-kort + tekstpanel.
 *  Hentet fra `claude/px7-tilstander-brekk-4cp4nu` ved sammenslåingen 30.08:
 *  denne grenen dekket bare tre av B1s fire PlayerHQ-faner (I dag/Plan/Meg),
 *  og Analyse manglet. */
function AnalyseSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SkelBlock w={140} h={11} r={4} />
      <SkelBlock w={110} h={34} r={8} />
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <SkelBlock w="34%" h={10} r={5} />
        <SkelBlock w="40%" h={40} r={10} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <SkelBlock w="70%" h={18} r={7} />
            <SkelBlock w="56%" h={9} r={4} />
          </div>
        ))}
      </div>
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <SkelBlock w="22%" h={10} r={5} />
        <SkelBlock w="92%" h={12} r={5} />
        <SkelBlock w="74%" h={12} r={5} />
      </div>
    </div>
  );
}

export type V2LasterVariant =
  | "liste"
  | "kort"
  | "dashboard"
  | "cockpit"
  | "bookinger"
  | "stall"
  | "godkjenninger"
  | "hjem"
  | "plan"
  | "meg"
  | "analyse"
  | "gjor";
export interface V2LasterProps {
  variant?: V2LasterVariant;
}

/** Skeleton i v2-design. Rendres i en tynn loading.tsx (Server Component OK —
 *  se docs/redesign-v2/maler/loading-mal.tsx.txt). Tre varianter dekker
 *  liste-, kort- og dashboard-skjermer; pulserende paneler i TL.dock.
 *
 *  VIKTIG (bugfix 2026-07-12, sett i prod): loading.tsx rendres UTEN sidens
 *  V2Shell (shellen bor i page, ikke layout) — skeletonen bærer derfor selv
 *  hele den mørke chromen (bakgrunn + rail-silhuett), ellers vises mørke
 *  klosser på hvit flate ved hver navigering. */
export function V2Laster({ variant = "kort" }: V2LasterProps) {
  const inner =
    variant === "liste" ? <ListeSkel />
    : variant === "dashboard" ? <DashboardSkel />
    : variant === "cockpit" ? <CockpitSkel />
    : variant === "bookinger" ? <BookingerSkel />
    : variant === "stall" ? <StallSkel />
    : variant === "godkjenninger" ? <GodkjenningerSkel />
    : variant === "hjem" ? <HjemSkel />
    : variant === "plan" ? <PlanSkel />
    : variant === "meg" ? <MegSkel />
    : variant === "analyse" ? <AnalyseSkel />
    : variant === "gjor" ? <GjorSkel />
    : <KortSkel />;
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `${TL.scene}`,
        colorScheme: "dark",
        display: "flex",
      }}
    >
      {/* Rail-silhuett — matcher V2Shell-railen så overgangen er sømløs. */}
      <div className="hidden md:block" style={{ width: 60, flex: "none", borderRight: `1px solid ${TL.hair}` }} />
      <main className="px-4 md:px-8 pt-6 pb-24 md:pb-9" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ width: "100%" }}>{inner}</div>
      </main>
    </div>
  );
}
