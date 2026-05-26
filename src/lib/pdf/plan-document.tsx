// PDF-dokument for treningsplan-eksport.
// Bruker @react-pdf/renderer. Standardfonter (Helvetica) — react-pdf støtter
// ikke samme fonter som webappen, men vi etterligner stilen med italic på
// display-overskriften og monospace på tabulære tall.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PyramidArea } from "@/generated/prisma/client";
import {
  aggregateByArea,
  prosentPerArea,
  totalMinutter,
  PYR_REKKEFOLGE,
  PYR_LABEL,
} from "@/lib/pyramide";

// ── Designsystem-farger (matcher tokens i globals.css) ────────────
const COLOR = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  foreground: "hsl(var(--foreground))",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  card: "#FFFFFF",
  secondary: "hsl(var(--secondary))",
  background: "hsl(var(--background))",
} as const;

const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "hsl(var(--primary))",
  TEK: "hsl(var(--success))",
  SLAG: "hsl(var(--accent))",
  SPILL: "hsl(var(--warning))",
  TURN: "hsl(var(--muted-foreground))",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLOR.foreground,
    backgroundColor: COLOR.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
    paddingBottom: 16,
    marginBottom: 24,
  },
  brand: {
    flexDirection: "column",
  },
  brandMark: {
    fontSize: 9,
    fontFamily: "Courier",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLOR.muted,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLOR.primary,
    letterSpacing: 0.5,
  },
  titleBlock: {
    textAlign: "right",
  },
  eyebrow: {
    fontSize: 8,
    fontFamily: "Courier",
    color: COLOR.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Oblique",
    color: COLOR.foreground,
    letterSpacing: 0.2,
  },
  // ── Spiller- og periode-info ────────────────────────────────────
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  metaCol: {
    flex: 1,
    paddingRight: 8,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: "Courier",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: COLOR.muted,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    color: COLOR.foreground,
    marginBottom: 2,
  },
  metaSub: {
    fontSize: 9,
    color: COLOR.muted,
  },
  // ── Seksjoner ──────────────────────────────────────────────────
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLOR.foreground,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
  },
  // ── Fase-bar (auto-uker) ────────────────────────────────────────
  faseRow: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 6,
  },
  faseBlock: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 2,
    alignItems: "center",
  },
  faseLabel: {
    fontSize: 7,
    fontFamily: "Courier",
    color: COLOR.foreground,
  },
  faseSub: {
    fontSize: 6,
    fontFamily: "Courier",
    color: COLOR.foreground,
    marginTop: 2,
  },
  // ── Pyramide-bars ───────────────────────────────────────────────
  pyrRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  pyrLabel: {
    width: 60,
    fontSize: 9,
    fontFamily: "Courier",
    color: COLOR.muted,
    textTransform: "uppercase",
  },
  pyrTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLOR.secondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  pyrFill: {
    height: "100%",
  },
  pyrPct: {
    width: 40,
    fontSize: 9,
    fontFamily: "Courier",
    textAlign: "right",
    color: COLOR.foreground,
  },
  // ── Økter-tabell ────────────────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    backgroundColor: COLOR.secondary,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.border,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.25,
    borderBottomColor: COLOR.border,
  },
  th: {
    fontSize: 8,
    fontFamily: "Courier",
    textTransform: "uppercase",
    color: COLOR.muted,
    letterSpacing: 0.6,
  },
  td: {
    fontSize: 9,
    color: COLOR.foreground,
  },
  colDato: { width: 70 },
  colTid: { width: 50 },
  colTittel: { flex: 1, paddingRight: 4 },
  colVarighet: { width: 50, textAlign: "right" },
  colFokus: { width: 50, textAlign: "right" },
  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.border,
    fontSize: 8,
    fontFamily: "Courier",
    color: COLOR.muted,
  },
});

// ── Typer for input ───────────────────────────────────────────────
export type PlanPdfSession = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  title: string;
  pyramidArea: PyramidArea;
};

export type PlanPdfData = {
  planName: string;
  startDate: Date;
  endDate: Date | null;
  player: {
    name: string;
    hcp: number | null;
    homeClub: string | null;
  };
  coach: {
    name: string;
    email: string;
  } | null;
  sessions: PlanPdfSession[];
  generatedAt: Date;
};

// ── Hjelpere ──────────────────────────────────────────────────────
function fmtDato(d: Date | null, withYear = false): string {
  if (!d) return "Åpen";
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: withYear ? "numeric" : undefined,
  });
}

function fmtTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDatoTid(d: Date): string {
  return d.toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Faseinndeling (gruppering per ISO-uke) ────────────────────────
function getISOWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { year: date.getUTCFullYear(), week };
}

type Fase = {
  key: string;
  ukeLabel: string;
  pct: number;
  dominant: PyramidArea | null;
};

