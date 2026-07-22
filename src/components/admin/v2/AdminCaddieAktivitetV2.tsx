"use client";

/**
 * AgencyOS · Caddie · Aktivitet (v2). Rekomponert fra
 * src/app/admin/(legacy)/agencyos/caddie/aktivitet/aktivitet-client.tsx med
 * v2-biblioteket. Samme datalogikk 1:1 (filtrering, dag-gruppering, KPI-er,
 * topp-spillere, hendelsesfordeling, AI-feil siste 7 dager) — kun
 * rekomponert med Kort/Rad/KpiFlis/StatusPill/FordelingRad/TomTilstand.
 *
 * Mobil: rail stables under feeden (ingen sidescroll, ingen bred tabell).
 */

import { useMemo, useState } from "react";
import { avatarBg } from "@/lib/avatar-colors";
import Link from "next/link";
import { Caps, Tittel, Kort, Rad, KpiFlis, StatusPill, FordelingRad, TomTilstand, Icon, Knapp, CTAPill, T, type StatusTone } from "@/components/v2";

export type CaddieEvent = {
  id: string;
  at: Date;
  type: "suggest" | "analyzed" | "escalate" | "flagged" | "import";
  statusKind: "ok" | "wait" | "rej" | "info";
  playerInitials: string;
  playerName: string;
  pillLabel: string;
  title: string;
  italicSpan?: string;
  confidence: number;
  followUp: "followed" | "ignored" | null;
};

export type AiError = { id: string; title: string; desc: string; at: Date };

type FilterType = CaddieEvent["type"] | "all";
type FilterDate = "today" | "yesterday" | "7d" | "all";

const TYPE_LABEL: Record<CaddieEvent["type"], string> = {
  suggest: "Forslag",
  analyzed: "Analyse",
  escalate: "Eskalering",
  flagged: "Flagg",
  import: "Import",
};
const PILL_TONE: Record<CaddieEvent["type"], StatusTone> = {
  suggest: "lime",
  analyzed: "up",
  escalate: "down",
  flagged: "warn",
  import: "info",
};
const STATUS_TONE: Record<CaddieEvent["statusKind"], StatusTone> = { ok: "up", wait: "lime", rej: "down", info: "info" };
const STATUS_LABEL: Record<CaddieEvent["statusKind"], string> = { ok: "Godkjent", wait: "Venter", rej: "Avvist", info: "Info" };

function FilterSelectV2({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none", height: 34, borderRadius: 9999, border: `1px solid ${T.borderS}`, background: T.panel2,
          padding: "0 30px 0 14px", fontFamily: T.ui, fontSize: 12.5, color: T.fg, cursor: "pointer", outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: T.panel3, color: T.fg }}>{o.label}</option>
        ))}
      </select>
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <Icon name="chevron-down" size={12} style={{ color: T.mut }} />
      </span>
    </div>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}
function relativeShort(d: Date, nowMs: number): string {
  const ms = nowMs - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "siste min";
  if (min < 60) return `${min} min`;
  const t = Math.floor(min / 60);
  const rem = min - t * 60;
  if (t < 24) return rem ? `${t}t ${rem}m` : `${t}t`;
  const dg = Math.floor(t / 24);
  return `${dg}d`;
}
function formatDayNb(d: Date): string {
  return d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
}
function groupByDay(events: ReadonlyArray<CaddieEvent>, nowMs: number) {
  const groups = new Map<string, { label: string; events: CaddieEvent[] }>();
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  for (const e of events) {
    const day = new Date(e.at);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().slice(0, 10);
    let label: string;
    if (key === today.toISOString().slice(0, 10)) label = `I dag · ${formatDayNb(day)}`;
    else if (key === yesterday.toISOString().slice(0, 10)) label = `I går · ${formatDayNb(day)}`;
    else label = formatDayNb(day);
    if (!groups.has(key)) groups.set(key, { label, events: [] });
    groups.get(key)!.events.push(e);
  }
  return Array.from(groups.entries()).map(([key, g]) => ({ key, label: g.label, events: g.events }));
}
function isFresh(d: Date, nowMs: number): boolean {
  return nowMs - d.getTime() < 60 * 60 * 1000;
}

