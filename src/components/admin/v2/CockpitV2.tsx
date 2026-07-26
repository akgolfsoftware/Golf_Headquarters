"use client";

/**
 * AgencyOS Cockpit — v2 (retning C «Presis»). 1:1 med mockup-fasit
 * ui_kits/v2/agencyos.jsx → Cockpit({mobile}), men drevet av EKTE CockpitData
 * fra loadDailyBrief (Prisma). Bygget utelukkende av v2-komponentbiblioteket
 * (src/components/v2) — ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Desktop-rekkefølge (GO V3 — NÅ øverst): hode → live → AI-dispatch («Én ting NÅ»)
 * → koen «Trenger deg nå» → kpi (4) → fokus-spillere → innboks →
 * grid 2-kol (Dagens timer | Stall-uka) → InnsiktChip «Planlegg i Workbench».
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  StatusPill,
  KpiFlis,
  Kort,
  Rad,
  AvatarFoto,
  AvatarInit,
  SevChip,
  AKSE_NAVN,
  TallHero,
  InnsiktChip,
  TomTilstand,
  CTAPill,
  HjelpTips,
  type SevKey,
} from "@/components/v2";
import { LiveBar, OktKort } from "@/components/v2/domene";
import { T, type AkseKey } from "@/lib/v2/tokens";
import type {
  CockpitData,
  CockpitFocusPlayer,
} from "@/components/admin/cockpit/agency-cockpit";
import type { InnboksSammendrag } from "@/lib/innboks/data";
import type { FokusData } from "@/lib/agencyos/fokus-spillere";
import type { AiDispatchData } from "@/lib/agencyos/ai-dispatch-data";
import { FokusSpillere } from "@/components/admin/v2/FokusSpillere";
import { AiDispatchPanelV2 } from "@/components/admin/v2/AiDispatchPanelV2";

/* signal.tone → SevChip-kategori (klarspråk, aldri sperre-språk) */
const SEV_MAP: Record<CockpitFocusPlayer["signal"]["tone"], SevKey> = {
  alert: "sterk",
  warn: "medium",
  info: "lav",
  lime: "ok",
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** true på klient etter mount når viewport < 768px (styrer mobil-stabling). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/** Live-klokke: mm:ss siden aktiv økt startet. Seed fra server-now (data.now,
 *  minutt-oppløsning) så ingen hydrerings-avvik; klientens sekundviser overtar. */
function useLiveKlokke(startMin: number | null, nowMin: number): string {
  const seed = startMin == null ? null : Math.max(0, (nowMin - startMin) * 60);
  const [sek, setSek] = useState<number | null>(seed);
  useEffect(() => {
    if (startMin == null) return;
    const midnatt = new Date();
    midnatt.setHours(0, 0, 0, 0);
    const startMs = midnatt.getTime() + startMin * 60000;
    const tick = () => setSek(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startMin]);
  if (sek == null) return "··:··";
  const mm = Math.floor(sek / 60);
  const ss = sek % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function CockpitV2({
  data,
  innboks,
  fokus,
  aiDispatch,
}: {
  data: CockpitData;
  innboks?: InnboksSammendrag;
  fokus?: FokusData;
  aiDispatch?: AiDispatchData;
}) {
  const router = useRouter();
  const mobile = useMobile();

  // ── Aktiv økt (live) ────────────────────────────────────────────
  const aktiv =
    data.timeline.find(
      (s) => data.now >= s.startMin && data.now < s.startMin + s.durMin,
    ) ?? null;
  const klokke = useLiveKlokke(aktiv ? aktiv.startMin : null, data.now);

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* 8c.8: profilbilde ved hilsenen (samme grep som PlayerHQ-hjem). */}
        <AvatarFoto src={data.coachAvatarUrl ?? undefined} navn={data.coachFirstName} size={46} ring />
        <div>
          <Caps>{data.dayLabel} · AgencyOS · AgenticOS</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={`${data.coachFirstName}.`}>{data.greeting},</Tittel>
          </div>
        </div>
      </div>
      {data.liveSessionsCount > 0 && (
        <div className="hidden md:block">
          <StatusPill tone="down">
            Live · {pl(data.liveSessionsCount, "økt pågår", "økter pågår")}
          </StatusPill>
        </div>
      )}
    </div>
  );

  // ── Hurtigstart (Bølge 2): tre faste veier — ikke flere menypunkter ──
  const hurtig = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
      aria-label="Hurtigstart"
    >
      <Link href="/admin/planlegge" style={{ textDecoration: "none" }}>
        <CTAPill icon="target">Workbench</CTAPill>
      </Link>
      <Link href="/admin/spillere" style={{ textDecoration: "none" }}>
        <CTAPill ghost icon="users">
          Stall
        </CTAPill>
      </Link>
      <Link href="/admin/kalender" style={{ textDecoration: "none" }}>
        <CTAPill ghost icon="calendar">
          Kalender
        </CTAPill>
      </Link>
      <Link href="/admin/godkjenninger" style={{ textDecoration: "none" }}>
        <CTAPill ghost icon="inbox">
          Kø
        </CTAPill>
      </Link>
    </div>
  );

  // ── Live-bar (domain LiveBar — showroom parity) ─────────────────
  const live = aktiv ? (
    <LiveBar
      tittel={`${AKSE_NAVN[aktiv.axisLabel as AkseKey] || aktiv.axisLabel} · ${aktiv.title} — ${aktiv.playerName}`}
      tid={klokke}
      cta={aktiv.href ? "Åpne økt" : undefined}
      onClick={aktiv.href ? () => router.push(aktiv.href as string) : undefined}
    />
  ) : null;

  // ── KPI-flis (4) ────────────────────────────────────────────────
  const okterIdag = data.timeline.length;
  const trengerDeg = data.focusCount ?? data.focus.length;
  const aktiveDelta =
    data.kpis[0]?.delta && data.kpis[0].delta.tone !== "flat"
      ? { delta: data.kpis[0].delta.text, dir: data.kpis[0].delta.tone === "down" ? ("down" as const) : ("up" as const) }
      : {};
  const kpi = (
    <div className={mobile ? "grid grid-cols-2" : "grid grid-cols-2 lg:grid-cols-4"} style={{ gap: T.gap }}>
      {/* instant: dataene er ferdig hentet server-side før første maling — en
          tell-opp-fra-0-animasjon her viser bare en falsk mellomverdi i ~600ms
          før den ekte verdien vises, aldri en reell lasting. */}
      <KpiFlis label="Aktive spillere" value={data.activePlayersCount} instant {...aktiveDelta} />
      <KpiFlis
        label="Økter i dag"
        value={okterIdag}
        instant
        {...(typeof data.dagensVerdiKr === "number"
          ? { delta: `${data.dagensVerdiKr.toLocaleString("nb-NO")} kr`, dir: "up" as const }
          : {})}
      />
      <KpiFlis label="Trenger deg nå" value={trengerDeg} varsle={trengerDeg > 0} instant />
      <KpiFlis label="Stall-SG snitt" value={data.stallSgKpi} hjelp="sgTotal" instant />
    </div>
  );

  // ── G10: Triage = «Trenger deg nå» + AI-kø (AgenticOS) ──
  const koen = (
    <Kort
      eyebrow="Triage · Trenger deg nå"
      action={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/admin/godkjenninger" style={{ textDecoration: "none" }}>
            <StatusPill tone="lime">AI-kø</StatusPill>
          </Link>
          {data.focus.length > 0 ? (
            <Link href="/admin/innboks" style={{ textDecoration: "none" }}>
              <StatusPill tone="warn">{pl(data.focus.length, "sak", "saker")}</StatusPill>
            </Link>
          ) : (
            <StatusPill tone="lime">Tom</StatusPill>
          )}
        </div>
      }
    >
      {data.focus.length === 0 ? (
        <TomTilstand icon="check-circle" title="Ingen saker nå" sub="Ingen spillere trenger deg akkurat nå." />
      ) : (
        data.focus.map((p, i) => {
          const href = p.actions.find((a) => a.href)?.href;
          const sub = p.reason.map((r) => r.text).join("");
          const sterk = p.signal.tone === "alert" || p.signal.tone === "warn";
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "stretch",
                marginBottom: i === data.focus.length - 1 ? 0 : 4,
                borderRadius: 12,
                overflow: "hidden",
                background: sterk
                  ? `color-mix(in srgb, ${T.warn} 6%, transparent)`
                  : "transparent",
                border: sterk
                  ? `1px solid color-mix(in srgb, ${T.warn} 18%, ${T.border})`
                  : "1px solid transparent",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 3,
                  flex: "none",
                  background: sterk ? T.warn : "transparent",
                }}
              />
              <div style={{ flex: 1, minWidth: 0, paddingLeft: sterk ? 4 : 0 }}>
                <Rad
                  onClick={href ? () => router.push(href) : undefined}
                  leading={<AvatarInit navn={p.name} size={30} />}
                  title={
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "normal",
                      }}
                    >
                      {p.name}
                    </span>
                  }
                  sub={sub}
                  meta={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <SevChip s={SEV_MAP[p.signal.tone]} />
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>
                        {p.signal.label}
                      </span>
                    </span>
                  }
                  last
                />
              </div>
            </div>
          );
        })
      )}
    </Kort>
  );

  // ── Innboks (post@) — badge + tynn warn-strek når nye ────────────
  const innboksModul = innboks ? (
    <Link href="/admin/innboks-epost" style={{ textDecoration: "none" }}>
      <Kort
        hover
        eyebrow="Innboks"
        action={
          innboks.antallNye > 0 ? (
            <StatusPill tone="warn">{pl(innboks.antallNye, "ny", "nye")}</StatusPill>
          ) : (
            <Caps size={9}>post@</Caps>
          )
        }
        style={
          innboks.antallNye > 0
            ? {
                boxShadow: `inset 3px 0 0 ${T.warn}`,
              }
            : undefined
        }
      >
        {innboks.siste.length === 0 ? (
          <TomTilstand icon="mail" title="Ingen e-poster" sub="Innboksen er tom." />
        ) : (
          innboks.siste.map((e, i) => (
            <Rad
              key={e.id}
              leading={<AvatarInit navn={e.fraNavn ?? e.fraEpost} size={30} />}
              title={e.fraNavn ?? e.fraEpost}
              sub={e.emne}
              meta={
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{e.mottattAt}</span>
              }
              last={i === innboks.siste.length - 1}
            />
          ))
        )}
      </Kort>
    </Link>
  ) : null;

  // ── Dagens timer (OktKort / domain top 5) ───────────────────────
  const timer = (
    <Kort
      eyebrow="Dagens timer"
      action={data.timeline.length > 0 ? <Caps size={9}>{pl(data.timeline.length, "økt", "økter")}</Caps> : undefined}
      pad={data.timeline.length === 0 ? undefined : "12px"}
    >
      {data.timeline.length === 0 ? (
        <TomTilstand icon="calendar" title="Ingen økter i dag" sub="Dagen er åpen — rom for planlegging." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.timeline.map((s) => {
            const isNaa = data.now >= s.startMin && data.now < s.startMin + s.durMin;
            const sted = s.meta.find((m) => m.icon === "map-pin")?.text;
            return (
              <OktKort
                key={s.id}
                title={s.playerName}
                time={s.time}
                duration={`${s.durMin} min`}
                axis={(s.axisLabel as AkseKey) || "TEK"}
                state={isNaa ? "live" : "planned"}
                naa={isNaa}
                meta={[AKSE_NAVN[s.axisLabel as AkseKey] || s.axisLabel, s.title, sted].filter(Boolean).join(" · ")}
                onClick={s.href ? () => router.push(s.href as string) : undefined}
              />
            );
          })}
        </div>
      )}
    </Kort>
  );

  // ── Stall-uka (real: Stall-SG + plan-etterlevelse) ──────────────
  // GAP: mockupens «timer per akse»-fordeling finnes ikke i CockpitData
  //      (ingen ukentlig per-akse-aggregering) — viser de reelle stall-tallene
  //      vi HAR i stedet for å fabrikere akse-timer.
  const stalluka = (
    <Kort tint eyebrow="Stall-uka" action={<Caps size={9}>Siste 30 d</Caps>}>
      <TallHero
        label="Strokes Gained · snitt"
        value={data.stallSgKpi}
        accent={data.stallSgKpi.startsWith("+")}
        size={44}
        sub={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            {`Plan-etterlevelse ${data.planAdherenceKpi}`}
            <HjelpTips k="planEtterlevelse" size={11} />
          </span>
        }
        hjelp="sgTotal"
      />
    </Kort>
  );

  // ── AI-innsikt → Workbench ──────────────────────────────────────
  const innsiktTekst =
    trengerDeg > 0
      ? `${pl(trengerDeg, "spiller trenger", "spillere trenger")} deg nå — planlegg tiltakene samlet i Workbench.`
      : "Ingen åpne saker akkurat nå — bruk roen til å planlegge uka i Workbench.";
  const innsikt = <InnsiktChip cta="Planlegg i Workbench" href="/admin/planlegge">{innsiktTekst}</InnsiktChip>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {hurtig}
      {/* GO V3: NÅ øverst. Rekkefølgen er hierarkiet — det som pågår og det som
          trenger coachen kommer FØR KPI/fokus/innboks (som er kontekst, ikke
          handling). Cockpiten skal svare «hva gjør jeg nå» på 5 sekunder. */}
      {live}
      {aiDispatch && <AiDispatchPanelV2 data={aiDispatch} />}
      {koen}
      {kpi}
      {fokus && <FokusSpillere fokus={fokus} />}
      {innboksModul}
      <div className={mobile ? "grid grid-cols-1" : "grid grid-cols-1 lg:grid-cols-2"} style={{ gap: T.gap }}>
        {timer}
        {stalluka}
      </div>
      {innsikt}
    </div>
  );
}
