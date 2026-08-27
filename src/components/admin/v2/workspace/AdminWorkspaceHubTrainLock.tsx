"use client";

/**
 * AgencyOS Workspace — Train-lock (T13-restside, 27.08.2026, se
 * docs/natt/D-LYS-OG-5T-BESLUTNING.md §0.8).
 *
 * Mønster-port av `AdminWorkspaceV2` (Paper) — samme datakontrakt
 * (AdminWorkspaceV2Data/Task/Project). Oppgaver fra KommandoTask,
 * prosjekter fra ProsjektCache (Notion-sync) — uendret, se page.tsx.
 * Ingen egen fasit tegner denne skjermen — port med tl-kit-primitiver.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlCaps, TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand, TL_PRESS } from "../oppsett/tl-kit";
import { TlFilterChip } from "./tl-workspace-kit";

export type WorkspacePrio = "BRENNER" | "HOY" | "MED" | "LAV";
export type WorkspaceStatus = "TODO" | "DOING" | "DONE" | "BLOKKERT";

export interface AdminWorkspaceV2Task {
  id: string;
  tittel: string;
  selskap: string;
  prio: WorkspacePrio;
  due: string;
  today: boolean;
  done: boolean;
  status: WorkspaceStatus;
  brenner: boolean;
  assigned: string[];
}

export type WorkspaceProjectStatus = "AKTIV" | "PAUSE" | "ARKIVERT";

export interface AdminWorkspaceV2Project {
  id: string;
  tittel: string;
  selskap: string;
  desc: string;
  open: number;
  doing: number;
  done: number;
  total: number;
  pct: number;
  status: WorkspaceProjectStatus;
  due: string;
  assigned: string[];
}

export interface AdminWorkspaceV2Data {
  coachNavn: string;
  oppgaver: AdminWorkspaceV2Task[];
  prosjekter: AdminWorkspaceV2Project[];
}

const PRIO_LABEL: Record<WorkspacePrio, string> = { BRENNER: "Brenner", HOY: "Høy", MED: "Med", LAV: "Lav" };
const PRIO_FARGE: Record<WorkspacePrio, string> = { BRENNER: TL.danger, HOY: TL.warn, MED: TL.text, LAV: TL.mute };

const STATUS_ORDER: WorkspaceStatus[] = ["DOING", "TODO", "BLOKKERT", "DONE"];
const STATUS_LABEL: Record<WorkspaceStatus, string> = { DOING: "Pågår", TODO: "Å gjøre", BLOKKERT: "Blokkert", DONE: "Fullført" };

const PROSJEKT_STATUS_LABEL: Record<WorkspaceProjectStatus, string> = { AKTIV: "Aktiv", PAUSE: "Pause", ARKIVERT: "Arkivert" };

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

function PrioMerke({ prio }: { prio: WorkspacePrio }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: prio === "MED" ? TL.text : PRIO_FARGE[prio], boxShadow: `inset 0 0 0 1px ${prio === "BRENNER" ? TL.danger : prio === "HOY" ? TL.warnHair : TL.hair}` }}>
      {PRIO_LABEL[prio]}
    </span>
  );
}

function ProsjektStatusMerke({ status }: { status: WorkspaceProjectStatus }) {
  const farge = status === "AKTIV" ? TL.ok : status === "PAUSE" ? TL.warn : TL.mute;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: farge, boxShadow: `inset 0 0 0 1px ${status === "PAUSE" ? TL.warnHair : TL.hair}` }}>
      {PROSJEKT_STATUS_LABEL[status]}
    </span>
  );
}

function OppgaveRad({ t, last }: { t: AdminWorkspaceV2Task; last: boolean }) {
  const tildelt = t.assigned.length > 0 ? ` · ${t.assigned.join(", ")}` : "";
  return (
    <TlRad
      chevron={false}
      last={last}
      title={<span style={{ opacity: t.done ? 0.55 : 1, textDecoration: t.done ? "line-through" : "none" }}>{t.tittel}</span>}
      sub={`${t.selskap} · ${t.due}${tildelt}`}
      meta={<PrioMerke prio={t.prio} />}
    />
  );
}

function KolonneKort({ tittel, tasks, tomTekst }: { tittel: string; tasks: AdminWorkspaceV2Task[]; tomTekst: string }) {
  return (
    <TlKort eyebrow={tittel} action={tasks.length > 0 ? <TlCaps size={9}>{tasks.length}</TlCaps> : undefined} pad="16px 18px">
      {tasks.length === 0 ? (
        <TlTomTilstand icon="check-circle" title="Ingen oppgaver" sub={tomTekst} />
      ) : (
        tasks.map((t, i) => <OppgaveRad key={t.id} t={t} last={i === tasks.length - 1} />)
      )}
    </TlKort>
  );
}

function ProsjektKort({ p }: { p: AdminWorkspaceV2Project }) {
  const stats: { n: number; l: string; c: string }[] = [
    { n: p.open, l: "Åpne", c: TL.text },
    { n: p.doing, l: "Pågår", c: TL.text },
    { n: p.done, l: "Ferdig", c: TL.ok },
    { n: p.total, l: "Totalt", c: TL.mute },
  ];
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <TlCaps size={9}>{p.selskap}</TlCaps>
        <ProsjektStatusMerke status={p.status} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: TL.text, letterSpacing: "-0.01em" }}>{p.tittel}</div>
      <p style={{ fontSize: 12.5, color: TL.mute, lineHeight: 1.5, margin: "6px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 14 }}>
        {stats.map((s) => (
          <div key={s.l}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.c, fontVariantNumeric: "tabular-nums", lineHeight: 1, fontFamily: TL.font.mono }}>{s.n}</div>
            <TlCaps size={8.5}>{s.l}</TlCaps>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <TlCaps size={9}>Fremdrift</TlCaps>
        <div style={{ marginTop: 8, height: 5, borderRadius: 999, background: TL.dim, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, width: `${p.pct}%`, background: TL.warm }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${TL.hair}` }}>
        {p.assigned.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            {p.assigned.slice(0, 3).map((a, i) => (
              <span
                key={i}
                style={{
                  marginLeft: i === 0 ? 0 : -8,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: TL.avatar,
                  color: TL.onAvatar,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 0 2px ${TL.elev}`,
                }}
              >
                {a.trim().charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
        ) : (
          <TlCaps size={9}>Ikke tildelt</TlCaps>
        )}
        <TlCaps size={9}>{p.due}</TlCaps>
      </div>
    </div>
  );
}

export function AdminWorkspaceHubTrainLock({ data }: { data: AdminWorkspaceV2Data }) {
  const [fane, setFane] = useState<"uke" | "oppgaver" | "prosjekter">("uke");
  const [prosjektFilter, setProsjektFilter] = useState<string[]>([]);

  const tasks = data.oppgaver;

  const brenner = useMemo(() => tasks.filter((t) => t.brenner && !t.done), [tasks]);
  const iDag = useMemo(() => tasks.filter((t) => t.today), [tasks]);
  const denneUka = useMemo(() => tasks.filter((t) => !t.today && !t.done).slice(0, 5), [tasks]);
  const senere = useMemo(() => tasks.slice(10), [tasks]);

  const kpi = useMemo(() => {
    const denneUkaAntall = tasks.filter((t) => !t.today && !t.done).length;
    const blokkert = tasks.filter((t) => t.status === "BLOKKERT").length;
    const delt = tasks.filter((t) => t.assigned.length > 1).length;
    const apne = tasks.filter((t) => !t.done).length;
    return { iDag: iDag.length, denneUka: denneUkaAntall, blokkert, delt, apne };
  }, [tasks, iDag]);

  const grupper = useMemo(
    () => STATUS_ORDER.map((s) => ({ status: s, rows: s === "DONE" ? tasks.filter((t) => t.done) : tasks.filter((t) => t.status === s && !t.done) })).filter((g) => g.rows.length > 0),
    [tasks],
  );

  const FILTER_ITEMS: { key: string; farge: WorkspaceProjectStatus }[] = [
    { key: "Aktive", farge: "AKTIV" },
    { key: "Pause", farge: "PAUSE" },
    { key: "Arkivert", farge: "ARKIVERT" },
  ];
  const filterMap: Record<string, WorkspaceProjectStatus> = { Aktive: "AKTIV", Pause: "PAUSE", Arkivert: "ARKIVERT" };
  const prosjekterFiltrert = useMemo(() => {
    if (prosjektFilter.length === 0) return data.prosjekter;
    const valgte = prosjektFilter.map((f) => filterMap[f]);
    return data.prosjekter.filter((p) => valgte.indexOf(p.status) !== -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.prosjekter, prosjektFilter]);

  const toggleFilter = (x: string) => setProsjektFilter((prev) => (prev.indexOf(x) !== -1 ? prev.filter((y) => y !== x) : prev.concat(x)));

  const statusTekst = brenner.length > 0 ? `${brenner.length} brenner` : kpi.apne > 0 ? `${kpi.apne} åpne` : "Alt klart";
  const statusFarge = brenner.length > 0 ? TL.danger : kpi.apne > 0 ? TL.warn : TL.ok;

  const faner: { id: "uke" | "oppgaver" | "prosjekter"; label: string }[] = [
    { id: "uke", label: "Min uke" },
    { id: "oppgaver", label: `Oppgaver (${tasks.length})` },
    { id: "prosjekter", label: `Prosjekter (${data.prosjekter.length})` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <TlTittel sub="AgencyOS">Workspace</TlTittel>
        <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: statusFarge, boxShadow: `inset 0 0 0 1px ${brenner.length > 0 ? TL.danger : TL.hair}` }}>
          {statusTekst}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "I dag", value: kpi.iDag },
          { label: "Denne uka", value: kpi.denneUka },
          { label: "Blokkert", value: kpi.blokkert, varsle: kpi.blokkert > 0 },
          { label: "Delt", value: kpi.delt },
        ].map((k) => (
          <div key={k.label} style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px" }}>
            <TlCaps size={10}>{k.label}</TlCaps>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: k.varsle ? TL.warn : TL.text, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
          </div>
        ))}
      </div>

      <Link href="/admin/workspace/notion" style={{ textDecoration: "none", display: "block" }}>
        <TlKnapp variant="primaer" icon="refresh-cw" full>Synk Notion</TlKnapp>
      </Link>

      <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${TL.hair}` }}>
        {faner.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFane(f.id)}
            className={TL_PRESS}
            style={{
              padding: "10px 14px",
              marginBottom: -1,
              borderBottom: `2px solid ${fane === f.id ? TL.text : "transparent"}`,
              background: "transparent",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              color: fane === f.id ? TL.text : TL.mute,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {fane === "uke" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {brenner.length > 0 && (
            <TlKort action={<TlCaps size={9}>{pl(brenner.length, "sak", "saker")}</TlCaps>} pad="16px 18px">
              <div style={{ marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: TL.danger, boxShadow: `inset 0 0 0 1px ${TL.danger}` }}>Brenner nå</span>
              </div>
              {brenner.map((t, i) => <OppgaveRad key={t.id} t={t} last={i === brenner.length - 1} />)}
            </TlKort>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "start" }}>
            <KolonneKort tittel="I dag" tasks={iDag} tomTekst="Ingenting forfaller i dag." />
            <KolonneKort tittel="Denne uka" tasks={denneUka} tomTekst="Uka er åpen — rom for planlegging." />
            <KolonneKort tittel="Senere" tasks={senere} tomTekst="Ingen oppgaver lenger fram." />
          </div>
        </div>
      )}

      {fane === "oppgaver" && (
        tasks.length === 0 ? (
          <TlKort pad="18px 20px"><TlTomTilstand icon="list" title="Ingen oppgaver" sub="Koble til Notion for å synke oppgaver, eller opprett manuelt." /></TlKort>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {grupper.map((g) => (
              <TlKort key={g.status} eyebrow={STATUS_LABEL[g.status]} action={<TlCaps size={9}>{g.rows.length}</TlCaps>} pad="16px 18px">
                {g.rows.map((t, i) => <OppgaveRad key={t.id} t={t} last={i === g.rows.length - 1} />)}
              </TlKort>
            ))}
          </div>
        )
      )}

      {fane === "prosjekter" && (
        data.prosjekter.length === 0 ? (
          <TlKort pad="18px 20px"><TlTomTilstand icon="layers" title="Ingen prosjekter" sub="Koble til Notion for å synke prosjekter, eller opprett manuelt." /></TlKort>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <TlCaps size={9}>Status</TlCaps>
              {FILTER_ITEMS.map((f) => (
                <TlFilterChip key={f.key} label={f.key} active={prosjektFilter.indexOf(f.key) !== -1} onClick={() => toggleFilter(f.key)} />
              ))}
            </div>
            {prosjekterFiltrert.length === 0 ? (
              <TlKort pad="18px 20px"><TlTomTilstand icon="layers" title="Ingen prosjekter her" sub="Ingen prosjekter passer filteret akkurat nå." /></TlKort>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "start" }}>
                {prosjekterFiltrert.map((p) => <ProsjektKort key={p.id} p={p} />)}
              </div>
            )}
          </div>
        )
      )}

      <div style={{ display: "flex", gap: 10, background: TL.elev, borderRadius: TL.radius.card, padding: "14px 18px", alignItems: "flex-start" }}>
        <Icon name="sparkles" size={16} style={{ color: TL.warm, flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12.5, color: TL.text, lineHeight: 1.6, margin: 0, flex: 1 }}>
          {brenner.length > 0
            ? `${pl(brenner.length, "sak brenner", "saker brenner")} og ${pl(kpi.apne, "oppgave er åpen", "oppgaver er åpne")} — ta de viktigste først.`
            : `${pl(kpi.apne, "åpen oppgave", "åpne oppgaver")} fordelt på uka. Synk med Notion for å holde lista fersk.`}
          {" "}
          <Link href="/admin/workspace/notion" className={TL_PRESS} style={{ color: TL.warm, fontWeight: 700, textDecoration: "none" }}>Åpne Notion-sync →</Link>
        </p>
      </div>
    </div>
  );
}
