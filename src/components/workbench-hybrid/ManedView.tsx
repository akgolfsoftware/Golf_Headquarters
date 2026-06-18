"use client";

import type { ReactElement } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { CAT_COLORS, FONT, TOUR_TYPES, WB, type Cat } from "./theme";
import type { SeasonPhase, SeasonPhaseType, WbSamling, WbTournament, WeekKey, WeekState } from "./types";

const MONTH_NAMES = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];
const MONTH_LOWER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const WEEKDAY_HEADS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const PHASE_LABEL: Record<SeasonPhaseType, string> = {
  GRUNN: "Grunnperiode",
  SPESIALISERING: "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
  EVALUERING: "Evalueringsperiode",
  FERIE: "Ferieperiode",
};

const PYR_ORDER: Cat[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

// Mandag-først ukedag-nøkler (0 = søn .. 6 = lør → man-først indeks).
const WEEK_KEY_BY_DOW: WeekKey[] = ["son", "man", "tir", "ons", "tor", "fre", "lor"];

// Måned-index → periodetype (sekvensielt fra periodenes month-spenn).
function phaseTypeForMonth(phases: SeasonPhase[], monthIdx: number): SeasonPhaseType {
  let acc = 0;
  for (const ph of phases) {
    if (monthIdx < acc + ph.months) return ph.type;
    acc += ph.months;
  }
  return phases[phases.length - 1]?.type ?? "GRUNN";
}

// "06.06.2026" → { day, month1 } (måned 1-indeksert) eller null.
function parseDmy(s: string): { day: number; month1: number } | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s.trim());
  if (!m) return null;
  return { day: parseInt(m[1], 10), month1: parseInt(m[2], 10) };
}

// Mandag-først ukedag for en gitt dato.
function dayKeyForDate(year: number, monthIdx: number, date: number): WeekKey {
  const wd = new Date(year, monthIdx, date).getDay(); // 0 søn .. 6 lør
  return WEEK_KEY_BY_DOW[wd];
}

type ManedViewProps = {
  monthIndex: number;
  phases: SeasonPhase[];
  /** ekte uke-state (for dots i den aktive uka) */
  week: WeekState;
  /** minutter per kategori (live) — driver pyramidefordelingen */
  totals: Record<Cat, number>;
  tournaments: WbTournament[];
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (date: number) => void;
};