function buildFaser(sessions: PlanPdfSession[]): Fase[] {
  if (sessions.length === 0) return [];
  const groups = new Map<string, PlanPdfSession[]>();
  for (const s of sessions) {
    const { year, week } = getISOWeek(s.scheduledAt);
    const key = `${year}-${String(week).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  const total = sessions.reduce((sum, s) => sum + s.durationMin, 0);
  const sortedKeys = Array.from(groups.keys()).sort();
  return sortedKeys.map((key) => {
    const list = groups.get(key)!;
    const mins = list.reduce((sum, s) => sum + s.durationMin, 0);
    const perArea: Record<PyramidArea, number> = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0,
    };
    for (const s of list) perArea[s.pyramidArea] += s.durationMin;
    let dominant: PyramidArea | null = null;
    let max = 0;
    for (const a of PYR_REKKEFOLGE) {
      if (perArea[a] > max) {
        max = perArea[a];
        dominant = a;
      }
    }
    return {
      key,
      ukeLabel: `u${key.split("-")[1]}`,
      pct: total === 0 ? 0 : Math.round((mins / total) * 100),
      dominant,
    };
  });
}

// ── Dokument-komponenten ──────────────────────────────────────────
export function PlanDocument({ data }: { data: PlanPdfData }) {
  const fordeling = prosentPerArea(aggregateByArea(data.sessions));
  const totMin = totalMinutter(aggregateByArea(data.sessions));
  const totTimer = (totMin / 60).toFixed(1).replace(".", ",");
  const faser = buildFaser(data.sessions);

  return (
    <Document
      title={`Treningsplan – ${data.player.name}`}
      author="AK Golf HQ"
      subject={data.planName}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header med brand-mark og plan-tittel */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandMark}>AK Golf HQ</Text>
            <Text style={styles.brandName}>AK GOLF ACADEMY</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>Treningsplan</Text>
            <Text style={styles.title}>{data.planName}</Text>
          </View>
        </View>

        {/* Spiller, coach, periode */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Spiller</Text>
            <Text style={styles.metaValue}>{data.player.name}</Text>
            <Text style={styles.metaSub}>
              {data.player.homeClub ?? "—"}
              {data.player.hcp != null ? `  ·  HCP ${data.player.hcp}` : ""}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Coach</Text>
            <Text style={styles.metaValue}>{data.coach?.name ?? "—"}</Text>
            <Text style={styles.metaSub}>{data.coach?.email ?? ""}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Periode</Text>
            <Text style={styles.metaValue}>
              {fmtDato(data.startDate, true)} – {fmtDato(data.endDate, true)}
            </Text>
            <Text style={styles.metaSub}>
              {data.sessions.length} økter  ·  {totTimer} t volum
            </Text>
          </View>
        </View>

        {/* Fase-bar */}
        {faser.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Faseinndeling per uke</Text>
            <View style={styles.faseRow}>
              {faser.map((f) => (
                <View
                  key={f.key}
                  style={[
                    styles.faseBlock,
                    {
                      backgroundColor: f.dominant
                        ? PYR_COLOR[f.dominant]
                        : COLOR.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.faseLabel,
                      {
                        color:
                          f.dominant === "SLAG"
                            ? COLOR.foreground
                            : "#FFFFFF",
                      },
                    ]}
                  >
                    {f.ukeLabel}
                  </Text>
                  <Text
                    style={[
                      styles.faseSub,
                      {
                        color:
                          f.dominant === "SLAG"
                            ? COLOR.foreground
                            : "#FFFFFF",
                      },
                    ]}
                  >
                    {f.pct}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pyramide-fordeling */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Pyramide-fordeling</Text>
          {PYR_REKKEFOLGE.map((omr) => (
            <View key={omr} style={styles.pyrRow}>
              <Text style={styles.pyrLabel}>{PYR_LABEL[omr]}</Text>
              <View style={styles.pyrTrack}>
                <View
                  style={[
                    styles.pyrFill,
                    {
                      width: `${Math.max(fordeling[omr], 1)}%`,
                      backgroundColor: PYR_COLOR[omr],
                    },
                  ]}
                />
              </View>
              <Text style={styles.pyrPct}>{fordeling[omr]} %</Text>
            </View>
          ))}
        </View>

        {/* Økter-tabell */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Økter</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colDato]}>Dato</Text>
            <Text style={[styles.th, styles.colTid]}>Tid</Text>
            <Text style={[styles.th, styles.colTittel]}>Tittel</Text>
            <Text style={[styles.th, styles.colVarighet]}>Min</Text>
            <Text style={[styles.th, styles.colFokus]}>Fokus</Text>
          </View>
          {data.sessions.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.td}>Ingen økter planlagt.</Text>
            </View>
          ) : (
            data.sessions.map((s) => (
              <View key={s.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.td, styles.colDato]}>
                  {fmtDato(s.scheduledAt)}
                </Text>
                <Text style={[styles.td, styles.colTid]}>
                  {fmtTid(s.scheduledAt)}
                </Text>
                <Text style={[styles.td, styles.colTittel]}>{s.title}</Text>
                <Text style={[styles.td, styles.colVarighet]}>
                  {s.durationMin}
                </Text>
                <Text
                  style={[
                    styles.td,
                    styles.colFokus,
                    { color: PYR_COLOR[s.pyramidArea], fontWeight: "bold" },
                  ]}
                >
                  {s.pyramidArea}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Generert {fmtDatoTid(data.generatedAt)} via AK Golf HQ · akgolf.no
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
