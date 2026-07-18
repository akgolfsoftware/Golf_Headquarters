"use client";

/**
 * Teknisk plan (PlayerHQ) — v2-presentasjon.
 *
 * Rekomponert fra golfdata/legacy tp-*-CSS til v2-kanonspråket (retning C):
 * Kort/Caps/StatusPill/FordelingRad-mønstre + T-tokens + Icon (Lucide) +
 * HjelpTips på faguttrykkene. Ingen datalogikk her — komponentene tar ferdige,
 * serialiserbare props fra server-siden (page.tsx). Erstatter presentasjonen i
 * de gamle komponentene PRow/TaskCard/PageHead/sidebar uten å røre dem (de deles
 * fortsatt med AgencyOS-plan-skjermen).
 */

import { useState, type ReactNode } from "react";
import {
  T,
  Caps,
  Kort,
  StatusPill,
  AvatarInit,
  TomTilstand,
  HjelpTips,
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Domenetyper (speil av datakontraktene, uendret) ─────────── */
export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export interface RepPar {
  current: number;
  target: number;
}

const nb = (n: number) => n.toLocaleString("nb-NO");

/* ── Små byggeklosser ────────────────────────────────────────── */
function Merke({ dot, children }: { dot?: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: T.fg2,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        padding: "3px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: dot, flex: "none" }} />}
      {children}
    </span>
  );
}

function RepKolonne({ navn, rep }: { navn: string; rep: RepPar }) {
  const pct = rep.target > 0 ? Math.min(100, Math.round((rep.current / rep.target) * 100)) : 0;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6, marginBottom: 5 }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: T.mut }}>{navn}</span>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>
          {nb(rep.current)}
          <span style={{ color: T.mut }}> / {nb(rep.target)}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: T.lime, borderRadius: 9999 }} />
      </div>
    </div>
  );
}

function NokkelVerdi({ k, v, hjelp }: { k: string; v: ReactNode; hjelp?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "7px 0" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 12, color: T.mut }}>
        {k}
        {hjelp}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{v}</span>
    </div>
  );
}

/* ── Oppgavekort (erstatter TaskCard) ────────────────────────── */
export interface TekniskTaskKortProps {
  prio: number;
  tittel: string;
  pyramide: PyramidArea;
  omraade: string;
  koller: string[];
  lFase?: string;
  cs?: string;
  m?: string;
  pr?: string;
  reps: { dry: RepPar; lav: RepPar; full: RepPar };
  isNew?: boolean;
  onMoreClick?: () => void;
  onClick?: () => void;
}

export function TekniskTaskKort(props: TekniskTaskKortProps) {
  const { onClick } = props;
  const kolle =
    props.koller.length === 1
      ? props.koller[0].toUpperCase()
      : props.koller.length === 12
        ? "Alle køller"
        : `${props.koller.length} køller`;

  const innhold = (
    <Kort hover={!!onClick} pad="14px 15px">
      {/* Tittelrad */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          className="v2-grip"
          onClick={(e) => e.stopPropagation()}
          aria-label="Dra for å sortere"
          style={{ display: "inline-flex", color: T.mut, cursor: "grab", marginTop: 1, flex: "none" }}
        >
          <Icon name="grip-vertical" size={13} />
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, flex: "none", marginTop: 1 }}>{props.prio}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, color: T.fg, lineHeight: 1.3 }}>{props.tittel}</span>
        </div>
        {props.isNew && <StatusPill tone="lime">Ny</StatusPill>}
        <button
          type="button"
          className="v2-focus"
          onClick={(e) => {
            e.stopPropagation();
            props.onMoreClick?.();
          }}
          aria-label="Mer"
          style={{ appearance: "none", border: "none", background: "transparent", color: T.mut, cursor: "pointer", padding: 2, flex: "none", display: "inline-flex" }}
        >
          <Icon name="more-horizontal" size={15} />
        </button>
      </div>

      {/* Merkerad */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
        <Merke dot={T.ax[props.pyramide]}>{props.pyramide}</Merke>
        <Merke>{props.omraade.toUpperCase()}</Merke>
        <Merke>{kolle}</Merke>
        {props.cs && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Merke>{props.cs}</Merke>
            <HjelpTips k="csNivaa" size={11} />
          </span>
        )}
        {props.lFase && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Merke>{props.lFase}</Merke>
            <HjelpTips k="lFase" size={11} />
          </span>
        )}
        {props.m && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Merke>{props.m}</Merke>
            <HjelpTips k="miljo" size={11} />
          </span>
        )}
        {props.pr && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Merke>{props.pr}</Merke>
            <HjelpTips k="prPress" size={11} />
          </span>
        )}
      </div>

      {/* Reps */}
      <div style={{ display: "flex", gap: 14, marginTop: 13 }}>
        <RepKolonne navn="DRY" rep={props.reps.dry} />
        <RepKolonne navn="LAV" rep={props.reps.lav} />
        <RepKolonne navn="FULL" rep={props.reps.full} />
      </div>
    </Kort>
  );

  if (!onClick) return innhold;
  return (
    <div
      role="button"
      tabIndex={0}
      className="v2-focus"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ borderRadius: T.rCard }}
    >
      {innhold}
    </div>
  );
}

