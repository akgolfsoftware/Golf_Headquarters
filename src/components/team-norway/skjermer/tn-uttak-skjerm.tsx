import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnRangliste } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnFlate, TnFlatehode, TnFotnote, TnKorttittel, TnMangler, TnSkjermhode } from "../tn-flate";
import { UTTAKSKRITERIER } from "../tn-registrerte-skjermer";
import { SkjermRamme, hentSkjermbruker } from "./felles";

/**
 * TN-05 Uttak og kriterier.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-05.
 *
 * Avvik fra designet, fordi dataene ikke finnes eller reglene sier noe annet:
 *   - Kriteriene er de tre bindende (resultater, prestasjoner, prosess og adferd),
 *     ikke designets eksempeltekster per mesterskap. De summeres aldri.
 *   - EM/VM-bryteren er utelatt: ingen mesterskap, frister eller troppsstørrelser
 *     er registrert i dag.
 *   - WAGR finnes ikke i dataene. Ranglisten viser registrerte starter,
 *     snittplassering og brutto snitt, sortert på snittplassering.
 */

const tall = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const kolonner = "28px minmax(0, 1fr) 52px 60px 64px";

export async function TnUttakSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnRangliste(bruker);
  if (!data || data.kontekst.erSpiller) notFound();

  const rader = [...data.rader].sort((a, b) => {
    if (a.snittplassering === null && b.snittplassering === null) return a.navn.localeCompare(b.navn, "nb");
    if (a.snittplassering === null) return 1;
    if (b.snittplassering === null) return -1;
    return a.snittplassering - b.snittplassering;
  });

  return (
    <SkjermRamme aktiv="uttak" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/uttak" tittel="Uttak og kriterier" ingress="Kriteriene er kjent på forhånd. Ranglisten viser hvor hver spiller står i dag." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 20, alignItems: "start" }}>
        <TnFlate>
          <TnKorttittel overlinje="Uttakskriterier" tittel="Tre kriterier, hver for seg" />
          {UTTAKSKRITERIER.map((k, i) => (
            <div key={k.nummer} style={{ display: "grid", gridTemplateColumns: "72px minmax(0, 1fr)", gap: 14, padding: "14px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline" }}>
              <span style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: TN.navy900 }}>{String(i + 1).padStart(2, "0")}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{k.tittel}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: TN.textSecondary, marginTop: 2 }}>{k.tekst}</div>
                <div style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary, marginTop: 6 }}>{k.kilde}</div>
              </div>
            </div>
          ))}
          <TnFotnote>Kriteriene vurderes hver for seg og legges aldri sammen til én uttaksscore. Uttaket er trenerteamets beslutning.</TnFotnote>
        </TnFlate>

        <TnFlate>
          <TnFlatehode tittel="Rangliste · resultatgrunnlag" merknad="Kun brutto" />
          <div style={{ display: "grid", gridTemplateColumns: kolonner, gap: 10, padding: "12px 0 8px", borderBottom: `1px solid ${TN.navy100}`, fontFamily: TN.font.display, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: TN.textSecondary }}>
            <span>#</span><span>Spiller</span><span style={{ textAlign: "right" }}>Start</span><span style={{ textAlign: "right" }}>Plass</span><span style={{ textAlign: "right" }}>Brutto</span>
          </div>
          {rader.map((r, i) => (
            <Link key={r.id} href={`/team-norway/spiller/${r.id}`} style={{ display: "grid", gridTemplateColumns: kolonner, gap: 10, padding: "12px 0", minHeight: 44, alignItems: "baseline", borderBottom: `1px solid ${TN.navy100}`, textDecoration: "none", color: TN.textPrimary }}>
              <span style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary }}>{r.snittplassering === null ? "—" : i + 1}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{r.navn}</span>
                <span style={{ display: "block", fontSize: 12.5, color: TN.textSecondary, marginTop: 3 }}>{r.klubb ?? "Klubb ikke registrert"}</span>
              </span>
              <span style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>{r.starter}</span>
              <span style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>{r.snittplassering === null ? "—" : tall.format(r.snittplassering)}</span>
              <span style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>{r.bruttoScore === null ? "—" : tall.format(r.bruttoScore)}</span>
            </Link>
          ))}
          {rader.length === 0 ? <TnMangler>Ingen aktive spillere i Team Norway-gruppen.</TnMangler> : null}
          <TnFotnote>Plass = snittplassering i registrerte starter. Brutto = snitt av ekte slag. Spillere uten registrerte starter står nederst fordi ingenting er målt, ikke fordi de er dårligst. WAGR er ikke koblet til ennå.</TnFotnote>
        </TnFlate>
      </div>
    </SkjermRamme>
  );
}
