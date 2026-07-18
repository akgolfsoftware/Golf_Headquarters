"use client";

/**
 * AgencyOS Cockpit — v2 (retning C «Presis»). 1:1 med mockup-fasit
 * ui_kits/v2/agencyos.jsx → Cockpit({mobile}), men drevet av EKTE CockpitData
 * fra loadDailyBrief (Prisma). Bygget utelukkende av v2-komponentbiblioteket
 * (src/components/v2) — ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Desktop-rekkefølge: hode → live → kpi (4) → koen «Trenger deg nå» →
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
  AkseChip,
  AKSE_NAVN,
  TallHero,
  InnsiktChip,
  TomTilstand,
  CTAPill,
  HjelpTips,
  type SevKey,
} from "@/components/v2";
import { T, type AkseKey } from "@/lib/v2/tokens";
import type {
  CockpitData,
  CockpitFocusPlayer,
} from "@/components/admin/cockpit/agency-cockpit";
import type { InnboksSammendrag } from "@/lib/innboks/data";
import type { FokusData } from "@/lib/agencyos/fokus-spillere";
import { FokusSpillere } from "@/components/admin/v2/FokusSpillere";

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

export function CockpitV2({ data, innboks, fokus }: { data: CockpitData; innboks?: InnboksSammendrag; fokus?: FokusData }) {
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
          <Caps>{data.dayLabel} · AgencyOS</Caps>
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

  // ── Live-bar (kun når en økt pågår) ─────────────────────────────
  const live = aktiv ? (
    <Kort pad="12px 16px">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <StatusPill tone="down">Live</StatusPill>
        <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {AKSE_NAVN[aktiv.axisLabel as AkseKey] || aktiv.axisLabel} · {aktiv.title} — {aktiv.playerName}
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
          {klokke}
        </span>
        {aktiv.href && (
          <Link href={aktiv.href} style={{ textDecoration: "none" }} className="hidden md:inline-flex">
            <CTAPill icon="arrow-right">Åpne økt</CTAPill>
          </Link>
        )}
      </div>
    </Kort>
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

  // ── «Trenger deg nå» (kø) ───────────────────────────────────────
  const koen = (
    <Kort
      eyebrow="Trenger deg nå"
      action={
        data.focus.length > 0 ? (
          <Link href="/admin/innboks" style={{ textDecoration: "none" }}>
            <Caps size={9} color={T.down}>{pl(data.focus.length, "sak", "saker")}</Caps>
          </Link>
        ) : undefined
      }
    >
      {data.focus.length === 0 ? (
        <TomTilstand icon="check-circle" title="Ingen saker nå" sub="Ingen spillere trenger deg akkurat nå." />
      ) : (
        data.focus.map((p, i) => {
          const href = p.actions.find((a) => a.href)?.href;
          const sub = p.reason.map((r) => r.text).join("");
          return (
            <Rad
              key={p.id}
              onClick={href ? () => router.push(href) : undefined}
              leading={<AvatarInit navn={p.name} size={30} />}
              title={<span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "normal" }}>{p.name}</span>}
              sub={sub}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <SevChip s={SEV_MAP[p.signal.tone]} />
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{p.signal.label}</span>
                </span>
              }
              last={i === data.focus.length - 1}
            />
          );
        })
      )}
    </Kort>
  );

  // ── Innboks (post@akgolf.no) — kompakt: antall nye + siste 3 ────
  const innboksModul = innboks ? (
    <Link href="/admin/innboks-epost" style={{ textDecoration: "none" }}>
      <Kort
        hover
        eyebrow="Innboks"
        action={innboks.antallNye > 0 ? <Caps size={9} color={T.warn}>{pl(innboks.antallNye, "ny", "nye")}</Caps> : undefined}
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

  // ── Dagens timer ────────────────────────────────────────────────
  const timer = (
    <Kort
      eyebrow="Dagens timer"
      action={data.timeline.length > 0 ? <Caps size={9}>{pl(data.timeline.length, "økt", "økter")}</Caps> : undefined}
    >
      {data.timeline.length === 0 ? (
        <TomTilstand icon="calendar" title="Ingen økter i dag" sub="Dagen er åpen — rom for planlegging." />
      ) : (
        data.timeline.map((s, i) => {
          const isNaa = data.now >= s.startMin && data.now < s.startMin + s.durMin;
          const sted = s.meta.find((m) => m.icon === "map-pin")?.text;
          const sub = [AKSE_NAVN[s.axisLabel as AkseKey] || s.axisLabel, s.title, sted].filter(Boolean).join(" · ");
          return (
            <Rad
              key={s.id}
              onClick={s.href ? () => router.push(s.href as string) : undefined}
              leading={
                <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: isNaa ? T.lime : T.mut, fontVariantNumeric: "tabular-nums" }}>
                  {s.time}
                </span>
              }
              title={<span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "normal" }}>{s.playerName}</span>}
              sub={sub}
              meta={<AkseChip a={s.axisLabel as AkseKey} />}
              naa={isNaa}
              trailing={null}
              last={i === data.timeline.length - 1}
            />
          );
        })
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
      {fokus && <FokusSpillere fokus={fokus} />}
      {live}
      {kpi}
      {koen}
      {innboksModul}
      <div className={mobile ? "grid grid-cols-1" : "grid grid-cols-1 lg:grid-cols-2"} style={{ gap: T.gap }}>
        {timer}
        {stalluka}
      </div>
      {innsikt}
    </div>
  );
}
