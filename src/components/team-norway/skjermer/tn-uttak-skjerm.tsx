import { notFound } from "next/navigation";

import { hentTnRangliste, hentTnUttak } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnListerad, TnMangler, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { UTTAKSKRITERIER } from "../tn-registrerte-skjermer";
import { TnKnapperekke } from "../tn-handlinger";
import { TnSlettUttak, TnUttakSkjema, UTTAK_TEKST } from "../tn-redigering-skjema";
import { SkjermRamme, datoLang, hentSkjermbruker, osloDag } from "./felles";
import u from "./tn-uttak.module.css";

/**
 * TN-05 Uttak og kriterier.
 * Fasit: docs/design-system/utkast-tn/uttak.html, skjerm Uttak og kriterier (pakke 4).
 *
 * Avvik:
 *   - Kriteriene er de tre bindende (resultater, prestasjoner, prosess og adferd).
 *     De summeres aldri. Kriterium 3 har ingen vedtatt vurderingsmodell.
 *   - Uttaksrundene er arrangementene det er registrert uttak for. Frist,
 *     antall plasser og «send til spillerne» har ingen datamodell. Uttak
 *     registreres per spiller med begrunnelse (Anders 27.09.2026).
 *   - Ranglisten har egen side (Rangliste) og står ikke her.
 */

export async function TnUttakSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnRangliste(bruker);
  if (!data || data.kontekst.erSpiller) notFound();

  const uttak = await hentTnUttak(bruker, data.kontekst);
  const spillernavn = new Map(data.rader.map((r) => [r.id, r.navn]));
  const spillervalg = [...data.rader].sort((a, b) => a.navn.localeCompare(b.navn, "nb")).map((r) => ({ id: r.id, navn: r.navn }));
  const arrangementer = [...new Set(uttak.map((u) => u.arrangement))];

  return (
    <SkjermRamme aktiv="uttak" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        overlinje={`Uttakskriterier · sesong ${osloDag(new Date()).aar}`}
        tittel="Uttak og kriterier"
        ingress="Kriteriene er kjent på forhånd. Ranglisten viser hvor hver spiller står i dag."
        handling={data.kontekst.kanAdministrere && spillervalg.length > 0 ? <TnUttakSkjema spillere={spillervalg} knapp="Registrer uttak" /> : undefined}
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
        <TnFlatehode tittel="Uttaksrunder" merknad={`${uttak.length} registrert`} />
        {arrangementer.map((a) => {
          const rader = uttak.filter((x) => x.arrangement === a);
          const tattUt = rader.filter((x) => x.status === "UTTATT").length;
          const reserve = rader.filter((x) => x.status === "RESERVE").length;
          return (
            <TnFlate key={a} style={{ paddingBlock: 4 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "4px 12px", padding: "12px 0 4px" }}>
                <b style={{ fontSize: 15, overflowWrap: "anywhere" }}>{a}</b>
                <span style={{ fontSize: 12.5, color: TN.ink500 }}>{tattUt} tatt ut · {reserve} reserve</span>
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
                        {data.kontekst.kanAdministrere ? (
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
            </TnFlate>
          );
        })}
        {uttak.length === 0 ? <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen uttak er registrert ennå. {data.kontekst.kanAdministrere ? "Registrer uttak når trenerteamet har bestemt." : ""}</TnMangler></TnFlate> : null}
        <TnTekstlenke href="/team-norway/rangliste">Rangliste</TnTekstlenke>
      </section>
    </SkjermRamme>
  );
}
