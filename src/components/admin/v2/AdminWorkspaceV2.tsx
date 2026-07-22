"use client";

/**
 * AgencyOS Workspace — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Oppgaver/prosjekter fra Notion-sync. T.* only.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  FilterChips,
  PillTabs,
  FordelingRad,
  AvatarInit,
  TomTilstand,
  InnsiktChip,
  CTAPill,
  T,
  type StatusTone,
} from "@/components/v2";

// ── Datakontrakt (mappes fra Prisma/cache i ruten) ──────────────
export type WorkspacePrio = "BRENNER" | "HOY" | "MED" | "LAV";
export type WorkspaceStatus = "TODO" | "DOING" | "DONE" | "BLOKKERT";

export interface AdminWorkspaceV2Task {
  id: number;
  tittel: string;
  selskap: string;
  prio: WorkspacePrio;
  due: string;
  today: boolean;
  done: boolean;
  status: WorkspaceStatus;
  brenner: boolean;
  /** Ferdig-beregnede initialer (ekte tildelt-navn fra Notion). */
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

// ── Etikett-kart (klarspråk, aldri sperre-språk) ────────────────
const PRIO: Record<WorkspacePrio, { tone: StatusTone; label: string }> = {
  BRENNER: { tone: "down", label: "Brenner" },
  HOY: { tone: "warn", label: "Høy" },
  MED: { tone: "info", label: "Med" },
  LAV: { tone: "up", label: "Lav" },
};

const STATUS_ORDER: WorkspaceStatus[] = ["DOING", "TODO", "BLOKKERT", "DONE"];
const STATUS_LABEL: Record<WorkspaceStatus, string> = {
  DOING: "Pågår",
  TODO: "Å gjøre",
  BLOKKERT: "Blokkert",
  DONE: "Fullført",
};