/* ── P-posisjon (kollapsibel seksjon, erstatter PRow) ────────── */
export interface PPosisjonSeksjonProps {
  pNumber: string;
  pName: string;
  prio?: number;
  taskCount: number;
  newCount?: number;
  lastUpdated?: string;
  repsCurrent: number;
  repsTarget: number;
  highPrio?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function PPosisjonSeksjon({
  pNumber,
  pName,
  prio,
  taskCount,
  newCount,
  lastUpdated,
  repsCurrent,
  repsTarget,
  highPrio,
  defaultOpen,
  children,
}: PPosisjonSeksjonProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <Kort pad="0" style={highPrio ? { borderLeft: `3px solid ${T.lime}` } : undefined}>
      <button
        type="button"
        className="v2-focus"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          appearance: "none",
          background: "transparent",
          border: "none",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "15px 18px",
        }}
      >
        <span
          className="v2-grip"
          onClick={(e) => e.stopPropagation()}
          aria-label="Dra for å sortere"
          style={{ display: "inline-flex", color: T.mut, cursor: "grab", flex: "none" }}
        >
          <Icon name="grip-vertical" size={13} />
        </span>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            fontWeight: 700,
            color: highPrio ? T.onLime : T.fg2,
            background: highPrio ? T.lime : T.panel3,
            border: `1px solid ${highPrio ? "transparent" : T.border}`,
            borderRadius: 8,
            padding: "5px 8px",
            flex: "none",
          }}
        >
          {pNumber}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            {prio ? (
              <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", color: T.lime, background: `color-mix(in srgb,${T.lime} 12%,transparent)`, borderRadius: 5, padding: "2px 6px" }}>
                PRIO {prio}
              </span>
            ) : null}
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: T.mut }}>
              {taskCount} OPPGAVER{newCount ? ` · ${newCount} NY` : ""}
            </span>
            {lastUpdated ? (
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: T.mut }}>SIST OPPDATERT {lastUpdated}</span>
            ) : null}
          </div>
        </div>
        <div style={{ textAlign: "right", flex: "none" }}>
          <div style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
            {nb(repsCurrent)} / {nb(repsTarget)}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", color: T.mut }}>REPS</div>
        </div>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={15} style={{ color: open ? T.lime : T.mut, flex: "none" }} />
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 16px 16px" }}>{children}</div>
      )}
    </Kort>
  );
}

/* ── Sidebar: Plan-sammendrag ────────────────────────────────── */
export interface PlanSammendragKortProps {
  status: string;
  statusTone: StatusTone;
  progressPct: number;
  repsCurrent: number;
  repsTarget: number;
  activePCount: number;
  activePTotal: number;
  taskCount: number;
  taskNewCount: number;
  repsThisWeek: number;
  estimertFerdig?: string;
}

