import Link from "next/link";
import { T, Caps, Knapp, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

/**
 * AgencyOS Kalender — måned-visning, v2-port 16. juli 2026. Erstatter
 * Tailwind/shadcn-tokens (border-border, bg-card, text-muted-foreground osv.)
 * med v2 T-tokens. Samme datakontrakt (MonthCalendarProps) og samme
 * server-side loader (loadKalenderManed) uendret — kun presentasjonslaget
 * er nytt. Søsterskjerm til ukevisningen (/admin/kalender), som fortsatt
 * står i golfdata/shadcn inntil den portes i en egen omgang.
 */

export type MonthEventKind = "oneToOne" | "group" | "live";

export type MonthEvent = {
  id: string;
  dateKey: string;
  timeLabel: string;
  title: string;
  kind: MonthEventKind;
  isCompleted: boolean;
  href: string;
};

export type MonthDay = {
  dateKey: string;
  date: number;
  inMonth: boolean;
  weekend: boolean;
  isToday: boolean;
};

export type MonthCalendarV2Props = {
  monthLabel: string;
  prevMonthParam: string;
  nextMonthParam: string;
  todayParam: string;
  isCurrentMonth: boolean;
  days: MonthDay[];
  events: MonthEvent[];
  bookingCount: number;
  spillerCount: number;
};

const DOW = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const KIND_COLOR: Record<MonthEventKind, string> = { oneToOne: T.lime, group: T.forest, live: T.warn };

function ViewToggle() {
  return (
    <div style={{ display: "inline-flex", gap: 2, borderRadius: 10, background: T.panel2, padding: 3, marginBottom: 14 }}>
      <Link
        href="/admin/kalender"
        style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 11px", borderRadius: 7, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, textDecoration: "none" }}
      >
        Uke
      </Link>
      <span
        aria-current="page"
        style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 11px", borderRadius: 7, background: T.panel, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.fg }}
      >
        Måned
      </span>
    </div>
  );
}

function NavRow({ prevMonthParam, nextMonthParam, todayParam, isCurrentMonth }: Pick<MonthCalendarV2Props, "prevMonthParam" | "nextMonthParam" | "todayParam" | "isCurrentMonth">) {
  const navBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel, color: T.fg, textDecoration: "none" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href={`/admin/kalender/maned?mnd=${prevMonthParam}`} style={navBtn} aria-label="Forrige måned">
          <Icon name="chevron-left" size={15} />
        </Link>
        <Link href={`/admin/kalender/maned?mnd=${nextMonthParam}`} style={navBtn} aria-label="Neste måned">
          <Icon name="chevron-right" size={15} />
        </Link>
      </div>
      <Link
        href={`/admin/kalender/maned?mnd=${todayParam}`}
        aria-disabled={isCurrentMonth}
        style={{
          display: "inline-flex", alignItems: "center", height: 32, padding: "0 12px", borderRadius: 10,
          border: `1px solid ${isCurrentMonth ? T.border : T.lime}`,
          background: isCurrentMonth ? T.panel2 : T.panel,
          color: isCurrentMonth ? T.mut : T.lime,
          fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none",
        }}
      >
        I dag
      </Link>
    </div>
  );
}

function DayHeaders() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${T.border}`, background: T.panel }}>
      {DOW.map((d, i) => (
        <div key={d} style={{ borderRight: i < 6 ? `1px solid ${T.border}` : "none", padding: "10px 12px", background: i >= 5 ? T.panel2 : "transparent" }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: T.mut }}>{d}</span>
        </div>
      ))}
    </div>
  );
}

function EventPill({ ev }: { ev: MonthEvent }) {
  const c = KIND_COLOR[ev.kind];
  return (
    <Link
      href={ev.href}
      style={{
        display: "flex", alignItems: "center", gap: 6, overflow: "hidden", borderRadius: 6,
        border: `1px solid ${T.border}`, borderLeft: `3px solid ${c}`,
        background: ev.kind === "live" ? T.panel : `color-mix(in srgb, ${c} 10%, transparent)`,
        padding: "2px 6px", textDecoration: "none", opacity: ev.isCompleted ? 0.6 : 1,
      }}
    >
      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, lineHeight: 1, color: T.fg, fontVariantNumeric: "tabular-nums", flex: "none" }}>{ev.timeLabel}</span>
      <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</span>
    </Link>
  );
}

function MonthGrid({ days, events }: Pick<MonthCalendarV2Props, "days" | "events">) {
  const byDay = new Map<string, MonthEvent[]>();
  for (const ev of events) {
    const arr = byDay.get(ev.dateKey);
    if (arr) arr.push(ev);
    else byDay.set(ev.dateKey, [ev]);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
      {days.map((d, i) => {
        const dayEvents = byDay.get(d.dateKey) ?? [];
        const visible = dayEvents.slice(0, 3);
        const overflow = dayEvents.length - visible.length;
        const lastRow = i >= days.length - 7;
        const isLastCol = (i + 1) % 7 === 0;
        return (
          <div
            key={d.dateKey}
            style={{
              display: "flex", flexDirection: "column", gap: 4, minHeight: 80,
              borderBottom: lastRow ? "none" : `1px solid ${T.border}`,
              borderRight: isLastCol ? "none" : `1px solid ${T.border}`,
              padding: 6,
              background: !d.inMonth ? T.panel2 : d.isToday ? `color-mix(in srgb, ${T.lime} 6%, transparent)` : d.weekend ? T.panel2 : "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 11, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums",
                  color: d.isToday ? T.lime : !d.inMonth ? T.mut : d.weekend ? T.mut : T.fg,
                }}
              >
                {d.inMonth ? d.date : null}
                {d.isToday && <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.lime }} />}
              </span>
              {d.inMonth && dayEvents.length > 0 && (
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{dayEvents.length}</span>
              )}
            </div>

            <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}>
              {d.inMonth && visible.map((ev) => <EventPill key={ev.id} ev={ev} />)}
              {d.inMonth && overflow > 0 && (
                <span style={{ marginTop: "auto", padding: "0 4px", fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>
                  +{overflow} til
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyStateMaaned() {
  return (
    <div style={{ padding: "60px 24px" }}>
      <TomTilstand icon="calendar" title="Ingen timer denne måneden" />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
        <Link href="/admin/bookinger/ny">
          <Knapp icon="calendar-plus">Book første time</Knapp>
        </Link>
      </div>
    </div>
  );
}

export function MonthCalendarV2(props: MonthCalendarV2Props) {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 20 }}>
        <div>
          <Caps>{`Stallen · ${props.spillerCount} spillere`}</Caps>
          <h1 style={{ margin: "8px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 28, lineHeight: 1.08, letterSpacing: "-0.02em", color: T.fg, textTransform: "capitalize" }}>
            {props.monthLabel}
          </h1>
        </div>
        <Link href="/admin/planlegge">
          <Knapp icon="plus">Ny økt</Knapp>
        </Link>
      </div>

      <ViewToggle />

      <NavRow prevMonthParam={props.prevMonthParam} nextMonthParam={props.nextMonthParam} todayParam={props.todayParam} isCurrentMonth={props.isCurrentMonth} />

      <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden" }}>
        <DayHeaders />
        {props.bookingCount === 0 ? <EmptyStateMaaned /> : <MonthGrid days={props.days} events={props.events} />}
      </div>
    </div>
  );
}
