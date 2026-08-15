"use client";

/**
 * Plan → Kalender.
 *
 * Før var dette én lang liste på mobil, uten uketall og uten skille mellom
 * økt, turnering og prøve — eleven mistet følelsen av hvor tett uka er.
 *
 * Nå: mobil får agenda gruppert på uke, desktop får månedsrutenett med
 * detaljpanel for valgt uke. Ferieuker tones ned, aldri skjules — en uke uten
 * trening er informasjon, ikke et hull. Turnering og prøve står som merke med
 * tekst, aldri som en prikk uten forklaring.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  MONTHS_NO,
  MONTH_ORDER,
  PERIODS,
  PERIOD_COL,
  SESSION_BY_ISO,
  SESSIONS,
  weekStartOf,
} from "../_data/wang-plan";
import { byggLiveKalenderHendelser, type DagHendelse } from "../_data/live-sesong";
import type { WangLiveData } from "../_data/hent-wang-gruppe";
import { Arshjul } from "./arshjul";

type HendelseType = DagHendelse["type"];

const TYPE_LABEL: Record<HendelseType, string> = {
  okt: "Treningsøkt",
  konkurranse: "Turnering",
  prove: "Prøve",
  skole: "Skole",
  samling: "Samling",
};
const TYPE_FARGE: Record<HendelseType, string> = {
  okt: "var(--wang-teal)",
  konkurranse: "var(--cat-orange)",
  prove: "var(--cat-purple)",
  skole: "var(--cat-blue)",
  samling: "var(--wang-navy)",
};
/** Merke-tint per type, til de som skal LESES i en celle (turnering, prøve). */
const TYPE_TINT: Record<HendelseType, { bg: string; fg: string }> = {
  okt: { bg: "var(--tint-teal)", fg: "var(--wang-teal-text)" },
  konkurranse: { bg: "var(--tint-orange)", fg: "var(--cat-orange-text)" },
  prove: { bg: "var(--tint-purple)", fg: "var(--cat-purple)" },
  skole: { bg: "var(--tint-blue)", fg: "var(--cat-blue-text)" },
  samling: { bg: "var(--tint-navy)", fg: "var(--wang-navy)" },
};

const UKEDAG_KORT = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];
const UKEDAG_LANG = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function isoOf(y: number, m: number, dag: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(dag).padStart(2, "0")}`;
}

/** ISO-ukenummer. Fasiten viser «Uke 36», altså kalenderuke, ikke sesonguke. */
function isoUke(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const nyttar = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - nyttar.getTime()) / 864e5 + 1) / 7);
}

function periodeForIso(iso: string): (typeof PERIODS)[number] | null {
  return PERIODS.find((p) => iso >= p.start && iso <= p.end) ?? null;
}

function kortSpenn(a: Date, b: Date): string {
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()}.–${b.getDate()}. ${MONTHS_NO[b.getMonth()]}`
    : `${a.getDate()}. ${MONTHS_NO[a.getMonth()]} – ${b.getDate()}. ${MONTHS_NO[b.getMonth()]}`;
}

// ---- Én hendelsesrad, delt av mobil-agenda og desktop-ukepanel ----------