export function PlanSammendragKort(props: PlanSammendragKortProps) {
  return (
    <Kort eyebrow="Plan-sammendrag" action={<StatusPill tone={props.statusTone}>{props.status}</StatusPill>}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Caps size={9}>Total fremdrift</Caps>
        <HjelpTips k="planEtterlevelse" size={11} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
        <span style={{ fontFamily: T.mono, fontSize: 34, fontWeight: 700, color: T.lime, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>{props.progressPct}</span>
        <span style={{ fontFamily: T.mono, fontSize: 14, color: T.mut }}>%</span>
      </div>
      <div style={{ height: 7, borderRadius: 9999, background: T.track, overflow: "hidden", marginTop: 12 }}>
        <div style={{ width: `${Math.min(100, props.progressPct)}%`, height: "100%", background: T.lime, borderRadius: 9999 }} />
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.5, margin: "10px 0 0" }}>
        <span style={{ color: T.fg2, fontWeight: 600 }}>{nb(props.repsCurrent)}</span> av{" "}
        <span style={{ color: T.fg2, fontWeight: 600 }}>{nb(props.repsTarget)}</span> reps logget · siste 14 dager
      </p>

      <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}` }}>
        <NokkelVerdi k="Aktive P-er" v={`${props.activePCount} av ${props.activePTotal}`} />
        <NokkelVerdi k="Oppgaver" v={`${props.taskCount}${props.taskNewCount ? ` + ${props.taskNewCount} ny` : ""}`} />
        <NokkelVerdi k="Reps denne uka" v={nb(props.repsThisWeek)} />
        {props.estimertFerdig ? <NokkelVerdi k="Estimert ferdig" v={props.estimertFerdig} /> : null}
      </div>
    </Kort>
  );
}

/* ── Sidebar: TrackMan-mål per kølle ─────────────────────────── */
export type KolleStatus = "OK" | "PATH" | "TODO";

export interface KolleMaalRad {
  club: string;
  metric: string;
  goalMin?: string;
  goalMax?: string;
  status: KolleStatus;
}

const STATUS_TONE: Record<KolleStatus, StatusTone> = { OK: "up", PATH: "warn", TODO: "info" };
const STATUS_LABEL: Record<KolleStatus, string> = { OK: "Oppnådd", PATH: "På vei", TODO: "Ikke begynt" };

export function TrackmanMaalKort({ rows }: { rows: KolleMaalRad[] }) {
  const paaVei = rows.filter((r) => r.status !== "TODO").length;
  return (
    <Kort
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          TrackMan-mål per kølle
          <HjelpTips k="trackman" size={11} />
        </span>
      }
      action={<Caps size={9}>{`${paaVei} / ${rows.length} på vei`}</Caps>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${T.border}` }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <Icon name="target" size={12} style={{ color: T.mut }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.club}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 2 }}>
                {r.metric.toUpperCase()}
                {r.goalMin ? ` ≥ ${r.goalMin}` : ""}
                {r.goalMax ? ` ≤ ${r.goalMax}` : ""}
              </div>
            </div>
            <StatusPill tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</StatusPill>
          </div>
        ))}
      </div>
    </Kort>
  );
}

/* ── Sidebar: Pyramide-fordeling ─────────────────────────────── */
export interface PyramideRad {
  area: PyramidArea;
  pct: number;
}

export function PyramideFordelingKort({ rows }: { rows: PyramideRad[] }) {
  return (
    <Kort
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          Pyramide-fordeling
          <HjelpTips k="pyramideAkse" size={11} />
        </span>
      }
      action={<Caps size={9}>Volum siste 30d</Caps>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {rows.map((r) => (
          <div key={r.area} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 40, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, flex: "none" }}>{r.area}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, r.pct)}%`, height: "100%", background: T.ax[r.area], borderRadius: 9999 }} />
            </div>
            <span style={{ width: 34, textAlign: "right", fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums", flex: "none" }}>{r.pct} %</span>
          </div>
        ))}
      </div>
    </Kort>
  );
}

/* ── Sidebar: Coach & aktivitet ──────────────────────────────── */
export type AktivitetKind = "add" | "comment" | "edit";

export interface AktivitetRad {
  kind: AktivitetKind;
  actorName: string;
  actorFirstName: string;
  actionLabel: string;
  timestamp: string;
}

const KIND_BADGE: Record<AktivitetKind, string> = { add: "+ NY", comment: "KMT", edit: "REDIG" };

export interface CoachAktivitetKortProps {
  coachName: string;
  coachRole: string;
  items: AktivitetRad[];
}

export function CoachAktivitetKort({ coachName, coachRole, items }: CoachAktivitetKortProps) {
  return (
    <Kort eyebrow="Coach & aktivitet" action={<Caps size={9}>Siste 24t</Caps>}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
        <AvatarInit navn={coachName} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>{coachName}</div>
          <Caps size={9} style={{ marginTop: 2 }}>{coachRole}</Caps>
        </div>
        <span
          role="button"
          tabIndex={0}
          aria-label="Send melding"
          className="v2-focus"
          style={{ width: 30, height: 30, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}
        >
          <Icon name="message-square" size={13} style={{ color: T.fg2 }} />
        </span>
      </div>

      {items.length === 0 ? (
        <TomTilstand icon="history" title="Ingen aktivitet enda" sub="Aktivitet fra deg og coachen vises her når planen endres." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.border}` }}>
              <AvatarInit navn={it.actorName} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: T.fg }}>{it.actorFirstName}</span> {it.actionLabel}
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{it.timestamp}</span>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", color: it.kind === "add" ? T.lime : T.mut, background: T.panel3, border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px", flex: "none" }}>
                {KIND_BADGE[it.kind]}
              </span>
            </div>
          ))}
        </div>
      )}
    </Kort>
  );
}

/* ── Tom plan (ærlig tomtilstand) ────────────────────────────── */
export function TomPlan({ children }: { children?: ReactNode }) {
  return (
    <Kort>
      <TomTilstand
        icon="target"
        title="Ingen P-posisjoner i denne planen enda"
        sub="Legg til P-posisjoner (P1.0 – P10.0) du vil fokusere på i denne perioden."
      />
      {children ? <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>{children}</div> : null}
    </Kort>
  );
}
