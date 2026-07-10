/**
 * Oversetter ekte loadBookinger-output (BookingerViewProps) → v10 BookingerData.
 *
 * Følger samme mønster som mapHjemData i /portal: loaderens shape mappes til
 * v10-komponentens prop-shape. Tom-tilstander bevares (tom headMeta → "ingen i
 * perioden", tomme grupper). Ingen oppdiktede tall.
 *
 * v10-komponenten <Bookinger> er presentasjonell; periode-tabs er lokal UI-state
 * og refiltrerer ikke. Vi rendrer derfor inneværende uke (default-perioden) som
 * synlig fasit, med samme paginering (8 per side) som den gamle visningen brukte.
 */

import {
  UserCog,
  CircleDot,
  Tag,
} from "lucide-react";
import type { BookingerViewProps } from "@/components/admin/bookinger/bookinger-view";
import type {
  BookingerData,
  BookingRow as V10Row,
  BookingDayGroup,
  BookingStatus,
  BookingType,
  CreditDisplay,
} from "@/components/admin/bookinger/bookinger";

const PAGE_SIZE = 8;

function mapStatus(s: BookingerViewProps["rows"][number]["status"]): BookingStatus {
  switch (s) {
    case "uten":
      return "uten-coach";
    case "fullf":
      return "fullfort";
    default:
      return s; // bekreftet | pagaar | avbestilt
  }
}

function mapType(kind: BookingerViewProps["rows"][number]["type"]["kind"]): BookingType {
  switch (kind) {
    case "coach":
      return "coaching";
    case "tm":
      return "trackman";
    default:
      return kind; // gruppe | bane
  }
}

function mapCredit(c: BookingerViewProps["rows"][number]["credit"]): CreditDisplay {
  if (c.mode === "inkl") return { kind: "inkl" };
  if (c.mode === "pay") return { kind: "pay" };
  return { kind: "credits", used: c.remaining, total: c.total, tone: c.tone };
}

export function mapBookingerData(props: BookingerViewProps): BookingerData {
  // Inneværende uke = default-perioden i v10 (activePeriod "uke").
  const weekRows = props.rows.filter((r) => r.weekStartMs === props.currentWeekStartMs);

  // Paginering: synlig side = side 1 (samme PAGE_SIZE som BookingerView).
  const pageRows = weekRows.slice(0, PAGE_SIZE);
  const showingTo = Math.min(weekRows.length, PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(weekRows.length / PAGE_SIZE));

  // Dag-grupper i visningsrekkefølge (rader er allerede sortert på startMs).
  const groupMap = new Map<string, V10Row[]>();
  const meta = new Map<string, { label: string; today: boolean }>();
  for (const r of pageRows) {
    const arr = groupMap.get(r.dayKey) ?? [];
    arr.push({
      id: r.id,
      player: {
        initials: r.playerInitials,
        name: r.playerName,
        sub: r.playerSub || "—",
        tone:
          r.status === "pagaar" ? "primary" : r.type.kind === "bane" ? "lime" : "neutral",
      },
      date: { dow: r.dow, dm: r.dateShort },
      time: { start: r.time, dur: `${r.durMin} m` },
      coach: r.coachName
        ? { initials: r.coachInitials ?? "—", name: r.coachName }
        : null,
      type: mapType(r.type.kind),
      credit: mapCredit(r.credit),
      location: r.location,
      status: mapStatus(r.status),
      href: `/admin/gjennomfore/okter/${r.id}`,
    });
    groupMap.set(r.dayKey, arr);
    if (!meta.has(r.dayKey)) meta.set(r.dayKey, { label: r.dayLabel, today: r.isToday });
  }

  const groups: BookingDayGroup[] = Array.from(groupMap.entries()).map(([key, rows]) => {
    const m = meta.get(key)!;
    const paa = rows.filter((row) => row.status === "pagaar").length;
    const uten = rows.filter((row) => row.coach === null && row.status !== "avbestilt" && row.status !== "fullfort").length;
    const extraParts: string[] = [];
    if (paa > 0) extraParts.push(`${paa} pågår`);
    if (uten > 0) extraParts.push(`${uten} uten coach`);
    return {
      label: m.label,
      count: rows.length,
      today: m.today,
      extraMeta: extraParts.length > 0 ? extraParts.join(" · ") : undefined,
      rows,
    };
  });

  // headMeta fra stats med value > 0; tom liste → "ingen i perioden".
  const headMeta = props.stats
    .filter((s) => s.value > 0)
    .map((s) => ({ value: String(s.value), label: s.label }));

  return {
    periodLabel: `Uke ${props.currentWeekNo}`,
    totalBookings: weekRows.length,
    headMeta,
    periodTabs: [
      { key: "i-dag", label: "I dag" },
      { key: "uke", label: `Uke ${props.currentWeekNo}` },
      { key: "neste", label: `Uke ${props.currentWeekNo + 1}` },
      { key: "alle", label: "Alle" },
    ],
    activePeriod: "uke",
    filters: [
      { key: "coach", icon: UserCog, label: "Coach", value: "Alle" },
      { key: "status", icon: CircleDot, label: "Status", value: "Alle" },
      { key: "type", icon: Tag, label: "Type", value: "Alle" },
    ],
    groups,
    pagination: {
      fromTo: weekRows.length === 0 ? "0–0" : `1–${showingTo}`,
      total: weekRows.length,
      scope: `uke ${props.currentWeekNo}`,
      page: 1,
      pages,
    },
  };
}
