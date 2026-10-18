import { notFound } from "next/navigation";

import { hentTnRangliste, hentTnUttak, hentTnUttaksrunder } from "@/lib/domain/tn-arbeidsflate";
import { avPlasser, byggUttaksrunder, velgHeltRunde, type TnUttaksrunde } from "@/lib/domain/tn-uttaksrunder";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnListerad, TnMangler, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { UTTAKSKRITERIER } from "../tn-registrerte-skjermer";
import { TnKnapperekke } from "../tn-handlinger";
import { TnHelt, TnHeltKnapper, TnHeltSporsmaal, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { TnSlettUttak, TnUttakSkjema, TnUttaksrundeSkjema, UTTAK_TEKST } from "../tn-redigering-skjema";
import { SkjermRamme, datoLang, hentSkjermbruker, osloDag } from "./felles";
import u from "./tn-uttak.module.css";

/**
 * TN-05 Uttak og kriterier.
 * Utkast 2, retning B (godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-tn/uttak.html, skjerm Uttak og kriterier (pakke 4).
 * Helteflaten viser runden med nærmeste uttaksfrist; finnes ingen frist fram i
 * tid, den sist avgjorte runden. Frist og plasser settes av trener per runde
 * (TnUttaksrunde, nattkjøring 18.10.2026). Uten verdi vises «—».
 *
 * Avvik:
 *   - Kriteriene er de tre bindende (resultater, prestasjoner, prosess og adferd).
 *     De summeres aldri. Kriterium 3 har ingen vedtatt vurderingsmodell.
 *   - Uttaksrundene er arrangementene det er registrert uttak eller frist for.
 *     «Send til spillerne» har ingen datamodell. Uttak registreres per spiller
 *     med begrunnelse (Anders 27.09.2026).
 *   - Kandidater-telleren og ukestolpen fram mot fristen er ikke med: kandidater
 *     har ingen datamodell, og dagene til fristen står som hovedtall.
 *   - «Registrer uttak» er et ark, ikke en egen skjerm: uttak lagres per spiller
 *     og det finnes ingen «send til spillerne».
 *   - Ranglisten har egen side (Rangliste) og står ikke her.
 */

const fristFormat = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const fristKortFormat = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" });

function fristLang(dag: string) {
  return fristFormat.format(new Date(`${dag}T00:00:00.000Z`));
}

function fristKort(dag: string | null) {
  return dag ? fristKortFormat.format(new Date(`${dag}T00:00:00.000Z`)).replace(".", "") : "—";
}

function plasserTekst(r: TnUttaksrunde) {
  const plasser = r.plasser === null ? `${r.tattUt} tatt ut, antall plasser er ikke satt` : `${r.tattUt} av ${r.plasser} plasser`;
  const reserver = r.reserver === null ? `${r.reserve} ${r.reserve === 1 ? "reserve" : "reserver"}` : `${r.reserve} av ${r.reserver} reserver`;
  return `${plasser} og ${reserver} er satt.`;
}

function rundeVerdier(r: TnUttaksrunde) {
  return { arrangement: r.arrangement, frist: r.frist ?? "", plasser: r.plasser?.toString() ?? "", reserver: r.reserver?.toString() ?? "" };
}

export async function TnUttakSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnRangliste(bruker);
  if (!data || data.kontekst.erSpiller) notFound();

  const [uttak, rundeData] = await Promise.all([hentTnUttak(bruker, data.kontekst), hentTnUttaksrunder(bruker, data.kontekst)]);
  const idag = osloDag(new Date());
  const runder = byggUttaksrunder(uttak, rundeData, `${idag.aar}-${String(idag.maned).padStart(2, "0")}-${String(idag.dag).padStart(2, "0")}`);
  const helt = velgHeltRunde(runder);
  const kommendeFrist = helt && helt.dagerTilFrist !== null && helt.dagerTilFrist >= 0 ? helt.dagerTilFrist : null;
  const spillernavn = new Map(data.rader.map((r) => [r.id, r.navn]));
  const spillervalg = [...data.rader].sort((a, b) => a.navn.localeCompare(b.navn, "nb")).map((r) => ({ id: r.id, navn: r.navn }));
  const kanAdministrere = data.kontekst.kanAdministrere;

  return (
    <SkjermRamme aktiv="uttak" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        overlinje={`Uttakskriterier · sesong ${idag.aar}`}
        tittel="Uttak og kriterier"
        ingress="Kriteriene er kjent på forhånd. Ranglisten viser hvor hver spiller står i dag."
      />

      <TnHelt
        etikett="Uttak"
        venstre={
          <>
            {helt && kommendeFrist !== null ? (
              <>
                <TnHeltSporsmaal>Hvor lang tid har du til neste uttak?</TnHeltSporsmaal>
                <TnHeltTall verdi={kommendeFrist}>{kommendeFrist === 1 ? "dag" : "dager"} til uttaksfristen</TnHeltTall>
                <TnHeltTekst>{helt.arrangement}, frist {fristLang(helt.frist!)}. {plasserTekst(helt)}</TnHeltTekst>
              </>
            ) : helt ? (
              <>
                <TnHeltSporsmaal>Hvor langt har du kommet med uttaket?</TnHeltSporsmaal>
                <TnHeltTall verdi={helt.tattUt}>tatt ut</TnHeltTall>
                <TnHeltTekst>{helt.arrangement}. {helt.frist ? `Fristen var ${fristLang(helt.frist)}.` : "Frist er ikke satt."} {plasserTekst(helt)}</TnHeltTekst>
              </>
            ) : (
              <>
                <TnHeltSporsmaal>Hvor langt har du kommet med uttaket?</TnHeltSporsmaal>
                <TnHeltTall verdi="—" />
                <TnHeltTekst>Ingen uttak er registrert ennå.</TnHeltTekst>
              </>
            )}
            {kanAdministrere ? (
              <TnHeltKnapper>
                {spillervalg.length > 0 ? <TnUttakSkjema spillere={spillervalg} knapp="Registrer uttak" variant="hvit" /> : null}
                <TnUttaksrundeSkjema knapp={helt ? "Frist og plasser" : "Ny uttaksrunde"} variant="konturHvit" standard={helt ? rundeVerdier(helt) : undefined} />
              </TnHeltKnapper>
            ) : null}
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: fristKort(helt?.frist ?? null), tekst: "frist" },
              { verdi: helt ? avPlasser(helt.tattUt, helt.plasser) : "—", tekst: "tatt ut" },
              { verdi: helt ? avPlasser(helt.reserve, helt.reserver) : "—", tekst: "reserver" },
            ]}
          />
        }
      />

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Tre kriterier, hver for seg" />
        <div className={u.kriterier}>
          {UTTAKSKRITERIER.map((k, i) => (
            <div key={k.nummer} className={u.kriterium}>
              <span className={u.nr}>{k.nummer}</span>
              <h3>{k.tittel}</h3>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: TN.ink700 }}>{k.tekst}</p>
              {i === 2 ? <TnPille>Vurderingsmodell ikke vedtatt</TnPille> : <span style={{ fontSize: 12.5, color: TN.ink500 }}>{k.kilde}</span>}
            </div>
          ))}
        </div>
        <TnFotnote>Kriteriene vurderes hver for seg og legges aldri sammen til én uttaksscore. Uttaket er trenerteamets beslutning.</TnFotnote>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Uttaksrunder" merknad={`${runder.length} ${runder.length === 1 ? "runde" : "runder"} · ${uttak.length} uttak`} />
        {runder.map((runde) => {
          const rader = uttak.filter((x) => x.arrangement === runde.arrangement);
          return (
            <TnFlate key={runde.arrangement} style={{ paddingBlock: 4 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "4px 12px", padding: "12px 0 4px", minWidth: 0 }}>
                <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <b style={{ fontSize: 15, overflowWrap: "anywhere" }}>{runde.arrangement}</b>
                  <span style={{ fontSize: 12.5, color: TN.ink500 }}>
                    Frist {runde.frist ? datoLang(new Date(`${runde.frist}T12:00:00.000Z`)) : "—"} · {runde.plasser === null ? "plasser —" : `${runde.plasser} ${runde.plasser === 1 ? "plass" : "plasser"}`} · {runde.reserver === null ? "reserver —" : `${runde.reserver} ${runde.reserver === 1 ? "reserve" : "reserver"}`}
                  </span>
                </span>
                <span style={{ display: "grid", justifyItems: "end", gap: 4 }}>
                  <span style={{ fontSize: 12.5, color: TN.ink500 }}>{avPlasser(runde.tattUt, runde.plasser)} tatt ut · {avPlasser(runde.reserve, runde.reserver)} reserve</span>
                  {kanAdministrere ? <TnUttaksrundeSkjema knapp="Frist og plasser" variant="tekst" standard={rundeVerdier(runde)} /> : null}
                </span>
              </div>
              {rader.map((x) => {
                const navn = spillernavn.get(x.spillerId) ?? "Tidligere spiller";
                return (
                  <TnListerad
                    key={x.id}
                    foran={<TnInitialer navn={navn} />}
                    tittel={navn}
                    tekst={<>{datoLang(x.decidedAt)}{x.begrunnelse ? <span style={{ display: "block", whiteSpace: "pre-line", color: TN.ink700 }}>{x.begrunnelse}</span> : null}</>}
                    hoyre={
                      <span style={{ display: "grid", justifyItems: "end", gap: 4 }}>
                        <TnPille tone={x.status === "UTTATT" ? "green" : x.status === "RESERVE" ? "amber" : "nøytral"}>{UTTAK_TEKST[x.status] ?? x.status}</TnPille>
                        {kanAdministrere ? (
                          <TnKnapperekke>
                            <TnUttakSkjema spillere={spillervalg} knapp="Endre" variant="tekst" standard={{ spillerId: x.spillerId, arrangement: x.arrangement, status: x.status, begrunnelse: x.begrunnelse ?? "" }} />
                            <TnSlettUttak id={x.id} beskrivelse={`Uttaket av ${navn} til ${x.arrangement}`} />
                          </TnKnapperekke>
                        ) : null}
                      </span>
                    }
                  />
                );
              })}
              {rader.length === 0 ? <TnMangler>Ingen spillere er tatt ut ennå.</TnMangler> : null}
            </TnFlate>
          );
        })}
        {runder.length === 0 ? <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen uttak er registrert ennå. {kanAdministrere ? "Registrer uttak når trenerteamet har bestemt." : ""}</TnMangler></TnFlate> : null}
        <TnTekstlenke href="/team-norway/rangliste">Rangliste</TnTekstlenke>
      </section>
    </SkjermRamme>
  );
}
