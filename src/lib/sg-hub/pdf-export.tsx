// PDF-eksport for Stock Yardage Chart i A4 landskap.
// Bruker @react-pdf/renderer. Standardfonter (Helvetica) — react-pdf støtter
// ikke samme fonter som webappen, men vi etterligner stilen.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { YardageRow } from "./yardage-calc";
import { formatM } from "./format";

const COLOR = {
  primary: "#005840",
  accent: "#D1F843",
  foreground: "#0A1F17",
  muted: "#5E5C57",
  border: "#E5E3DD",
  card: "#FFFFFF",
  secondary: "#F1EEE5",
  background: "#FAFAF7",
} as const;

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
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
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: {
    flexDirection: "column",
  },
  brandKicker: {
    fontSize: 7,
    color: COLOR.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLOR.foreground,
  },
  brandSubtitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: COLOR.primary,
    marginTop: 2,
  },
  meta: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  metaItem: {
    fontSize: 8,
    color: COLOR.muted,
  },
  metaValue: {
    fontSize: 9,
    color: COLOR.foreground,
    fontFamily: "Helvetica-Bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLOR.secondary,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLOR.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  th: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  rowAlt: {
    backgroundColor: COLOR.card,
  },
  td: {
    fontSize: 9,
  },
  tdClub: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: COLOR.foreground,
  },
  tdNum: {
    fontFamily: "Courier",
    color: COLOR.foreground,
  },
  tdMuted: {
    fontFamily: "Courier",
    color: COLOR.muted,
  },
  // Kolonnebredder (sum ≈ 100%) for A4 landskap-tabell
  colClub: { width: "9%" },
  colShots: { width: "8%", textAlign: "right" },
  colCarry: { width: "11%", textAlign: "right" },
  colTotal: { width: "11%", textAlign: "right" },
  colSigma: { width: "10%", textAlign: "right" },
  colThree: { width: "11%", textAlign: "right" },
  colSoft: { width: "11%", textAlign: "right" },
  colApex: { width: "10%", textAlign: "right" },
  colSmash: { width: "9%", textAlign: "right" },
  colBall: { width: "10%", textAlign: "right" },
  footer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: COLOR.muted,
  },
  note: {
    marginTop: 6,
    fontSize: 8,
    color: COLOR.muted,
  },
});

function fmtM(value: number): string {
  return formatM(value);
}

function fmtNum(value: number, decimals = 1): string {
  return value
    .toFixed(decimals)
    .replace(".", ",");
}

export type YardagePdfProps = {
  rows: YardageRow[];
  playerName: string;
  generatedAt: Date;
  tempC: number;
  elevationM: number;
};

export function YardagePdfDocument({
  rows,
  playerName,
  generatedAt,
  tempC,
  elevationM,
}: YardagePdfProps) {
  const dateStr = generatedAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Document
      title={`Stock Yardage — ${playerName}`}
      author="AK Golf HQ"
      subject="Strokes Gained Coaching Hub"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandKicker}>SG Coaching Hub</Text>
            <Text style={styles.brandTitle}>Stock Yardage</Text>
            <Text style={styles.brandSubtitle}>{playerName}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaItem}>Generert</Text>
            <Text style={styles.metaValue}>{dateStr}</Text>
            <Text style={[styles.metaItem, { marginTop: 4 }]}>Forhold</Text>
            <Text style={styles.metaValue}>
              {fmtNum(tempC, 0)}°C · {fmtNum(elevationM, 0)} m
            </Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colClub]}>Kølle</Text>
          <Text style={[styles.th, styles.colShots]}>Slag</Text>
          <Text style={[styles.th, styles.colCarry]}>Carry</Text>
          <Text style={[styles.th, styles.colTotal]}>Total</Text>
          <Text style={[styles.th, styles.colSigma]}>±1σ</Text>
          <Text style={[styles.th, styles.colThree]}>3/4</Text>
          <Text style={[styles.th, styles.colSoft]}>Soft</Text>
          <Text style={[styles.th, styles.colApex]}>Apex</Text>
          <Text style={[styles.th, styles.colSmash]}>Smash</Text>
          <Text style={[styles.th, styles.colBall]}>Ball-mph</Text>
        </View>

        {rows.map((r, i) => (
          <View
            key={r.club}
            style={[styles.row, i % 2 === 0 ? styles.rowAlt : {}]}
          >
            <Text style={[styles.td, styles.tdClub, styles.colClub]}>
              {r.club}
            </Text>
            <Text style={[styles.td, styles.tdMuted, styles.colShots]}>
              {r.shotCount}
            </Text>
            <Text style={[styles.td, styles.tdNum, styles.colCarry]}>
              {fmtM(r.carryAvg)}
            </Text>
            <Text style={[styles.td, styles.tdNum, styles.colTotal]}>
              {fmtM(r.totalAvg)}
            </Text>
            <Text style={[styles.td, styles.tdMuted, styles.colSigma]}>
              ±{fmtNum(r.totalSigma)} m
            </Text>
            <Text style={[styles.td, styles.tdNum, styles.colThree]}>
              {fmtM(r.threeQuarter)}
            </Text>
            <Text style={[styles.td, styles.tdNum, styles.colSoft]}>
              {fmtM(r.soft)}
            </Text>
            <Text style={[styles.td, styles.tdNum, styles.colApex]}>
              {r.apex} m
            </Text>
            <Text style={[styles.td, styles.tdMuted, styles.colSmash]}>
              {fmtNum(r.smashAvg, 2)}
            </Text>
            <Text style={[styles.td, styles.tdMuted, styles.colBall]}>
              {fmtNum(r.ballSpeedAvg, 0)}
            </Text>
          </View>
        ))}

        <Text style={styles.note}>
          Distanser er i meter. Carry estimeres som total × 0.92-0.98 avhengig
          av køllefamilie. 3/4 = 85% av full, Soft = 78% av full. Apex er
          estimert ut fra køllefamilie og distanse. Værjustering bruker
          formel: distance × (1 + 0.0008 × (temp − 15)) + (elevation / 100).
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AK Golf Group · SG Coaching Hub</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
