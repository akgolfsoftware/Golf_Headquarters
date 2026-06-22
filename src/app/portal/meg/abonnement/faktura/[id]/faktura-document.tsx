// PDF-dokument for én faktura (Payment).
// Bruker @react-pdf/renderer. Standardfonter (Helvetica/Courier) — react-pdf
// støtter ikke webappens fonter, men vi etterligner stilen: oblique på
// display-tittelen, Courier på tabulære tall og eyebrows.
//
// VIKTIG: Kun ekte felt fra Payment vises. Netto/MVA er en avledet 25 %-split
// (samme som skjermen i page.tsx) — ikke fabrikkerte beløp.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ── Designsystem-farger (matcher tokens i globals.css, PlayerHQ lyst tema) ──
const COLOR = {
  primary: "#005840",
  foreground: "#0A1F17",
  muted: "#5E5C57",
  border: "#E5E3DD",
  card: "#FFFFFF",
  secondary: "#F1EEE5",
  background: "#FAFAF7",
  success: "#1A7D56",
} as const;

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
  brand: { flexDirection: "column" },
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
    fontFamily: "Helvetica-Bold",
    color: COLOR.primary,
    letterSpacing: 0.5,
  },
  titleBlock: { textAlign: "right" },
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
  statusPill: {
    marginTop: 6,
    fontSize: 8,
    fontFamily: "Courier",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  // ── Meta-grid (fakturert til / fra / datoer) ──────────────────────
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  metaCol: { flex: 1, paddingRight: 8 },
  metaLabel: {
    fontSize: 7,
    fontFamily: "Courier",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: COLOR.muted,
    marginBottom: 4,
  },
  metaValue: { fontSize: 11, color: COLOR.foreground, marginBottom: 2 },
  metaSub: { fontSize: 9, color: COLOR.muted },
  // ── Linje-tabell ──────────────────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    backgroundColor: COLOR.secondary,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.border,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
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
  td: { fontSize: 9, color: COLOR.foreground },
  tdNum: { fontSize: 9, fontFamily: "Courier", color: COLOR.foreground },
  colBeskrivelse: { flex: 1, paddingRight: 4 },
  colAntall: { width: 44, textAlign: "right" },
  colPris: { width: 90, textAlign: "right" },
  colMva: { width: 44, textAlign: "right" },
  colSum: { width: 90, textAlign: "right" },
  // ── Totaler ───────────────────────────────────────────────────────
  totals: {
    marginTop: 16,
    marginLeft: "auto",
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: { fontSize: 9, fontFamily: "Courier", color: COLOR.muted },
  totalValue: { fontSize: 9, fontFamily: "Courier", color: COLOR.foreground },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.border,
  },
  grandLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR.foreground,
  },
  grandValue: {
    fontSize: 14,
    fontFamily: "Courier-Bold",
    color: COLOR.foreground,
  },
  // ── Betalingsinfo ─────────────────────────────────────────────────
  paidBox: {
    marginTop: 24,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.success,
    backgroundColor: COLOR.card,
    borderWidth: 0.5,
    borderColor: COLOR.border,
  },
  paidText: { fontSize: 9, color: COLOR.foreground },
  paidMono: { fontFamily: "Courier", color: COLOR.muted },
  // ── Footer ────────────────────────────────────────────────────────
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

// ── Input-type — kun ekte Payment-avledede verdier ────────────────
export type FakturaPdfData = {
  fakturaNr: string;
  fakturaId: string;
  fakturadato: Date;
  forfallsdato: Date;
  beloepOre: number;
  nettoOre: number;
  mvaOre: number;
  statusLabel: string;
  erBetalt: boolean;
  paidAt: Date | null;
  stripeChargeId: string | null;
  beskrivelse: string;
  kjoper: { navn: string; epost: string | null };
  generertAt: Date;
};

const NOK = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function kr(ore: number): string {
  return `${NOK.format(ore / 100)} kr`;
}

