// PDF-scorekort for Del runde (PlayerHQ pakke 13). @react-pdf/renderer med standardfonter.
// Bare brutto og tall spilleren selv har ført. Manglende verdi vises som «—».
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { motParOrd, sgTekst, type DelRundeData } from "@/lib/portal-analyse/del-runde";

// Standardfontene i PDF har ikke ekte minustegn (U+2212); bindestrek brukes i stedet.
const pdfTall = (t: string) => t.replace(/\u2212/g, "-");
const motParPdf = (v: number) => (v === 0 ? "0" : v > 0 ? `+${v}` : `-${Math.abs(v)}`);

const G900 = "#141413";
const G600 = "#5e5d59";
const SAND = "#ddd9d1";
const SAND100 = "#faf8f3";

const s = StyleSheet.create({
  side: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: G900 },
  kicker: { fontSize: 9, color: G600, textTransform: "uppercase", letterSpacing: 1 },
  tittel: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 4 },
  under: { fontSize: 11, color: G600, marginTop: 2 },
  score: { flexDirection: "row", alignItems: "flex-end", marginTop: 18, gap: 10 },
  scoreTall: { fontSize: 44, fontFamily: "Courier-Bold" },
  scoreOrd: { fontSize: 12, color: G600, marginBottom: 8 },
  tabell: { marginTop: 18, borderTopWidth: 1, borderColor: SAND },
  rad: { flexDirection: "row", borderBottomWidth: 1, borderColor: SAND, paddingVertical: 5 },
  hode: { backgroundColor: SAND100 },
  celle: { flex: 1, textAlign: "right", fontFamily: "Courier" },
  forste: { flex: 1, textAlign: "left", fontFamily: "Helvetica" },
  fet: { fontFamily: "Courier-Bold" },
  sg: { flexDirection: "row", marginTop: 18, gap: 8 },
  sgBoks: { flex: 1, backgroundColor: SAND100, padding: 8 },
  sgNavn: { fontSize: 9, color: G600 },
  sgTall: { fontSize: 14, fontFamily: "Courier-Bold", marginTop: 2 },
  kilde: { marginTop: 18, fontSize: 8.5, color: G600 },
});

function Hullrader({ hull }: { hull: DelRundeData["hull"] }) {
  return (
    <>
      <View style={[s.rad, s.hode]}>
        <Text style={s.forste}>Hull</Text><Text style={s.celle}>Par</Text><Text style={s.celle}>Slag</Text><Text style={s.celle}>Mot par</Text>
      </View>
      {hull.map((h) => (
        <View key={h.nr} style={s.rad}>
          <Text style={s.forste}>{h.nr}</Text>
          <Text style={s.celle}>{h.par}</Text>
          <Text style={s.celle}>{h.slag}</Text>
          <Text style={s.celle}>{motParPdf(h.slag - h.par)}</Text>
        </View>
      ))}
    </>
  );
}

export function ScorekortDocument({ d, spiller }: { d: DelRundeData; spiller: string }) {
  const par = d.hull.reduce((a, h) => a + h.par, 0);
  return (
    <Document title={`Scorekort ${d.bane} ${d.dato}`} author="AK Golf HQ">
      <Page size="A4" style={s.side}>
        <Text style={s.kicker}>AK Golf HQ · Scorekort</Text>
        <Text style={s.tittel}>{d.bane}</Text>
        <Text style={s.under}>{spiller} · {d.dato}</Text>
        <View style={s.score}>
          <Text style={s.scoreTall}>{d.brutto}</Text>
          <Text style={s.scoreOrd}>brutto · {motParOrd(d.motPar)}</Text>
        </View>
        <View style={s.tabell}>
          {d.hull.length ? <Hullrader hull={d.hull} /> : <View style={s.rad}><Text style={s.forste}>Hullene er ikke ført for denne runden.</Text></View>}
          {d.hull.length > 0 && (
            <View style={s.rad}>
              <Text style={[s.forste, { fontFamily: "Helvetica-Bold" }]}>Totalt</Text>
              <Text style={[s.celle, s.fet]}>{par}</Text>
              <Text style={[s.celle, s.fet]}>{d.brutto}</Text>
              <Text style={[s.celle, s.fet]}>{d.motPar == null ? "—" : motParPdf(d.motPar)}</Text>
            </View>
          )}
        </View>
        <View style={s.sg}>
          {d.sg.map((x) => (
            <View key={x.navn} style={s.sgBoks}><Text style={s.sgNavn}>{x.navn}</Text><Text style={s.sgTall}>{pdfTall(sgTekst(x.v))}</Text></View>
          ))}
        </View>
        <Text style={s.kilde}>Brutto. Strokes Gained er estimat. Bare tall spilleren selv har ført i AK Golf HQ.</Text>
      </Page>
    </Document>
  );
}