export function ManedView({
  monthIndex,
  phases,
  week,
  totals,
  tournaments,
  onPrev,
  onNext,
  onDayClick,
}: ManedViewProps): ReactElement {
  // Inneværende dato styrer hvilken måned/uke som markeres "nå" (ingen hardkodet demo-uke).
  const today = new Date();
  const year = today.getFullYear();
  const phaseType = phaseTypeForMonth(phases, monthIndex);
  const hasPhases = phases.length > 0;
  const monthName = MONTH_NAMES[monthIndex];
  const monthLower = MONTH_LOWER[monthIndex];
  const numDays = new Date(year, monthIndex + 1, 0).getDate();
  const firstWd = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // mandag-først offset

  // Den aktive uka = uka som inneholder dagens dato (kun når vi ser på inneværende måned/år).
  const isActiveWeekMonth = monthIndex === today.getMonth() && year === today.getFullYear();
  const todayDate = today.getDate();
  const todayDow = (today.getDay() + 6) % 7; // 0 = man .. 6 = søn
  const activeWeekFrom = todayDate - todayDow;
  const activeWeekTo = activeWeekFrom + 6;

  // Turneringer i denne måneden (ekte data der den finnes).
  const monthTours = tournaments
    .map((t) => {
      const p = t.date ? parseDmy(t.date) : null;
      if (!p || p.month1 - 1 !== monthIndex) return null;
      const tt = TOUR_TYPES[t.type ?? "TRENING"];
      return { title: t.title, day: p.day, dateLabel: `${p.day}. ${monthLower}`, typeShort: tt.short, color: tt.color };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.day - b.day);

  // Samlinger i denne måneden (fra periodenes samlinger).
  const samlingByDate: Record<number, WbSamling> = {};
  phases.forEach((ph) =>
    ph.samlinger.forEach((s) => {
      const p = parseDmy(s.date);
      if (p && p.month1 - 1 === monthIndex) samlingByDate[p.day] = s;
    }),
  );

  // Pyramidefordeling fra live-totals.
  const pyrTotal = PYR_ORDER.reduce((a, c) => a + totals[c], 0) || 1;

  // Antall planlagte økter vi faktisk kjenner: kun den aktive uka har ekte
  // måned-datoer her. For andre måneder finnes ingen kilde → "—".
  const weekSessionCount = (Object.keys(week) as WeekKey[]).reduce((n, k) => n + week[k].length, 0);

  // Stat-tiles: kun verdier vi har ekte kilde for. Ingen oppdiktede tall
  // (tidligere demo-tiles "Planlagte økter 38" / "Trenerøkter 6" er fjernet).
  const stats = [
    { label: "Konkurranser", value: String(monthTours.length) },
    { label: "Planlagte økter", value: isActiveWeekMonth ? String(weekSessionCount) : "—" },
    { label: "Samlinger", value: String(Object.keys(samlingByDate).length) },
  ];

  // Kalender-celler.
  const totalCells = Math.ceil((firstWd + numDays) / 7) * 7;
  const cells: { key: number; date: number | null; dots: Cat[]; samling: WbSamling | null; isToday: boolean; isWeekend: boolean; inActiveWeek: boolean }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = i - firstWd + 1;
    if (date < 1 || date > numDays) {
      cells.push({ key: i, date: null, dots: [], samling: null, isToday: false, isWeekend: false, inActiveWeek: false });
      continue;
    }
    const inActiveWeek = isActiveWeekMonth && date >= activeWeekFrom && date <= activeWeekTo;
    const isToday = isActiveWeekMonth && date === todayDate;
    const isWeekend = i % 7 >= 5;
    // Kun den aktive uka har ekte måned-datoer for økter. Andre dager: ingen
    // oppdiktede dots (tidligere demo-sampleMonth er fjernet).
    const dots: Cat[] = inActiveWeek
      ? (week[dayKeyForDate(year, monthIndex, date)] ?? []).map((s) => s.cat)
      : [];
    cells.push({ key: i, date, dots: dots.slice(0, 4), samling: samlingByDate[date] ?? null, isToday, isWeekend, inActiveWeek });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* header + nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>{monthName} {year}</span>
          {hasPhases && <span style={{ fontSize: 12, color: WB.muted }}>{PHASE_LABEL[phaseType]}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={onPrev}
            style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${WB.panelBorder}`, background: WB.cardBg, color: WB.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onNext}
            style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${WB.panelBorder}`, background: WB.cardBg, color: WB.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* måned-statistikk + pyramide */}
      <div style={{ display: "flex", gap: 8, padding: "0 18px 10px" }}>
        {stats.map((ms) => (
          <div key={ms.label} style={{ flex: 1, background: WB.cardBgAlt, border: `1px solid ${WB.innerBorderSoft}`, borderRadius: 11, padding: "11px 13px" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: WB.text, lineHeight: 1 }}>{ms.value}</div>
            <div style={{ fontSize: 10.5, color: WB.muted, marginTop: 4 }}>{ms.label}</div>
          </div>
        ))}
        <div style={{ flex: 1.4, background: WB.cardBgAlt, border: `1px solid ${WB.innerBorderSoft}`, borderRadius: 11, padding: "11px 13px" }}>
          <div style={{ fontSize: 10.5, color: WB.muted, marginBottom: 8 }}>Pyramidefordeling</div>
          <div style={{ display: "flex", height: 10, borderRadius: 9999, overflow: "hidden", background: WB.railBg }}>
            {PYR_ORDER.map((c) => (
              <span key={c} style={{ width: `${Math.round((totals[c] / pyrTotal) * 100)}%`, background: CAT_COLORS[c] }} />
            ))}
          </div>
          <div style={{ fontSize: 9, color: "#7c8a82", marginTop: 6 }}>FYS · TEK · SLAG · SPILL · TURN</div>
        </div>
      </div>

      {/* turnerings-tidslinje */}
      {monthTours.length > 0 && (
        <div style={{ margin: "0 18px 12px", background: "#0c2219", border: `1px solid ${WB.innerBorderSoft}`, borderRadius: 12, padding: "12px 14px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5f7d70" }}>
              Turneringer i {monthLower}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {Object.values(TOUR_TYPES).map((tt) => (
                <span key={tt.short} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: WB.muted }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tt.color }} />
                  {tt.short}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {monthTours.map((t) => (
              <div key={`${t.title}-${t.day}`} style={{ flex: 1, minWidth: 0, background: WB.cardBgAlt, border: `1px solid ${WB.innerBorderSoft}`, borderTop: `2px solid ${t.color}`, borderRadius: 10, padding: "11px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, boxShadow: `0 0 0 3px ${t.color}33` }} />
                  <span style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, color: WB.text }}>{t.dateLabel}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: WB.text, lineHeight: 1.2, marginBottom: 7 }}>{t.title}</div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: `${t.color}1f`,
                    border: `1px solid ${t.color}55`,
                    color: t.color,
                    fontFamily: FONT.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    borderRadius: 9999,
                    padding: "3px 8px",
                  }}
                >
                  {t.typeShort}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ukedags-overskrifter */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, padding: "0 18px 6px" }}>
        {WEEKDAY_HEADS.map((w) => (
          <div key={w} style={{ textAlign: "center", fontFamily: FONT.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5f7d70" }}>
            {w}
          </div>
        ))}
      </div>

      {/* dag-celler */}
      <div className="wb-scroll" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridAutoRows: "1fr", gap: 6, padding: "0 18px 16px", overflowY: "auto", minHeight: 0 }}>
        {cells.map((c) => {
          if (c.date == null) {
            return <div key={c.key} style={{ borderRadius: 10, background: "transparent" }} />;
          }
          const baseBg = c.isToday
            ? "rgba(209,248,67,0.08)"
            : c.isWeekend
              ? "#081811"
              : c.inActiveWeek
                ? WB.cardBg
                : "#10271d";
          const borderColor = c.isToday ? WB.lime : c.samling ? "#84A9FF" : c.isWeekend ? WB.hairline : WB.panelBorder;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onDayClick(c.date as number)}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 10,
                padding: 8,
                cursor: "pointer",
                border: `1px solid ${borderColor}`,
                background: baseBg,
                textAlign: "left",
                minHeight: 60,
              }}
            >
              <span
                style={{
                  fontFamily: FONT.display,
                  fontWeight: c.isToday ? 800 : 600,
                  fontSize: 13,
                  color: c.isToday ? WB.lime : c.isWeekend ? "#8a978f" : WB.text,
                }}
              >
                {c.date}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                {c.dots.map((cat, di) => (
                  <span key={di} style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[cat] }} />
                ))}
              </div>
              {c.samling && (
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(132,169,255,0.16)",
                    borderRadius: 6,
                    padding: "3px 6px",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#84A9FF",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Users size={9} color="#84A9FF" strokeWidth={2.4} />
                  {c.samling.title}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
