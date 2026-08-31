"use client";

/**
 * AgencyOS Hjem — Train-lock (STEG 15.10, 31.08.2026).
 *
 * Fasit: designsystem/canvas/agencyos-ia/Hjem.dc.html (Mac 1440) +
 * HjemMobil.dc.html (390, VIKTIGST — beslutning 6.1, Anders skanner denne
 * stående på treningsfeltet mellom økter). Samme ett-kolonne-oppsett på
 * begge bredder: Kø-kortet ØVERST, «I dag»-kortet UNDER (beslutning 6.5).
 *
 * Slått sammen fra to tidligere adresser (MASTERPLAN 15.10):
 *   - /admin/agencyos (Konsoll — tidligere AG-01 Train-lock-cockpit,
 *     26.08.2026: Nå·live + Kø + neste økt)
 *   - /admin/brief (Daglig brief — AI-generert tekst, KPI-strip,
 *     «nyligste runder», «agentenes anbefalinger», «krever oppmerksomhet»)
 *
 * Hva som IKKE ble med hit, og hvorfor (dokumentert per beslutningens
 * «lærdom fra 15.1/15.2» — ingen funksjonalitet fjernes stille):
 *   - «Agentenes anbefalinger» + AI-dispatch/agent-team-status: duplikat av
 *     dette Kø-kortet OG av Jarvis (/admin/agenticos, STEG 15.5 — AGENCYOS_
 *     SKALL_TABS «Jarvis» peker allerede dit).
 *   - «Krever oppmerksomhet» (FokusSpillerPanel) + KPI-strip (aktive
 *     spillere/MRR) + «nyligste runder»: canvas-underteksten sier ordrett
 *     «Avvik og fremgang nås via Stall — de haster aldri i minutter»
 *     (beslutning 6.5). Naturlig hjem er den slankede Stall-lista
 *     (MASTERPLAN 15.11, ikke bygget ennå) — ikke Hjem.
 *   - AI-brief-teksten (Anthropic-generert oppsummering): dette var
 *     rapport-konseptet i den gamle /admin/brief. Print/eksport-knappene
 *     (samme underliggende `/admin/(legacy)/brief/actions` + EksportModal)
 *     er bevart som sekundære handlinger i headeren — selve AI-avsnittet er
 *     ikke en del av den godkjente canvasen og er derfor droppet fra Hjem.
 *
 * Kø-raden gjenbruker EKSAKT samme data som /admin/ko (lastGodkjenninger +
 * koTelling via `data.totalt`) — ingen ny spørring, ingen nytt tall som kan
 * sprike fra selve Kø-siden (lærdom fra 15.1: «et tall som ikke stemmer med
 * innholdet er verre enn intet tall»).
 *
 * Tokens: KUN TL (train-lock.ts) — CLAUDE.md invariant 2.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import type { CockpitTimelineSession } from "./agency-cockpit";
import type { AdminGodkjenningV2Row } from "@/components/admin/v2/AdminGodkjenningerV2";
import { PrintButton } from "@/components/shared/print-button";
import { EksportTrigger } from "@/components/shared/eksport-trigger";

function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    const opp = () => setOnline(true);
    const ned = () => setOnline(false);
    window.addEventListener("online", opp);
    window.addEventListener("offline", ned);
    return () => {
      window.removeEventListener("online", opp);
      window.removeEventListener("offline", ned);
    };
  }, []);
  return online;
}

function CapsLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: TL.storrelse.caps,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.caps,
        textTransform: "uppercase",
        color: TL.mute,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Kort({ children }: { children: React.ReactNode }) {
  return <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>{children}</div>;
}

function TomKort({ tittel, undertekst }: { tittel: string; undertekst: string }) {
  return (
    <Kort>
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ fontSize: TL.storrelse.kropp, fontWeight: TL.vekt.kropp, color: TL.text }}>{tittel}</div>
        <div style={{ marginTop: 4, fontSize: TL.storrelse.meta, color: TL.mute }}>{undertekst}</div>
      </div>
    </Kort>
  );
}

function HasterPille() {
  return (
    <span
      style={{
        flex: "none",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: TL.warn,
        boxShadow: `inset 0 0 0 1px ${TL.warnHair}`,
        borderRadius: TL.radius.pill,
        padding: "3px 8px",
      }}
    >
      Haster
    </span>
  );
}

function KoRad({ row, forst }: { row: AdminGodkjenningV2Row; forst: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 0",
        borderTop: forst ? "none" : `1px solid ${TL.hair}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: TL.storrelse.kropp, fontWeight: 600, color: TL.text }}>{row.who}</div>
        <div
          style={{
            fontSize: TL.storrelse.meta,
            color: TL.mute,
            marginTop: 3,
            lineHeight: 1.45,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.title}
        </div>
      </div>
      {row.urgent && <HasterPille />}
      <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{row.when}</span>
    </div>
  );
}

function KoKort({ totalt, rader }: { totalt: number; rader: AdminGodkjenningV2Row[] }) {
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CapsLabel>Kø</CapsLabel>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: TL.font.mono,
            fontSize: 22,
            fontWeight: 600,
            color: TL.text,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {totalt}
        </span>
      </div>
      {rader.length === 0 ? (
        <div style={{ marginTop: 10 }}>
          <TomKort tittel="Ingenting venter på deg" undertekst="Godkjenninger og meldinger dukker opp her." />
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          {rader.map((r, i) => (
            <KoRad key={r.id} row={r} forst={i === 0} />
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Link
          href="/admin/ko"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 20px",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          Åpne køen
        </Link>
      </div>
    </Kort>
  );
}

function IDagRad({ okt, now, forst }: { okt: CockpitTimelineSession; now: number; forst: boolean }) {
  const erNa = now >= okt.startMin && now < okt.startMin + okt.durMin;
  const metaTekst = [okt.title, ...okt.meta.map((m) => m.text)].filter(Boolean).join(" · ");
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 0",
        borderTop: forst ? "none" : `1px solid ${TL.hair}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: TL.storrelse.kropp, fontWeight: 600, color: TL.text }}>{okt.playerName}</div>
        <div
          style={{
            fontSize: TL.storrelse.meta,
            color: TL.mute,
            marginTop: 3,
            lineHeight: 1.45,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {metaTekst}
        </div>
      </div>
      <span style={{ fontSize: 13, color: erNa ? TL.warm : TL.mute, fontVariantNumeric: "tabular-nums", fontWeight: erNa ? 700 : 400 }}>
        {erNa ? "nå" : okt.time}
      </span>
    </div>
  );
  return okt.href ? (
    <Link href={okt.href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function IDagKort({ dagLabel, timeline, now }: { dagLabel: string; timeline: CockpitTimelineSession[]; now: number }) {
  return (
    <Kort>
      <CapsLabel>I dag · {dagLabel}</CapsLabel>
      {timeline.length === 0 ? (
        <div style={{ marginTop: 10 }}>
          <TomKort tittel="Ingen økter i dag" undertekst="Bruk dagen til Workbench eller til å tømme køen." />
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          {timeline.map((okt, i) => (
            <IDagRad key={okt.id} okt={okt} now={now} forst={i === 0} />
          ))}
        </div>
      )}
    </Kort>
  );
}

function FeilKort({ oppdatert }: { oppdatert: string }) {
  return (
    <Kort>
      <div style={{ fontSize: TL.storrelse.kropp, fontWeight: TL.vekt.kropp, color: TL.danger }}>Ingen forbindelse</div>
      <div style={{ marginTop: 4, fontSize: TL.storrelse.meta, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
        Nettet er nede. Viser sist synkronisert {oppdatert}.
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          marginTop: 16,
          height: 48,
          borderRadius: TL.radius.pill,
          background: TL.fill,
          color: TL.onFill,
          fontSize: TL.storrelse.cta,
          fontWeight: TL.vekt.cta,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          border: "none",
          cursor: "pointer",
        }}
      >
        Prøv igjen
      </button>
    </Kort>
  );
}

function HjemHeader({ dayLabel, klokke }: { dayLabel: string; klokke: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <div>
        <CapsLabel>Academy</CapsLabel>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: TL.storrelse.tittel,
            fontWeight: TL.vekt.tittel,
            letterSpacing: TL.track.tittel,
            lineHeight: 1.1,
            color: TL.text,
          }}
        >
          Hjem
        </h1>
        <p style={{ margin: "8px 0 0", maxWidth: "62ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
          Kø øverst, dagen under. Avvik og fremgang nås via Stall — de haster aldri i minutter.
        </p>
        <div
          className="hidden min-[1101px]:block"
          style={{ marginTop: 8, fontSize: TL.storrelse.meta, color: TL.mute, fontVariantNumeric: "tabular-nums" }}
        >
          {dayLabel} · {klokke}
        </div>
      </div>
      {/* Bevart fra gamle /admin/brief — samme underliggende rapport-modul
          (src/app/admin/(legacy)/brief/actions + EksportModal), kun flyttet
          hit som sekundære handlinger. Ikke en del av canvasen, men fjernet
          ingen funksjonalitet stille. */}
      <div className="hidden min-[1101px]:flex" style={{ gap: 8, flexWrap: "wrap" }}>
        <PrintButton label="Skriv ut" />
        <EksportTrigger kind="brief" />
      </div>
    </div>
  );
}

/** Toppnivå-siden — header + de to kortene. Eneste eksport ruta trenger. */
export function AgencyCockpitTrainLock({
  timeline,
  now,
  koTotalt,
  koRader,
  dagLabel,
  dayLabel,
  klokke,
}: {
  timeline: CockpitTimelineSession[];
  now: number;
  koTotalt: number;
  koRader: AdminGodkjenningV2Row[];
  /** Kort dag-etikett til «I dag ·»-kortet, f.eks. «fredag 30. august». */
  dagLabel: string;
  /** Lang dag-etikett til headerens sekundærlinje. */
  dayLabel: string;
  klokke: string;
}) {
  const online = useOnline();

  if (!online) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <HjemHeader dayLabel={dayLabel} klokke={klokke} />
        <div style={{ maxWidth: 480 }}>
          <FeilKort oppdatert={klokke} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <HjemHeader dayLabel={dayLabel} klokke={klokke} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <KoKort totalt={koTotalt} rader={koRader.slice(0, 3)} />
        <IDagKort dagLabel={dagLabel} timeline={timeline} now={now} />
      </div>
    </div>
  );
}
