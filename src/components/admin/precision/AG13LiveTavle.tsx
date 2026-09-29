/**
 * AG-13 Live-tavle — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-13.jsx, «Live-tavle»).
 *
 * Ren visning: dataene kommer uendret fra hentLiveTavle() (T9, 27.08.2026)
 * — pågående treningsøkter (trainingSessionV2, status IN_PROGRESS) og
 * planlagte økter senere i dag.
 *
 * Merk: i katalogen overstyres AG-13.jsx (Live-tavle) av AG-cockpit.jsx
 * (AG-13 = Live coachingøkt). Tavla har derfor ingen aktiv tegning; denne
 * visningen følger den overstyrte tegningen og grunnkomponentene.
 *
 * Bevisst avvik fra tegningen:
 *   - Tegningens Lyst/Natt-bryter og enkelt-økt-detaljpanel (highlight,
 *     TrackMan-slaglogg, «Gi beskjed») er AG-13-U sitt ansvar her: klikk på
 *     et kort går til /admin/agencyos/live/[id] (AG13LiveOkt), i stedet for
 *     et innebygd sidepanel. To ekte ruter i appen (tavle + øktdetalj)
 *     erstatter tegningens ett-skjerm-med-utvalg-mønster.
 *   - «Coach» og TrackMan-slaglogg i live-kortet er ikke med: tavla logger
 *     ikke coach-tilknytning eller live-slag per økt ennå.
 */
import Link from "next/link";
import { CalendarDays, Radio } from "lucide-react";
import { KnappLenke, Meta, Sidehode, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Fremdriftslinje, Initialer } from "@/components/precision/pa-a3";
import type { LiveTavleData } from "@/lib/agencyos/live-tavle-data";

/** Tegningens per-kort status er tone=info (StatusPille i pa.tsx dekker ikke
 * denne tonen ennå — bygges her lokalt fremfor å endre en delt fil andre
 * bolker jobber i samtidig). Rust (tone=live) er forbeholdt sidens ene
 * signal i Sidehode, se AG13LiveTavle nedenfor. */
function PagaarPille() {
  return (
    <span className="pa-status pa-status--info">
      <span className="pa-status__dot" aria-hidden />
      Pågår
    </span>
  );
}

function OktKort({ okt }: { okt: LiveTavleData["liveOkter"][number] }) {
  return (
    <Link href={`/admin/agencyos/live/${okt.id}`} className="pa-card pa-card--interactive" style={{ padding: 16, gap: 10, textDecoration: "none", color: "inherit" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Initialer navn={okt.spillerNavn} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{okt.spillerNavn ?? "Gruppe"}</div>
          <div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{okt.tittel}</div>
        </div>
        <PagaarPille />
      </div>
      <div style={{ font: "700 26px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
        {okt.minIgjen} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}>min igjen</span>
      </div>
      <Fremdriftslinje pct={okt.fremdriftPct} />
    </Link>
  );
}

function KommerRad({ k }: { k: LiveTavleData["kommerIDag"][number] }) {
  return (
    <Link href={`/admin/agencyos/live/${k.id}`} className="pa-row pa-row--interactive" style={{ textDecoration: "none" }}>
      <Initialer navn={k.spillerNavn} size={32} />
      <span className="pa-row__main">
        <span className="pa-row__title">{k.spillerNavn ?? "Gruppe"}</span>
        <span className="pa-row__sub">{k.tittel}</span>
      </span>
      <span className="pa-row__value">
        {new Date(k.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" })}
      </span>
    </Link>
  );
}

export function AG13LiveTavle({ data }: { data: LiveTavleData }) {
  const n = data.liveOkter.length;
  return (
    <div className="pa-side">
      <Sidehode kicker="Live-tavle" title="Tavle" sub={n > 0 ? <StatusPille tone="live">{`Live · ${n} ${n === 1 ? "økt" : "økter"}`}</StatusPille> : undefined} />
      {n === 0 ? (
        <TomTilstand icon={Radio} title="Ingen økter pågår nå" text="Økter som settes i gang, vises her." actions={<KnappLenke variant="secondary" icon={CalendarDays} href="/admin/kalender">Åpne Kalender</KnappLenke>} />
      ) : (
        <div aria-label="Pågående økter" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 12 }}>
          {data.liveOkter.map((okt) => (
            <OktKort key={okt.id} okt={okt} />
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="kicker">Kommer i dag</span>
        {data.kommerIDag.length === 0 ? (
          <Meta>Ingen flere planlagte økter i dag.</Meta>
        ) : (
          <div className="pa-card">
            {data.kommerIDag.map((k) => (
              <KommerRad key={k.id} k={k} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
