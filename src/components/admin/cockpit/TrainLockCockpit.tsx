"use client";

/**
 * AgencyOS Cockpit — Train-lock (T2, 26.08.2026).
 *
 * Fasit: designsystem/train-lock/AG-01 Cockpit.dc.html,
 * AG-01 Cockpit lys.dc.html (samme kortspråk, inverterte flater — TL-tokens
 * bytter automatisk), AG-02 Cockpit Mac.dc.html, AG-14 Cockpit tom.dc.html,
 * AG-15 Cockpit feil.dc.html.
 * Erstatter KonsollChat (Caddie-tråd/artefaktpanel) på denne ruten — AG-01 har
 * verken composer eller chat-feed. Caddie-hooken (useCaddieChat) er urørt og
 * kan gjenbrukes et annet sted (Jarvis-sporet), men har ingen inngang herfra
 * etter denne porten.
 *
 * Tre kort, i denne rekkefølgen på alle skjermstørrelser (Mac: to kolonner —
 * Nå + {navn} i dag til venstre, Kø til høyre, jf. AG-02):
 *   1. Nå · live   — aktiv økt nå, eller «Ingen i økt nå» + peker til neste
 *   2. Kø · N      — ekte ventende elementer (godkjenning, forespørsel …)
 *   3. {navn} i dag — neste økt i dag, uavhengig av om noen er live nå
 *
 * Tokens: KUN TL (train-lock.ts, --tl- i CSS) — se CLAUDE.md invariant 2.
 * Én hvit (lys: sort) primær CTA: «Åpne tavle» på Nå-kortet.
 * dataState «feil» (AG-15, danger KUN her) styres av navigator.onLine —
 * ingen ny data-motor, kun det nettleseren allerede vet.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { buildTrainLockCockpit } from "@/lib/agencyos/cockpit-view";
import type { CockpitData } from "./agency-cockpit";
import type { AiDispatchData } from "@/lib/agencyos/ai-dispatch-build";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

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
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      {children}
    </div>
  );
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

function NaKort({
  liveNow,
}: {
  liveNow: NonNullable<ReturnType<typeof buildTrainLockCockpit>["liveNow"]>;
}) {
  return (
    <Kort>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <CapsLabel>Nå · live</CapsLabel>
        {liveNow.locationTag && (
          <span
            style={{
              fontSize: TL.storrelse.caps,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {liveNow.locationTag}
          </span>
        )}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: TL.storrelse.kortTittel,
          fontWeight: TL.vekt.kortTittel,
          letterSpacing: TL.track.kortTittel,
          lineHeight: 1.15,
          color: TL.text,
        }}
      >
        {liveNow.playerName}
      </div>
      <div style={{ marginTop: 5, fontSize: TL.storrelse.meta, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
        {liveNow.metaText}
      </div>
      <div style={{ marginTop: 18, height: 3, borderRadius: 2, background: TL.dim, overflow: "hidden" }}>
        <div style={{ width: `${liveNow.progressPct}%`, height: "100%", background: TL.fill, borderRadius: 2 }} />
      </div>
      {liveNow.href ? (
        <Link
          href={liveNow.href}
          className={PRESS}
          style={{
            marginTop: 18,
            height: 48,
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontSize: TL.storrelse.cta,
            fontWeight: TL.vekt.cta,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Åpne tavle
        </Link>
      ) : null}
    </Kort>
  );
}

function KoKort({
  title,
  meta,
  href,
  dimmed,
}: {
  title: string;
  meta: string;
  href: string;
  dimmed: boolean;
}) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "18px 20px", opacity: dimmed ? TL.opasitet.sekundaer : 1 }}>
      <div style={{ fontSize: TL.storrelse.kropp, fontWeight: TL.vekt.kropp, color: TL.text }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: TL.storrelse.meta, color: TL.mute, lineHeight: 1.45 }}>{meta}</div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center" }}>
        <Link
          href={href}
          className={PRESS}
          style={{
            height: 40,
            padding: "0 24px",
            borderRadius: TL.radius.pill,
            background: TL.dim,
            color: TL.text,
            fontSize: TL.storrelse.kropp,
            fontWeight: TL.vekt.kropp,
            display: "flex",
            alignItems: "center",
          }}
        >
          Åpne
        </Link>
      </div>
    </div>
  );
}

function NesteOktKort({ next }: { next: NonNullable<ReturnType<typeof buildTrainLockCockpit>["next"]> }) {
  const inner = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <CapsLabel>{next.firstName} i dag</CapsLabel>
        <span
          style={{
            fontSize: TL.storrelse.caps,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {next.timeRange}
        </span>
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: TL.avatar,
            color: TL.onAvatar,
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {next.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: TL.storrelse.kropp, fontWeight: TL.vekt.kropp, color: TL.text }}>{next.title}</div>
          {next.meta && (
            <div style={{ marginTop: 2, fontSize: TL.storrelse.meta, color: TL.mute }}>{next.meta}</div>
          )}
        </div>
      </div>
    </>
  );
  return (
    <Kort>
      {next.href ? (
        <Link href={next.href} className="block">
          {inner}
        </Link>
      ) : (
        inner
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
        className={PRESS}
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

function CockpitHeader({ dayLabel, klokke }: { dayLabel: string; klokke: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
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
          I dag
        </h1>
      </div>
      <div
        className="hidden min-[1101px]:block"
        style={{ fontSize: TL.storrelse.meta, color: TL.mute, fontVariantNumeric: "tabular-nums" }}
      >
        {dayLabel} · {klokke}
      </div>
    </div>
  );
}

function TrainLockCockpit({
  data,
  aiDispatch,
  sistSynkronisert,
}: {
  data: Pick<CockpitData, "timeline" | "now">;
  aiDispatch: Pick<AiDispatchData, "rader">;
  /** Server-formatert Oslo-klokke (samme mønster som andre v2-flater — gotchas §Tidssone). */
  sistSynkronisert: string;
}) {
  const online = useOnline();
  const view = buildTrainLockCockpit(data, aiDispatch);

  if (!online) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
        <FeilKort oppdatert={sistSynkronisert} />
        <div style={{ opacity: TL.opasitet.sekundaer, display: "flex", flexDirection: "column", gap: 10 }}>
          {view.liveNow && (
            <Kort>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <CapsLabel>Nå · live</CapsLabel>
                {view.liveNow.locationTag && <CapsLabel>{view.liveNow.locationTag}</CapsLabel>}
              </div>
              <div style={{ marginTop: 10, fontSize: TL.storrelse.kortTittel, fontWeight: TL.vekt.kortTittel, color: TL.text }}>
                {view.liveNow.playerName}
              </div>
              <div style={{ marginTop: 5, fontSize: TL.storrelse.meta, color: TL.mute }}>{view.liveNow.metaText}</div>
            </Kort>
          )}
          {view.queue[0] && (
            <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "18px 20px" }}>
              <div style={{ fontSize: TL.storrelse.kropp, fontWeight: TL.vekt.kropp, color: TL.text }}>{view.queue[0].title}</div>
              <div style={{ marginTop: 4, fontSize: TL.storrelse.meta, color: TL.mute, lineHeight: 1.45 }}>{view.queue[0].meta}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const naSeksjon = view.liveNow ? (
    <NaKort liveNow={view.liveNow} />
  ) : (
    <TomKort
      tittel="Ingen i økt nå"
      undertekst={view.next ? `Neste: ${view.next.firstName} · ${view.next.timeRange.split("–")[0]}` : "Ingen flere økter i dag."}
    />
  );

  const koSeksjon = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <CapsLabel>Kø · {view.queue.length}</CapsLabel>
      {view.queue.length === 0 ? (
        <TomKort tittel="Ingenting venter på deg" undertekst="Godkjenninger og meldinger dukker opp her." />
      ) : (
        view.queue.map((k) => <KoKort key={k.id} title={k.title} meta={k.meta} href={k.href} dimmed={k.dimmed} />)
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 min-[1101px]:flex-row min-[1101px]:items-start min-[1101px]:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {naSeksjon}
        {view.next && <NesteOktKort next={view.next} />}
      </div>
      <div className="min-w-0 flex-1">{koSeksjon}</div>
    </div>
  );
}

/** Toppnivå-siden — header + kort. Eneste eksport ruta trenger. */
export function AgencyCockpitTrainLock({
  data,
  aiDispatch,
  dayLabel,
  klokke,
}: {
  data: Pick<CockpitData, "timeline" | "now">;
  aiDispatch: Pick<AiDispatchData, "rader">;
  dayLabel: string;
  klokke: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <CockpitHeader dayLabel={dayLabel} klokke={klokke} />
      <TrainLockCockpit data={data} aiDispatch={aiDispatch} sistSynkronisert={klokke} />
    </div>
  );
}
