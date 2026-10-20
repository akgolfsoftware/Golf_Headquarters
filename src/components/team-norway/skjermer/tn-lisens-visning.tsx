import Link from "next/link";
import type { TnArbeidskontekst, TnSpillerRad, TnSpillerstatusRad } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille, type TnPilleTone } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnMangler, TnRutenett } from "../tn-flate";
import { LISENS_TEKST, TnSpillerstatusSkjema } from "../tn-redigering-skjema";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { datoKort } from "./felles";

/**
 * TN-10 Lisens og økonomi. Retning «Skrå» (pakke 6, 20.10.2026): bildetopp med spillere i orden
 * som hovedtall, og lista som kort over kanten.
 * Innholdet følger docs/design-system/utkast-tn/admin.html, skjerm Lisens og økonomi.
 *
 * Avvik:
 *   - Lisens, helseattest og antidoping registreres per spiller og år av trener
 *     (Anders 27.09.2026). Bare datoer og status lagres, ingen helseopplysninger.
 *     Spilleren ser sin egen rad.
 *   - Stipend, budsjett og kjøregodtgjørelse har ingen datamodell
 *     (README-spørsmål 9). Beløp vises ikke før de kan leses fra en ekte kilde.
 */

const DAG_MS = 24 * 60 * 60 * 1000;
type Merke = { tekst: string; tone: TnPilleTone; ok: boolean };

function helseMerke(utloper: Date | null, naa: Date): Merke {
  if (!utloper) return { tekst: "Helseattest ikke registrert", tone: "nøytral", ok: false };
  const dager = Math.floor((utloper.getTime() - naa.getTime()) / DAG_MS);
  if (dager < 0) return { tekst: `Helseattest utløpt ${datoKort(utloper)}`, tone: "red", ok: false };
  if (dager <= 30) return { tekst: `Helseattest utløper ${datoKort(utloper)}`, tone: "amber", ok: false };
  return { tekst: `Helseattest til ${datoKort(utloper)}`, tone: "green", ok: true };
}

