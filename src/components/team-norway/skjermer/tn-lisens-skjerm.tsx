import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSpillere, hentTnSpillerstatuser, type TnSpillerstatusRad } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnRutenett, TnSkjermhode } from "../tn-flate";
import { LISENS_TEKST, TnSpillerstatusSkjema } from "../tn-redigering-skjema";
import { SkjermRamme, datoKort, datoLang, hentSkjermbruker, osloDag } from "./felles";

/**
 * TN-10 Lisens, helse og stipend.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-10.
 *
 * Avvik:
 *   - Lisens, helseattest og antidoping registreres per spiller og år av trener
 *     (Anders 27.09.2026). Bare datoer og status lagres, ingen helseopplysninger.
 *     Spilleren ser sin egen rad.
 *   - Stipend, budsjett og kjøregodtgjørelse har fortsatt ingen datamodell.
 *     Beløp vises ikke før de kan leses fra en ekte kilde.
 */

const DAG_MS = 24 * 60 * 60 * 1000;

function helseMerke(utloper: Date | null, naa: Date): { tekst: string; farge: string } {
  if (!utloper) return { tekst: "Ikke registrert", farge: TN.textSecondary };
  const dager = Math.floor((utloper.getTime() - naa.getTime()) / DAG_MS);
  if (dager < 0) return { tekst: `Utløpt ${datoKort(utloper)}`, farge: TN.status.redText };
  if (dager <= 30) return { tekst: `Frist ${datoKort(utloper)}`, farge: TN.red600 };
  return { tekst: `Gyldig til ${datoKort(utloper)}`, farge: TN.status.greenText };
}

const dagStreng = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const KOLONNER = "minmax(0, 1.4fr) repeat(3, minmax(0, 1fr)) auto";

export async function TnLisensSkjerm() {
  const bruker = await hentSkjermbruker();
  const spillerside = await hentTnSpillere(bruker);
  if (!spillerside) notFound();
  const { kontekst } = spillerside;
  const naa = new Date();
  const aar = osloDag(naa).aar;
  const status = await hentTnSpillerstatuser(bruker, kontekst, aar);
  const tom: TnSpillerstatusRad = { spillerId: "", lisensStatus: null, lisensBetaltDato: null, helseattestUtloper: null, antidopingSignert: null };

  return (
    <SkjermRamme aktiv="lisens" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute="/team-norway/lisens-okonomi" tittel="Lisens, helse og stipend" ingress="Dokumentene som må være i orden før du kan stille, og pengene du har krav på." />

      <TnFlate>
        <TnFlatehode tittel={`Lisens og dokumenter ${aar}`} merknad={`${status.size} / ${spillerside.rader.length} REGISTRERT`} />
        <div role="table" aria-label={`Lisens og dokumenter ${aar}`}>
          <div role="row" className="hidden md:grid" style={{ gridTemplateColumns: KOLONNER, gap: 12, padding: "12px 0 8px", borderBottom: `1px solid ${TN.navy100}` }}>
            {["Spiller", "Lisens", "Helseattest", "Antidoping", ""].map((k, i) => <TnEtikett key={i} style={{ fontSize: 10.5 }}><span role="columnheader">{k}</span></TnEtikett>)}
          </div>
          {spillerside.rader.map((r) => {
            const s = status.get(r.id) ?? tom;
            const helse = helseMerke(s.helseattestUtloper, naa);
            return (
              <div role="row" key={r.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "6px 12px", padding: "10px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "center" }} className="md:!grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
                <span role="cell" style={{ minWidth: 0 }}>
                  {kontekst.erSpiller ? <span style={{ fontSize: 14.5, fontWeight: 700 }}>{r.navn}</span> : <Link href={`/team-norway/spiller/${r.id}/oversikt`} style={{ fontSize: 14.5, fontWeight: 700, color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center", overflowWrap: "anywhere" }}>{r.navn}</Link>}
                </span>
                <span role="cell" style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: s.lisensStatus === "BETALT" || s.lisensStatus === "FRITAK" ? TN.status.greenText : TN.textSecondary }}>
                  {s.lisensStatus ? `${LISENS_TEKST[s.lisensStatus] ?? s.lisensStatus}${s.lisensBetaltDato ? ` ${datoKort(s.lisensBetaltDato)}` : ""}` : "Ikke registrert"}
                </span>
                <span role="cell" style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: helse.farge }}>{helse.tekst}</span>
                <span role="cell" style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: s.antidopingSignert ? TN.status.greenText : TN.textSecondary }}>{s.antidopingSignert ? `Signert ${datoLang(s.antidopingSignert)}` : "Ikke registrert"}</span>
                <span role="cell">
                  {kontekst.kanAdministrere ? (
                    <TnSpillerstatusSkjema spillerId={r.id} spillerNavn={r.navn} aar={aar} standard={{ lisensStatus: s.lisensStatus ?? "", lisensBetaltDato: dagStreng(s.lisensBetaltDato), helseattestUtloper: dagStreng(s.helseattestUtloper), antidopingSignert: dagStreng(s.antidopingSignert) }} />
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
        {spillerside.rader.length === 0 ? <TnMangler>Ingen spillere i gruppen ennå.</TnMangler> : null}
        <TnFotnote>Helseattesten må gjelde hele samlingsperioden. Rødt betyr at den utløper innen 30 dager. Ren Utøver-kurset tas hos Antidoping Norge.</TnFotnote>
      </TnFlate>

      <TnRutenett>
        <TnFlate>
          <TnFlatehode tittel="Stipend og budsjett" merknad="Ikke registrert" />
          <TnMangler>Stipendnivå, utstyrsstipend og samlingsbudsjett er ikke registrert. Beløp vises først når de kan leses fra en ekte kilde.</TnMangler>
        </TnFlate>
        <TnFlate>
          <TnFlatehode tittel="Kjøregodtgjørelse og refusjon" merknad="Ikke registrert" />
          <TnMangler>Refusjoner for landslagsreiser kan ikke sendes inn herfra ennå. Bruk forbundets eget skjema inntil videre.</TnMangler>
        </TnFlate>
      </TnRutenett>
    </SkjermRamme>
  );
}