export function AdminCaddieAktivitetV2({
  events: initialEvents,
  nowMs,
  loadError = false,
  aiErrors = [],
}: {
  events: ReadonlyArray<CaddieEvent>;
  nowMs: number;
  loadError?: boolean;
  aiErrors?: AiError[];
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterDate, setFilterDate] = useState<FilterDate>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [followups, setFollowups] = useState<Record<string, "followed" | "ignored" | null>>(() => {
    const init: Record<string, "followed" | "ignored" | null> = {};
    for (const e of initialEvents) init[e.id] = e.followUp;
    return init;
  });

  const filtered = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    return initialEvents.filter((e) => {
      if (filterType !== "all" && e.type !== filterType) return false;
      if (filterDate !== "all") {
        const age = nowMs - e.at.getTime();
        if (filterDate === "today" && age > dayMs) return false;
        if (filterDate === "yesterday" && (age < dayMs || age > 2 * dayMs)) return false;
        if (filterDate === "7d" && age > 7 * dayMs) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!e.playerName.toLowerCase().includes(q) && !e.title.toLowerCase().includes(q) && !e.pillLabel.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [initialEvents, filterType, filterDate, search, nowMs]);

  const grouped = useMemo(() => groupByDay(filtered, nowMs), [filtered, nowMs]);

  const stats = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const today = initialEvents.filter((e) => nowMs - e.at.getTime() < dayMs);
    const wait = today.filter((e) => e.statusKind === "wait").length;
    const ok = today.filter((e) => e.statusKind === "ok").length;
    const rej = today.filter((e) => e.statusKind === "rej").length;
    const conf = today.length === 0 ? 0 : today.reduce((s, e) => s + e.confidence, 0) / today.length;
    const actionable = today.filter((e) => e.type === "escalate" || e.type === "flagged").length;
    return { total: today.length, wait, ok, rej, conf, actionable, totalAll: initialEvents.length };
  }, [initialEvents, nowMs]);

  const topPlayers = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const counts = new Map<string, { name: string; initials: string; count: number }>();
    for (const e of initialEvents) {
      if (nowMs - e.at.getTime() > 7 * dayMs) continue;
      const prev = counts.get(e.playerName);
      if (prev) prev.count += 1;
      else counts.set(e.playerName, { name: e.playerName, initials: e.playerInitials, count: 1 });
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [initialEvents, nowMs]);

  const eventDistribution = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const counts: Record<CaddieEvent["type"], number> = { suggest: 0, analyzed: 0, escalate: 0, flagged: 0, import: 0 };
    let total = 0;
    for (const e of initialEvents) {
      if (nowMs - e.at.getTime() > 30 * dayMs) continue;
      counts[e.type] += 1;
      total += 1;
    }
    if (total === 0) return [];
    return (Object.keys(counts) as CaddieEvent["type"][])
      .map((type) => ({ type, label: TYPE_LABEL[type], pct: Math.round((counts[type] / total) * 100) }))
      .filter((d) => d.pct > 0)
      .sort((a, b) => b.pct - a.pct);
  }, [initialEvents, nowMs]);

  function toggleFollowup(id: string, kind: "followed" | "ignored") {
    setFollowups((s) => ({ ...s, [id]: s[id] === kind ? null : kind }));
  }

  // B: status + én primær CTA
  const statusTone: StatusTone =
    loadError ? "down" : stats.wait > 0 ? "warn" : stats.total > 0 ? "lime" : "info";
  const statusTekst = loadError
    ? "Kunne ikke laste"
    : stats.wait > 0
      ? `${stats.wait} venter i dag`
      : stats.total > 0
        ? `${stats.total} hendelser i dag`
        : "Ingen hendelser i dag";
  const primaerHref = stats.wait > 0 ? "/admin/godkjenninger" : "/admin/agencyos/caddie";
  const primaerTekst = stats.wait > 0 ? "Behandle godkjenninger" : "Åpne Caddie-chat";
  const primaerIkon = stats.wait > 0 ? "check" : "message-circle";

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>AgencyOS · Caddie-aktivitet</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="aktivitet">Caddie</Tittel>
          </div>
          <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 13, color: T.mut }}>
            I dag · {stats.total} hendelser · {stats.ok} godkjent · {stats.rej} avvist · {stats.wait} venter · snitt-konfidens {(stats.conf * 100).toFixed(0)}%
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
          {!loadError && <StatusPill tone="info">Live · auto 10s</StatusPill>}
        </div>
      </div>

      <Link href={primaerHref} style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon={primaerIkon} full>
          {primaerTekst}
        </CTAPill>
      </Link>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis label="I dag · samtaler" value={stats.total} tint />
        <KpiFlis label="Godkjenningsrate" value={`${stats.total === 0 ? 0 : Math.round((stats.ok / stats.total) * 100)}%`} />
        <KpiFlis label="Snitt-konfidens" value={stats.conf.toFixed(2)} />
        <KpiFlis label="Actionable insights" value={stats.actionable} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", flex: "1 1 260px", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "8px 14px" }}>
          <Icon name="search" size={14} style={{ color: T.mut }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk spiller, emne eller hendelse"
            style={{ flex: 1, border: "none", background: "transparent", fontFamily: T.ui, fontSize: 13, color: T.fg, outline: "none" }}
          />
        </div>
        <FilterSelectV2
          value={filterType}
          onChange={(v) => setFilterType(v as FilterType)}
          options={[
            { value: "all", label: "Type · alle" },
            { value: "suggest", label: "Foreslo økt" },
            { value: "analyzed", label: "Analyserte" },
            { value: "escalate", label: "Eskalerte" },
            { value: "flagged", label: "Flagg" },
            { value: "import", label: "Import" },
          ]}
        />
        <FilterSelectV2
          value={filterDate}
          onChange={(v) => setFilterDate(v as FilterDate)}
          options={[
            { value: "all", label: "Dato · alle" },
            { value: "today", label: "I dag" },
            { value: "yesterday", label: "I går" },
            { value: "7d", label: "Siste 7d" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ gap: T.gap, alignItems: "flex-start" }}>
        {/* Live-feed */}
        <Kort pad="0">
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.border}`, padding: "16px 20px" }}>
            <h2 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg }}>
              Live-feed <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>siste 24 timer</em>
            </h2>
            <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, color: T.mut }}>Sist synk {formatTime(new Date(nowMs))}</span>
          </div>

          <div style={{ maxHeight: 760, overflowY: "auto", padding: "6px 10px 10px" }}>
            {loadError ? (
              <div style={{ padding: "40px 16px" }}>
                <TomTilstand icon="alert-triangle" title="Kunne ikke laste Caddie-aktivitet" sub="Prøv å laste siden på nytt." />
              </div>
            ) : grouped.length === 0 ? (
              <div style={{ padding: "40px 16px" }}>
                <TomTilstand
                  icon="activity"
                  title={initialEvents.length === 0 ? "Ingen Caddie-aktivitet ennå" : "Ingen treff"}
                  sub={initialEvents.length === 0 ? "Når Caddie foreslår eller analyserer, dukker hendelsene opp her. Bruk knappen over for å starte en samtale." : "Ingen hendelser matcher filtrene — nullstill søk eller filter."}
                />
              </div>
            ) : (
              grouped.map((g) => (
                <section key={g.key}>
                  <div style={{ position: "sticky", top: 0, zIndex: 1, background: T.panel, padding: "10px 6px 6px" }}>
                    <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: T.mut }}>
                      {g.label} <span style={{ marginLeft: 6, color: T.fg, fontWeight: 700 }}>{g.events.length} hendelser</span>
                    </span>
                  </div>
                  {g.events.map((ev, i) => {
                    const open = expandedId === ev.id;
                    const fu = followups[ev.id] ?? null;
                    return (
                      <div key={ev.id}>
                        <Rad
                          last={i === g.events.length - 1 && !open}
                          onClick={() => setExpandedId(open ? null : ev.id)}
                          leading={
                            <span
                              aria-hidden
                              style={{ width: 28, height: 28, flex: "none", borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: "#fff", background: avatarBg(ev.playerName) }}
                            >
                              {ev.playerInitials}
                            </span>
                          }
                          title={
                            <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <StatusPill tone={PILL_TONE[ev.type]}>{ev.pillLabel}</StatusPill>
                              {ev.playerName}
                            </span>
                          }
                          sub={`${ev.title} · ${ev.confidence.toFixed(2)}`}
                          meta={
                            <span style={{ flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, textAlign: "right" }}>
                              {formatTime(ev.at)}
                              <span style={{ display: "block", fontSize: 9 }}>{relativeShort(ev.at, nowMs)}</span>
                            </span>
                          }
                          trailing={<StatusPill tone={STATUS_TONE[ev.statusKind]}>{STATUS_LABEL[ev.statusKind]}</StatusPill>}
                          naa={isFresh(ev.at, nowMs) && !open}
                        />
                        {open && (
                          <div style={{ margin: "0 6px 10px 44px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
                            <Caps size={9}>Full samtale-kontekst</Caps>
                            <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.5, color: T.fg2 }}>
                              Caddie-agenten konkluderte basert på SG-data, kalenderstatus og spillerens egne meldinger. Bruk knappene for å markere oppfølging — coach-handlingen logges på saken.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 8, marginTop: 8 }}>
                              <MetaFelt k="Konfidens" v={ev.confidence.toFixed(2)} />
                              <MetaFelt k="Agent" v="AI-Caddie" />
                              <MetaFelt k="Status" v={STATUS_LABEL[ev.statusKind]} />
                              <MetaFelt k="Type" v={ev.pillLabel} />
                            </div>
                            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                              <Knapp icon="check" ghost={fu !== "followed"} onClick={() => toggleFollowup(ev.id, "followed")}>Fulgt opp</Knapp>
                              <Knapp icon="x" ghost={fu !== "ignored"} onClick={() => toggleFollowup(ev.id, "ignored")}>Ignorert</Knapp>
                              {fu && (
                                <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>
                                  Markert som {fu === "followed" ? "fulgt opp" : "ignorert"}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              ))
            )}
          </div>
        </Kort>

        {/* Rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort style={{ background: T.forest }}>
            <Caps size={9} color={T.lime}>I dag · nøkkeltall</Caps>
            <div style={{ marginTop: 8 }}>
              <NokkeltallRad k="Forslag totalt" v={String(stats.total)} />
              <NokkeltallRad k="Godkjenningsrate" v={`${stats.total === 0 ? 0 : Math.round((stats.ok / stats.total) * 100)}%`} />
              <NokkeltallRad k="Snitt-konfidens" v={stats.conf.toFixed(2)} />
              <NokkeltallRad k="Eskalert til coach" v={String(stats.actionable)} last />
            </div>
          </Kort>

          <Kort>
            <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg }}>Mest aktive spillere · 7d</span>
            <Caps size={9} style={{ marginTop: 3 }}>Flest AI-interaksjoner</Caps>
            {topPlayers.length === 0 ? (
              <p style={{ marginTop: 12, fontFamily: T.mono, fontSize: 11, color: T.mut }}>Ingen aktivitet siste 7 dager.</p>
            ) : (
              <div style={{ marginTop: 4 }}>
                {topPlayers.map((p, i) => (
                  <Rad
                    key={p.name}
                    last={i === topPlayers.length - 1}
                    leading={
                      <span
                        aria-hidden
                        style={{ width: 26, height: 26, flex: "none", borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: "#fff", background: avatarBg(p.name) }}
                      >
                        {p.initials}
                      </span>
                    }
                    title={p.name}
                    trailing={
                      <span style={{ borderRadius: 9999, background: T.panel3, padding: "2px 9px", fontFamily: T.mono, fontSize: 11, fontWeight: 800, color: T.fg }}>{p.count}</span>
                    }
                  />
                ))}
              </div>
            )}
          </Kort>

          <Kort>
            <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg }}>Fordeling av hendelser · 30d</span>
            <Caps size={9} style={{ marginTop: 3 }}>Andel per hendelsestype</Caps>
            {eventDistribution.length === 0 ? (
              <p style={{ marginTop: 12, fontFamily: T.mono, fontSize: 11, color: T.mut }}>Ingen hendelser siste 30 dager.</p>
            ) : (
              <div style={{ marginTop: 8 }}>
                {eventDistribution.map((d, i) => (
                  <FordelingRad key={d.type} label={d.label} pct={d.pct} value={`${d.pct}%`} last={i === eventDistribution.length - 1} />
                ))}
              </div>
            )}
          </Kort>

          <Kort>
            <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg }}>AI-feil · siste 7 dager</span>
            <Caps size={9} style={{ marginTop: 3 }}>
              {aiErrors.length === 0 ? "Ingen rapporterte tilfeller" : `${aiErrors.length} rapportert${aiErrors.length === 1 ? "" : "e"} tilfelle${aiErrors.length === 1 ? "" : "r"}`}
            </Caps>
            {aiErrors.length === 0 ? (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, borderRadius: 10, border: `1px solid ${T.up}`, padding: 14 }}>
                <span style={{ width: 28, height: 28, flex: "none", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${T.up} 15%, transparent)`, color: T.up }}>
                  <Icon name="check" size={13} strokeWidth={2.5} />
                </span>
                <p style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Ingen agent-feil registrert siste 7 dager.</p>
              </div>
            ) : (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {aiErrors.map((er) => (
                  <div key={er.id} style={{ display: "flex", gap: 10, borderRadius: 10, border: `1px solid ${T.down}`, padding: 14 }}>
                    <span style={{ width: 28, height: 28, flex: "none", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${T.down} 15%, transparent)`, color: T.down }}>
                      <Icon name="alert-triangle" size={13} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontFamily: T.disp, fontSize: 12.5, fontWeight: 700, color: T.fg }}>
                        {er.title} <span style={{ marginLeft: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 400, color: T.mut }}>{formatTime(er.at)}</span>
                      </p>
                      <p style={{ margin: "3px 0 0", fontFamily: T.mono, fontSize: 10, color: T.mut, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{er.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Kort>
        </div>
      </div>
    </>
  );
}

function MetaFelt({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ borderRadius: 8, background: T.panel3, padding: "8px 10px" }}>
      <span style={{ display: "block", fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>{k}</span>
      <span style={{ display: "block", marginTop: 2, fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>{v}</span>
    </div>
  );
}

function NokkeltallRad({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "9px 0", borderBottom: last ? "none" : `1px solid color-mix(in srgb, var(--v2-lime) 10%, transparent)` }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(238,240,236,0.65)" }}>{k}</span>
      <span style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", color: T.lime }}>{v}</span>
    </div>
  );
}