const PROSJEKT_STATUS: Record<WorkspaceProjectStatus, { tone: StatusTone; label: string }> = {
  AKTIV: { tone: "up", label: "Aktiv" },
  PAUSE: { tone: "warn", label: "Pause" },
  ARKIVERT: { tone: "info", label: "Arkivert" },
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

// ── Delkomponenter (inline v2-komposisjon) ──────────────────────

/** Én oppgaverad — display-only (ingen toggle i hub-en). Prioritet som pille. */
function OppgaveRad({ t, last }: { t: AdminWorkspaceV2Task; last: boolean }) {
  const p = PRIO[t.prio];
  const tildelt = t.assigned.length > 0 ? ` · ${t.assigned.join(", ")}` : "";
  return (
    <Rad
      title={
        <span style={{ opacity: t.done ? 0.55 : 1, textDecoration: t.done ? "line-through" : "none" }}>
          {t.tittel}
        </span>
      }
      sub={`${t.selskap} · ${t.due}${tildelt}`}
      meta={<StatusPill tone={p.tone}>{p.label}</StatusPill>}
      trailing={null}
      last={last}
    />
  );
}

/** Kolonne-kort for «Min uke» (I dag · Denne uka · Senere). */
function KolonneKort({
  tittel,
  under,
  tasks,
  tint,
  tomTekst,
}: {
  tittel: string;
  under?: string;
  tasks: AdminWorkspaceV2Task[];
  tint?: boolean;
  tomTekst: string;
}) {
  return (
    <Kort
      tint={tint}
      eyebrow={under ? `${tittel} · ${under}` : tittel}
      action={tasks.length > 0 ? <Caps size={9}>{tasks.length}</Caps> : undefined}
    >
      {tasks.length === 0 ? (
        <TomTilstand icon="check-circle" title="Ingen oppgaver" sub={tomTekst} />
      ) : (
        tasks.map((t, i) => <OppgaveRad key={t.id} t={t} last={i === tasks.length - 1} />)
      )}
    </Kort>
  );
}

/** Prosjektkort — selskap/status, 4 stats, fremdrift, tildelt/frist. */
function ProsjektKort({ p }: { p: AdminWorkspaceV2Project }) {
  const st = PROSJEKT_STATUS[p.status];
  const stats: { n: number; l: string; c: string }[] = [
    { n: p.open, l: "Åpne", c: T.fg },
    { n: p.doing, l: "Pågår", c: T.fg },
    { n: p.done, l: "Ferdig", c: T.up },
    { n: p.total, l: "Totalt", c: T.mut },
  ];
  return (
    <Kort hover eyebrow={p.selskap} action={<StatusPill tone={st.tone}>{st.label}</StatusPill>}>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, letterSpacing: "-0.01em" }}>
        {p.tittel}
      </div>
      <p
        style={{
          fontFamily: T.ui,
          fontSize: 12.5,
          color: T.mut,
          lineHeight: 1.5,
          margin: "6px 0 0",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {p.desc}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 14 }}>
        {stats.map((s) => (
          <div key={s.l}>
            <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: s.c, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {s.n}
            </div>
            <Caps size={8.5} style={{ marginTop: 4 }}>{s.l}</Caps>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <Caps size={9}>Fremdrift</Caps>
        <div style={{ marginTop: 8 }}>
          <FordelingRad pct={p.pct} value={`${p.done}/${p.total}`} last />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {p.assigned.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            {p.assigned.slice(0, 3).map((a, i) => (
              <span key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                <AvatarInit navn={a} size={24} />
              </span>
            ))}
          </div>
        ) : (
          <Caps size={9}>Ikke tildelt</Caps>
        )}
        <Caps size={9}>{p.due}</Caps>
      </div>
    </Kort>
  );
}

// ── Skjerm ──────────────────────────────────────────────────────
export function AdminWorkspaceV2({ data }: { data: AdminWorkspaceV2Data }) {
  const [fane, setFane] = useState<"uke" | "oppgaver" | "prosjekter">("uke");
  const [prosjektFilter, setProsjektFilter] = useState<string[]>([]);

  const tasks = data.oppgaver;

  // KPI + kolonne-avledning (samme logikk som serveren).
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

  // Oppgaver-visning: gruppert på status.
  const grupper = useMemo(
    () =>
      STATUS_ORDER.map((s) => ({
        status: s,
        rows:
          s === "DONE"
            ? tasks.filter((t) => t.done)
            : tasks.filter((t) => t.status === s && !t.done),
      })).filter((g) => g.rows.length > 0),
    [tasks],
  );

  // Prosjekter-visning: statusfilter.
  const FILTER_ITEMS = ["Aktive", "Pause", "Arkivert"];
  const filterMap: Record<string, WorkspaceProjectStatus> = {
    Aktive: "AKTIV",
    Pause: "PAUSE",
    Arkivert: "ARKIVERT",
  };
  const prosjekterFiltrert = useMemo(() => {
    if (prosjektFilter.length === 0) return data.prosjekter;
    const valgte = prosjektFilter.map((f) => filterMap[f]);
    return data.prosjekter.filter((p) => valgte.indexOf(p.status) !== -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.prosjekter, prosjektFilter]);

  const toggleFilter = (x: string) =>
    setProsjektFilter((prev) => (prev.indexOf(x) !== -1 ? prev.filter((y) => y !== x) : prev.concat(x)));

  // ── Hode — B: status ──────────────────────────────────────────
  const statusTone: StatusTone = brenner.length > 0 ? "down" : kpi.apne > 0 ? "lime" : "info";
  const statusTekst =
    brenner.length > 0
      ? `${brenner.length} brenner`
      : kpi.apne > 0
        ? `${kpi.apne} åpne`
        : "Alt klart";

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{`${data.coachNavn} · Workspace · AgencyOS`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="uke.">Min</Tittel>
        </div>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // B: én primær CTA
  const primaerCta = (
    <Link href="/admin/workspace/notion" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="refresh-cw" full>
        Synk Notion
      </CTAPill>
    </Link>
  );

  // ── KPI-flis (4) ──────────────────────────────────────────────
  const kpiFlis = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="I dag" value={kpi.iDag} />
      <KpiFlis label="Denne uka" value={kpi.denneUka} />
      <KpiFlis label="Blokkert" value={kpi.blokkert} varsle={kpi.blokkert > 0} />
      <KpiFlis label="Delt" value={kpi.delt} />
    </div>
  );

  const faner = (
    <PillTabs
      tabs={[
        { id: "uke", l: "Min uke" },
        { id: "oppgaver", l: `Oppgaver (${tasks.length})` },
        { id: "prosjekter", l: `Prosjekter (${data.prosjekter.length})` },
      ]}
      value={fane}
      onChange={(id) => setFane(id as typeof fane)}
    />
  );

  // ── «Min uke» ─────────────────────────────────────────────────
  const brennerStrip =
    brenner.length > 0 ? (
      <Kort action={<Caps size={9} color={T.down}>{pl(brenner.length, "sak", "saker")}</Caps>}>
        <div style={{ marginBottom: 12 }}>
          <StatusPill tone="down">Brenner nå</StatusPill>
        </div>
        {brenner.map((t, i) => (
          <OppgaveRad key={t.id} t={t} last={i === brenner.length - 1} />
        ))}
      </Kort>
    ) : null;

  const ukeView = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {brennerStrip}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
        <KolonneKort tittel="I dag" tasks={iDag} tint tomTekst="Ingenting forfaller i dag." />
        <KolonneKort tittel="Denne uka" tasks={denneUka} tomTekst="Uka er åpen — rom for planlegging." />
        <KolonneKort tittel="Senere" tasks={senere} tomTekst="Ingen oppgaver lenger fram." />
      </div>
    </div>
  );

  // ── «Oppgaver» (gruppert på status) ───────────────────────────
  const oppgaverView =
    tasks.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="list"
          title="Ingen oppgaver"
          sub="Koble til Notion for å synke oppgaver, eller opprett manuelt."
        />
      </Kort>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {grupper.map((g) => (
          <Kort
            key={g.status}
            eyebrow={STATUS_LABEL[g.status]}
            action={<Caps size={9}>{g.rows.length}</Caps>}
          >
            {g.rows.map((t, i) => (
              <OppgaveRad key={t.id} t={t} last={i === g.rows.length - 1} />
            ))}
          </Kort>
        ))}
      </div>
    );

  // ── «Prosjekter» ──────────────────────────────────────────────
  const prosjekterView =
    data.prosjekter.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="layers"
          title="Ingen prosjekter"
          sub="Koble til Notion for å synke prosjekter, eller opprett manuelt."
        />
      </Kort>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Caps size={9} style={{ width: 64, flex: "none" }}>Status</Caps>
          <FilterChips items={FILTER_ITEMS} active={prosjektFilter} onToggle={toggleFilter} />
        </div>
        {prosjekterFiltrert.length === 0 ? (
          <Kort>
            <TomTilstand icon="layers" title="Ingen prosjekter her" sub="Ingen prosjekter passer filteret akkurat nå." />
          </Kort>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
            {prosjekterFiltrert.map((p) => (
              <ProsjektKort key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    );

  // ── AI-innsikt → Notion / planlegging ─────────────────────────
  const innsiktTekst =
    brenner.length > 0
      ? `${pl(brenner.length, "sak brenner", "saker brenner")} og ${pl(kpi.apne, "oppgave er åpen", "oppgaver er åpne")} — ta de viktigste først.`
      : `${pl(kpi.apne, "åpen oppgave", "åpne oppgaver")} fordelt på uka. Synk med Notion for å holde lista fersk.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpiFlis}
      {primaerCta}
      {faner}
      {fane === "uke" && ukeView}
      {fane === "oppgaver" && oppgaverView}
      {fane === "prosjekter" && prosjekterView}
      <InnsiktChip cta="Åpne Notion-sync" href="/admin/workspace/notion">{innsiktTekst}</InnsiktChip>
    </div>
  );
}