function HendelseRad({
  dagIso,
  h,
  onOpen,
  visDag,
}: {
  dagIso: string;
  h: DagHendelse;
  onOpen: (id: string) => void;
  visDag: boolean;
}) {
  const sesjon = h.type === "okt" ? SESSION_BY_ISO[dagIso] : undefined;
  const klikkbar = !!sesjon;
  const d = new Date(`${dagIso}T12:00:00`);
  const merke = h.type === "konkurranse" || h.type === "prove" || h.type === "samling";

  const innhold = (
    <>
      <span
        style={{
          width: 4,
          alignSelf: "stretch",
          minHeight: 34,
          borderRadius: 999,
          background: TYPE_FARGE[h.type],
          flex: "none",
        }}
      />
      {visDag ? (
        <span
          className="wang-num"
          style={{
            width: 44,
            flex: "none",
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          {UKEDAG_LANG[(d.getDay() + 6) % 7]} {d.getDate()}.
        </span>
      ) : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        <b
          style={{
            display: "block",
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {h.label}
        </b>
        <span
          style={{
            display: "block",
            fontSize: 11.5,
            color: "var(--text-secondary)",
            marginTop: 1,
          }}
        >
          {TYPE_LABEL[h.type]}
          {h.time ? ` · ${h.time}` : ""}
          {h.sted ? ` · ${h.sted}` : ""}
        </span>
      </span>
      {merke ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 22,
            padding: "0 9px",
            borderRadius: "var(--radius-chip)",
            background: TYPE_TINT[h.type].bg,
            color: TYPE_TINT[h.type].fg,
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 10,
            flex: "none",
          }}
        >
          {TYPE_LABEL[h.type]}
        </span>
      ) : null}
      {klikkbar ? (
        <ChevronRight
          size={16}
          strokeWidth={2.5}
          aria-hidden
          style={{ color: "var(--neutral-400)", flex: "none" }}
        />
      ) : null}
    </>
  );

  const stil: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    // 44px minste trykkmål — også når raden bare har én linje tekst.
    minHeight: 44,
    padding: "7px 0",
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    minWidth: 0,
  };

  return klikkbar ? (
    <button
      type="button"
      onClick={() => onOpen(sesjon!.id)}
      className="wang-pressable"
      style={{ ...stil, cursor: "pointer" }}
    >
      {innhold}
    </button>
  ) : (
    <div style={stil}>{innhold}</div>
  );
}

// ---- Mobil: agenda gruppert på uke -------------------------------------

function UkeAgenda({
  y,
  m,
  hendelser,
  naaIso,
  onOpen,
}: {
  y: number;
  m: number;
  hendelser: Record<string, DagHendelse[]>;
  naaIso: string;
  onOpen: (id: string) => void;
}) {
  const dagerIMnd = new Date(y, m + 1, 0).getDate();
  const uker = new Map<number, { start: Date; slutt: Date; dager: string[] }>();

  for (let dag = 1; dag <= dagerIMnd; dag++) {
    const dIso = isoOf(y, m, dag);
    const d = new Date(`${dIso}T12:00:00`);
    const uke = isoUke(d);
    if (!uker.has(uke)) {
      const start = weekStartOf(d);
      const slutt = new Date(start);
      slutt.setDate(slutt.getDate() + 6);
      uker.set(uke, { start, slutt, dager: [] });
    }
    uker.get(uke)!.dager.push(dIso);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[...uker.entries()].map(([uke, info]) => {
        const rader = info.dager.flatMap((dIso) =>
          (hendelser[dIso] ?? []).map((h) => ({ dIso, h })),
        );
        // En uke uten trening er informasjon — tonet ned, aldri skjult.
        const tom = rader.length === 0;
        const harNaa = info.dager.includes(naaIso);
        return (
          <section
            key={uke}
            className="wang-card"
            style={{
              padding: "12px 14px",
              opacity: tom ? 0.62 : 1,
              border: harNaa ? "2px solid var(--wang-teal)" : "2px solid transparent",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingBottom: tom ? 0 : 6,
                borderBottom: tom ? "none" : "1px solid var(--border-subtle)",
              }}
            >
              <span
                className="t-label"
                style={{ color: "var(--text-primary)", fontWeight: 800 }}
              >
                Uke {uke}
              </span>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  background: "var(--neutral-300)",
                }}
              />
              <span
                className="wang-num"
                style={{ fontSize: 12, color: "var(--text-secondary)" }}
              >
                {kortSpenn(info.start, info.slutt)}
              </span>
            </div>
            {tom ? (
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--text-secondary)" }}>
                Ingen trening denne uka.
              </p>
            ) : (
              rader.map(({ dIso, h }, i) => (
                <HendelseRad key={`${dIso}-${i}`} dagIso={dIso} h={h} onOpen={onOpen} visDag />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}

// ---- Desktop: månedsrutenett + ukepanel --------------------------------

function MaanedRutenett({
  y,
  m,
  hendelser,
  naaIso,
  valgtUke,
  setValgtUke,
}: {
  y: number;
  m: number;
  hendelser: Record<string, DagHendelse[]>;
  naaIso: string;
  valgtUke: number | null;
  setValgtUke: (u: number) => void;
}) {
  const forste = new Date(y, m, 1);
  const startOffset = (forste.getDay() + 6) % 7;
  const dager = new Date(y, m + 1, 0).getDate();

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 6,
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        {UKEDAG_KORT.map((d) => (
          <span key={d} className="t-label" style={{ color: "var(--text-secondary)" }}>
            {d}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {Array.from({ length: startOffset }).map((_, i) => (
          <span key={`t${i}`} />
        ))}
        {Array.from({ length: dager }).map((_, i) => {
          const dag = i + 1;
          const dIso = isoOf(y, m, dag);
          const d = new Date(`${dIso}T12:00:00`);
          const uke = isoUke(d);
          const evs = hendelser[dIso] ?? [];
          const okt = evs.find((e) => e.type === "okt");
          const merke = evs.find((e) => e.type === "konkurranse" || e.type === "prove");
          const erIDag = dIso === naaIso;
          const iValgtUke = valgtUke === uke;

          return (
            <button
              key={dIso}
              type="button"
              onClick={() => setValgtUke(uke)}
              className="wang-pressable"
              aria-label={`${dag}. ${MONTHS_NO[m]}${evs.length ? ` — ${evs.length} hendelse${evs.length === 1 ? "" : "r"}` : ""}`}
              style={{
                // Hele dagscellen er trykkbar, minst 44px.
                minHeight: 56,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 3,
                padding: "5px 5px 6px",
                borderRadius: 12,
                border: erIDag ? "2px solid var(--wang-teal)" : "2px solid transparent",
                boxSizing: "border-box",
                cursor: "pointer",
                textAlign: "left",
                background: iValgtUke ? "var(--tint-navy)" : "var(--neutral-50)",
              }}
            >
              <span
                className="wang-num"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: evs.length || erIDag ? 700 : 500,
                  color: "var(--text-primary)",
                }}
              >
                {dag}
              </span>
              {okt ? (
                <span
                  style={{
                    display: "block",
                    padding: "2px 5px",
                    borderRadius: 5,
                    background: TYPE_TINT.okt.bg,
                    color: TYPE_TINT.okt.fg,
                    fontFamily: "var(--font-brand)",
                    fontWeight: 700,
                    fontSize: 9,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {okt.time ?? "Økt"}
                </span>
              ) : null}
              {merke ? (
                <span
                  style={{
                    display: "block",
                    padding: "2px 5px",
                    borderRadius: 5,
                    background: TYPE_TINT[merke.type].bg,
                    color: TYPE_TINT[merke.type].fg,
                    fontFamily: "var(--font-brand)",
                    fontWeight: 700,
                    fontSize: 9,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {TYPE_LABEL[merke.type]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UkePanel({
  uke,
  y,
  m,
  hendelser,
  onOpen,
}: {
  uke: number;
  y: number;
  m: number;
  hendelser: Record<string, DagHendelse[]>;
  onOpen: (id: string) => void;
}) {
  const dagerIMnd = new Date(y, m + 1, 0).getDate();
  const dager: string[] = [];
  for (let dag = 1; dag <= dagerIMnd; dag++) {
    const dIso = isoOf(y, m, dag);
    if (isoUke(new Date(`${dIso}T12:00:00`)) === uke) dager.push(dIso);
  }
  if (dager.length === 0) return null;

  const start = weekStartOf(new Date(`${dager[0]}T12:00:00`));
  const slutt = new Date(start);
  slutt.setDate(slutt.getDate() + 6);

  const rader = dager.flatMap((dIso) => (hendelser[dIso] ?? []).map((h) => ({ dIso, h })));
  const antallOkter = rader.filter((r) => r.h.type === "okt").length;
  const antallMerker = rader.filter(
    (r) => r.h.type === "konkurranse" || r.h.type === "prove",
  ).length;

  return (
    <section className="wang-card" style={{ padding: "16px 18px", alignSelf: "start" }}>
      <span
        style={{
          display: "block",
          fontFamily: "var(--font-brand)",
          fontWeight: 800,
          fontSize: 14,
          color: "var(--text-primary)",
        }}
      >
        Uke {uke} · {kortSpenn(start, slutt)}
      </span>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Telle verdi={antallOkter} label="Økter" />
        <Telle verdi={antallOkter * 2} label="Timer" />
        <Telle verdi={antallMerker} label="Merket" />
      </div>

      <div style={{ marginTop: 8 }}>
        {rader.length === 0 ? (
          <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--text-secondary)" }}>
            Ingen hendelser denne uka.
          </p>
        ) : (
          rader.map(({ dIso, h }, i) => (
            <HendelseRad key={`${dIso}-${i}`} dagIso={dIso} h={h} onOpen={onOpen} visDag />
          ))
        )}
      </div>
    </section>
  );
}

function Telle({ verdi, label }: { verdi: number; label: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "10px 8px",
        borderRadius: 14,
        background: "var(--neutral-50)",
        textAlign: "center",
      }}
    >
      <div
        className="wang-num"
        style={{
          fontFamily: "var(--font-brand)",
          fontWeight: 800,
          fontSize: 19,
          color: "var(--text-primary)",
        }}
      >
        {verdi}
      </div>
      <div className="t-label" style={{ color: "var(--text-secondary)", marginTop: 1 }}>
        {label}
      </div>
    </div>
  );
}

// ---- Skjermen ----------------------------------------------------------

export function FaneKalender({
  onOpen,
  naaIso,
  live = null,
  startValgtDag,
}: {
  onOpen: (id: string) => void;
  naaIso: string;
  live?: WangLiveData | null;
  /** Hopper rett til den dagens måned (bruk `key` for å tvinge remount). */
  startValgtDag?: string | null;
}) {
  const startAar = startValgtDag ? Number(startValgtDag.slice(0, 4)) : Number(naaIso.slice(0, 4));
  const startMnd = startValgtDag
    ? Number(startValgtDag.slice(5, 7)) - 1
    : Number(naaIso.slice(5, 7)) - 1;
  const gyldigStart = MONTH_ORDER.some(([m, y]) => m === startMnd && y === startAar)
    ? ([startAar, startMnd] as [number, number])
    : ([MONTH_ORDER[0][1], MONTH_ORDER[0][0]] as [number, number]);

  const [ym, setYm] = useState<[number, number]>(gyldigStart);
  const [visAar, setVisAar] = useState(false);
  const [y, m] = ym;

  const hendelser = byggLiveKalenderHendelser(SESSIONS, live);
  const idx = MONTH_ORDER.findIndex((o) => o[0] === m && o[1] === y);

  // Uka som er valgt i panelet — starter på inneværende uke når vi er i den
  // måneden, ellers månedens første uke.
  const naaUke = isoUke(new Date(`${naaIso}T12:00:00`));
  const forsteUke = isoUke(new Date(`${isoOf(y, m, 1)}T12:00:00`));
  const iDenneMnd = naaIso.slice(0, 7) === `${y}-${String(m + 1).padStart(2, "0")}`;
  const [valgtUke, setValgtUke] = useState<number | null>(null);
  const aktivUke = valgtUke ?? (iDenneMnd ? naaUke : forsteUke);

  const bytt = (retning: -1 | 1) => {
    const neste = MONTH_ORDER[Math.min(MONTH_ORDER.length - 1, Math.max(0, idx + retning))];
    setYm([neste[1], neste[0]]);
    setValgtUke(null);
  };

  const mndIso = isoOf(y, m, 15);
  const periode = periodeForIso(mndIso);
  const antallOkter = Object.entries(hendelser).filter(
    ([k, v]) => k.startsWith(`${y}-${String(m + 1).padStart(2, "0")}`) && v.some((e) => e.type === "okt"),
  ).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Månedshode med fram/tilbake — samme på begge bredder. */}
      <div
        className="wang-card"
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <RundKnapp label="Forrige måned" onClick={() => bytt(-1)}>
          <ChevronLeft size={16} strokeWidth={2.5} aria-hidden />
        </RundKnapp>
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <b
            style={{
              display: "block",
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            {MONTHS_NO[m].charAt(0).toUpperCase() + MONTHS_NO[m].slice(1)} {y}
          </b>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 2,
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            {periode ? (
              <>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: PERIOD_COL[periode.key],
                  }}
                />
                {periode.name}
              </>
            ) : (
              "Utenom sesongen"
            )}
            <span className="wang-num"> · {antallOkter} økter</span>
          </span>
        </div>
        <RundKnapp label="Neste måned" onClick={() => bytt(1)}>
          <ChevronRight size={16} strokeWidth={2.5} aria-hidden />
        </RundKnapp>
      </div>

      {/* Årshjulet er beholdt som egen visning — det er den eneste flaten som
          viser hele sesongen i ett bilde. */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => setVisAar((v) => !v)}
          className="wang-pressable"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 36,
            padding: "0 16px",
            borderRadius: "var(--radius-chip)",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 12.5,
            background: visAar ? "var(--wang-navy)" : "var(--surface-card)",
            color: visAar ? "var(--white)" : "var(--text-secondary)",
            boxShadow: "var(--shadow-card-sm)",
          }}
          aria-pressed={visAar}
        >
          Hele året
        </button>
      </div>

      {visAar ? (
        <section
          className="wang-card"
          style={{ padding: 22, display: "flex", justifyContent: "center" }}
        >
          <Arshjul
            selMonth={`${y}-${m}`}
            naaIso={naaIso}
            onSelect={(mm, yy) => {
              setYm([yy, mm]);
              setValgtUke(null);
              setVisAar(false);
            }}
          />
        </section>
      ) : (
        <>
          {/* Mobil: agenda per uke. Ingen rutenett som må sidescrolles. */}
          <div className="wang-vis-mobil">
            <UkeAgenda y={y} m={m} hendelser={hendelser} naaIso={naaIso} onOpen={onOpen} />
          </div>

          {/* Desktop: rutenett + panel for valgt uke. */}
          <div
            className="wang-vis-desktop"
            style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 16 }}
          >
            <section className="wang-card" style={{ padding: 20 }}>
              <MaanedRutenett
                y={y}
                m={m}
                hendelser={hendelser}
                naaIso={naaIso}
                valgtUke={aktivUke}
                setValgtUke={setValgtUke}
              />
            </section>
            <UkePanel uke={aktivUke} y={y} m={m} hendelser={hendelser} onOpen={onOpen} />
          </div>
        </>
      )}

      <Legende />
    </div>
  );
}

function Legende() {
  const rader: [HendelseType, string][] = [
    ["okt", "Treningsøkt"],
    ["konkurranse", "Turnering"],
    ["prove", "Prøve"],
    ["skole", "Skole"],
    ["samling", "Samling"],
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      {rader.map(([t, l]) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: TYPE_FARGE[t] }} />
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function RundKnapp({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="wang-pressable"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        borderRadius: 999,
        border: "1px solid var(--border-subtle)",
        cursor: "pointer",
        background: "var(--surface-card)",
        color: "var(--text-primary)",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