function fmtLang(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
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

export function FakturaDocument({ data }: { data: FakturaPdfData }) {
  return (
    <Document
      title={`Faktura #${data.fakturaNr} – AK Golf Academy`}
      author="AK Golf HQ"
      subject={data.beskrivelse}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandMark}>AK Golf · Faktura</Text>
            <Text style={styles.brandName}>AK GOLF ACADEMY AS</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>Faktura</Text>
            <Text style={styles.title}>#{data.fakturaNr}</Text>
            <Text
              style={[
                styles.statusPill,
                { color: data.erBetalt ? COLOR.success : COLOR.muted },
              ]}
            >
              {data.statusLabel}
            </Text>
          </View>
        </View>

        {/* Meta-grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Fakturert til</Text>
            <Text style={styles.metaValue}>{data.kjoper.navn}</Text>
            {data.kjoper.epost ? (
              <Text style={styles.metaSub}>{data.kjoper.epost}</Text>
            ) : null}
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Fakturert fra</Text>
            <Text style={styles.metaValue}>AK Golf Academy AS</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Datoer</Text>
            <Text style={styles.metaSub}>
              Fakturadato {fmtLang(data.fakturadato)}
            </Text>
            <Text style={styles.metaSub}>
              Forfaller {fmtLang(data.forfallsdato)}
            </Text>
            <Text style={styles.metaSub}>Faktura-ID {data.fakturaId}</Text>
          </View>
        </View>

        {/* Linjer */}
        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colBeskrivelse]}>Beskrivelse</Text>
          <Text style={[styles.th, styles.colAntall]}>Antall</Text>
          <Text style={[styles.th, styles.colPris]}>Stk-pris</Text>
          <Text style={[styles.th, styles.colMva]}>MVA</Text>
          <Text style={[styles.th, styles.colSum]}>Sum</Text>
        </View>
        <View style={styles.tableRow} wrap={false}>
          <Text style={[styles.td, styles.colBeskrivelse]}>
            {data.beskrivelse}
          </Text>
          <Text style={[styles.tdNum, styles.colAntall]}>1</Text>
          <Text style={[styles.tdNum, styles.colPris]}>{kr(data.nettoOre)}</Text>
          <Text style={[styles.tdNum, styles.colMva]}>25 %</Text>
          <Text style={[styles.tdNum, styles.colSum]}>{kr(data.nettoOre)}</Text>
        </View>

        {/* Totaler */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Netto</Text>
            <Text style={styles.totalValue}>{kr(data.nettoOre)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MVA (25 %)</Text>
            <Text style={styles.totalValue}>{kr(data.mvaOre)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>{kr(data.beloepOre)}</Text>
          </View>
        </View>

        {/* Betalingsinfo — kun ekte data */}
        {data.erBetalt && data.paidAt ? (
          <View style={styles.paidBox}>
            <Text style={styles.paidText}>
              Betalt {fmtLang(data.paidAt)}
              {data.stripeChargeId ? (
                <>
                  . Transaksjons-ID{" "}
                  <Text style={styles.paidMono}>{data.stripeChargeId}</Text>
                </>
              ) : null}
              .
            </Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Generert {fmtDatoTid(data.generertAt)} via AK Golf HQ · akgolf.no
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

// ── Delt avledning fra Payment → FakturaPdfData ───────────────────
// Holder PDF, e-post og skjerm konsistente. Kun ekte Payment-felt inn.
export type FakturaPaymentInput = {
  id: string;
  amountOre: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  description: string | null;
  stripeChargeId: string | null;
  stripeInvoiceId: string | null;
};

function statusLabelFor(status: string): { label: string; betalt: boolean } {
  switch (status) {
    case "SUCCEEDED":
      return { label: "Betalt", betalt: true };
    case "PARTIALLY_REFUNDED":
      return { label: "Delvis refundert", betalt: true };
    case "REFUNDED":
      return { label: "Refundert", betalt: false };
    case "FAILED":
      return { label: "Feilet", betalt: false };
    default:
      return { label: "Venter", betalt: false };
  }
}

export function byggFakturaData(
  payment: FakturaPaymentInput,
  kjoper: { navn: string; epost: string | null },
): FakturaPdfData {
  const fakturadato = payment.paidAt ?? payment.createdAt;
  const forfallsdato = new Date(
    fakturadato.getTime() + 14 * 24 * 60 * 60 * 1000,
  );
  const beloepOre = payment.amountOre;
  const nettoOre = Math.round(beloepOre * 0.8);
  const mvaOre = beloepOre - nettoOre;
  const { label, betalt } = statusLabelFor(payment.status);

  const beskrivelse =
    payment.description ??
    `Abonnement — ${fakturadato.toLocaleDateString("nb-NO", {
      month: "long",
      year: "numeric",
    })}`;

  return {
    fakturaNr: payment.stripeInvoiceId ?? payment.id.slice(-7),
    fakturaId: payment.stripeInvoiceId ?? payment.id.slice(-12),
    fakturadato,
    forfallsdato,
    beloepOre,
    nettoOre,
    mvaOre,
    statusLabel: label,
    erBetalt: betalt,
    paidAt: payment.paidAt,
    stripeChargeId: payment.stripeChargeId,
    beskrivelse,
    kjoper,
    generertAt: new Date(),
  };
}

export function fakturaFilnavn(fakturaNr: string): string {
  const slug = fakturaNr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `faktura-${slug || "ak-golf"}.pdf`;
}