const dagStreng = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export function TnLisensVisning({
  brukerNavn,
  visDataGolf,
  kontekst,
  spillere,
  status,
  aar,
  naa,
}: {
  brukerNavn: string | null;
  visDataGolf: boolean;
  kontekst: TnArbeidskontekst;
  spillere: TnSpillerRad[];
  status: Map<string, TnSpillerstatusRad>;
  aar: number;
  naa: Date;
}) {
  const tom: TnSpillerstatusRad = { spillerId: "", lisensStatus: null, lisensBetaltDato: null, helseattestUtloper: null, antidopingSignert: null };
  const rader = spillere.map((r) => {
    const s = status.get(r.id) ?? tom;
    const lisensOk = s.lisensStatus === "BETALT" || s.lisensStatus === "FRITAK";
    const lisens: Merke = { tekst: s.lisensStatus ? `Lisens ${(LISENS_TEKST[s.lisensStatus] ?? s.lisensStatus).toLowerCase()}${s.lisensBetaltDato ? ` ${datoKort(s.lisensBetaltDato)}` : ""}` : "Lisens ikke registrert", tone: lisensOk ? "green" : s.lisensStatus ? "red" : "nøytral", ok: lisensOk };
    const helse = helseMerke(s.helseattestUtloper, naa);
    const anti: Merke = s.antidopingSignert ? { tekst: `Antidoping ${datoKort(s.antidopingSignert)}`, tone: "green", ok: true } : { tekst: "Antidoping ikke registrert", tone: "nøytral", ok: false };
    const mangler = [lisens, helse, anti].filter((m) => !m.ok).length;
    return { r, s, merker: [lisens, helse, anti], mangler };
  });
  const iOrden = rader.filter((x) => x.mangler === 0).length;
  const helseSnart = rader.filter((x) => x.merker[1]!.tone === "amber").length;

  return (
    <TnShell aktiv="lisens" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={!kontekst.erSpiller && visDataGolf}>
      <TnSkraTopp
        bilde="putting-green"
        etikett="Lisens og økonomi"
        overlinje={`Sesong ${aar} · ${kontekst.gruppe.name}`}
        tittel="Lisens og økonomi"
        ingress="Det som må være i orden før spillerne kan stille, og det du har krav på som trener."
        venstre={
          <>
            <TnHeltTall verdi={rader.length ? `${iOrden}/${rader.length}` : "—"}>spillere i orden</TnHeltTall>
            <TnHeltTekst>Lisens, helseattest og antidoping for {aar}. Bare datoer og status lagres.</TnHeltTekst>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: rader.length - iOrden, tekst: "mangler noe" },
              { verdi: helseSnart, tekst: "helseattest utløper snart" },
            ]}
          />
        }
      />
      <TnSkraKort>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlate style={{ paddingBlock: 4 }}>
          <div style={{ paddingTop: 16 }}><TnFlatehode tittel="Lisens, helse og antidoping" merknad={`${iOrden} av ${rader.length} i orden`} /></div>
          {rader.map(({ r, s, merker, mangler }) => (
            <div key={r.id} style={{ display: "grid", gap: 8, padding: "12px 0", borderBottom: `1px solid ${TN.ink200}` }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "4px 12px" }}>
                {kontekst.erSpiller ? <b style={{ fontSize: 15 }}>{r.navn}</b> : <Link href={`/team-norway/spiller/${r.id}/oversikt`} style={{ fontSize: 15, fontWeight: 700, color: TN.ink900, minHeight: 44, display: "inline-flex", alignItems: "center", overflowWrap: "anywhere", textUnderlineOffset: 4 }}>{r.navn}</Link>}
                <span style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <TnPille tone={mangler === 0 ? "green" : merker.some((m) => m.tone === "red") ? "red" : "amber"}>{mangler === 0 ? "I orden" : `Mangler ${mangler}`}</TnPille>
                  {kontekst.kanAdministrere ? <TnSpillerstatusSkjema spillerId={r.id} spillerNavn={r.navn} aar={aar} standard={{ lisensStatus: s.lisensStatus ?? "", lisensBetaltDato: dagStreng(s.lisensBetaltDato), helseattestUtloper: dagStreng(s.helseattestUtloper), antidopingSignert: dagStreng(s.antidopingSignert) }} /> : null}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{merker.map((m) => <TnPille key={m.tekst} tone={m.tone}>{m.tekst}</TnPille>)}</div>
            </div>
          ))}
          {rader.length === 0 ? <TnMangler>Ingen spillere i gruppen ennå.</TnMangler> : null}
        </TnFlate>
        <TnFotnote>Helseattesten må gjelde hele samlingsperioden. Gult betyr at den utløper innen 30 dager. Ren Utøver-kurset tas hos Antidoping Norge.</TnFotnote>
      </section>

      <TnRutenett>
        <section style={{ display: "grid", gap: 12 }}>
          <TnFlatehode tittel="Kjøregodtgjørelse og refusjon"><TnPille>Ikke registrert</TnPille></TnFlatehode>
          <TnFlate style={{ background: TN.ink50 }}><TnMangler>Refusjoner for landslagsreiser kan ikke sendes inn herfra ennå. Bruk forbundets eget skjema inntil videre. Beløp regnes aldri ut i appen.</TnMangler></TnFlate>
        </section>
        <section style={{ display: "grid", gap: 12 }}>
          <TnFlatehode tittel="Stipend og budsjett"><TnPille>Ikke registrert</TnPille></TnFlatehode>
          <TnFlate style={{ background: TN.ink50 }}><TnMangler>Stipendnivå, utstyrsstipend og samlingsbudsjett er ikke koblet til ennå.</TnMangler></TnFlate>
        </section>
      </TnRutenett>
      </TnSkraKort>
    </TnShell>
  );
}
