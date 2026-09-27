import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnRangliste, hentTnUttak } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnFlate, TnFlatehode, TnFotnote, TnKorttittel, TnMangler, TnSkjermhode } from "../tn-flate";
import { UTTAKSKRITERIER } from "../tn-registrerte-skjermer";
import { TnKnapperekke } from "../tn-handlinger";
import { TnSlettUttak, TnUttakSkjema, UTTAK_TEKST } from "../tn-redigering-skjema";
import { SkjermRamme, datoLang, hentSkjermbruker } from "./felles";

/**
 * TN-05 Uttak og kriterier.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-05.
 *
 * Avvik:
 *   - Kriteriene er de tre bindende (resultater, prestasjoner, prosess og adferd),
 *     ikke designets eksempeltekster per mesterskap. De summeres aldri.
 *   - EM/VM-bryteren er utelatt: ingen mesterskap, frister eller troppsstørrelser
 *     er registrert i dag.
 *   - WAGR finnes ikke i dataene. Ranglisten viser registrerte starter,
 *     snittplassering og brutto snitt, sortert på snittplassering.
 *   - Uttak registreres per spiller og arrangement, med begrunnelse
 *     (Anders 27.09.2026). Ingen score regnes ut; det er trenerens beslutning.
 */

const tall = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const kolonner = "28px minmax(0, 1fr) 52px 60px 64px";

export async function TnUttakSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnRangliste(bruker);
  if (!data || data.kontekst.erSpiller) notFound();

  const uttak = await hentTnUttak(data.kontekst);
  const spillernavn = new Map(data.rader.map((r) => [r.id, r.navn]));
  const spillervalg = [...data.rader].sort((a, b) => a.navn.localeCompare(b.navn, "nb")).map((r) => ({ id: r.id, navn: r.navn }));
  const arrangementer = [...new Set(uttak.map((u) => u.arrangement))];

  const rader = [...data.rader].sort((a, b) => {
    if (a.snittplassering === null && b.snittplassering === null) return a.navn.localeCompare(b.navn, "nb");
    if (a.snittplassering === null) return 1;
    if (b.snittplassering === null) return -1;
    return a.snittplassering - b.snittplassering;
  });

  return (
    <SkjermRamme aktiv="uttak" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        rute="/team-norway/uttak"
        tittel="Uttak og kriterier"
        ingress="Kriteriene er kjent på forhånd. Ranglisten viser hvor hver spiller står i dag."
        handling={data.kontekst.kanAdministrere && spillervalg.length > 0 ? <TnUttakSkjema spillere={spillervalg} knapp="Registrer uttak" /> : undefined}
      />

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
            <Link key={r.id} href={`/team-norway/spiller/${r.id}/oversikt`} style={{ display: "grid", gridTemplateColumns: kolonner, gap: 10, padding: "12px 0", minHeight: 44, alignItems: "baseline", borderBottom: `1px solid ${TN.navy100}`, textDecoration: "none", color: TN.textPrimary }}>
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

      <TnFlate>
        <TnFlatehode tittel="Uttak" merknad={`${uttak.length} REGISTRERT`} />
        {arrangementer.map((a) => (
          <div key={a} style={{ marginTop: 18 }}>
            <div style={{ fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: TN.navy900, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}`, overflowWrap: "anywhere" }}>{a}</div>
            {uttak.filter((u) => u.arrangement === a).map((u) => {
              const navn = spillernavn.get(u.spillerId) ?? "Tidligere spiller";
              return (
                <div key={u.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "4px 16px", padding: "10px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{navn}</div>
                    <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2 }}>{UTTAK_TEKST[u.status] ?? u.status} · {datoLang(u.decidedAt)}</div>
                    {u.begrunnelse ? <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{u.begrunnelse}</p> : null}
                  </div>
                  {data.kontekst.kanAdministrere ? (
                    <TnKnapperekke>
                      <TnUttakSkjema spillere={spillervalg} knapp="Endre" variant="tekst" standard={{ spillerId: u.spillerId, arrangement: u.arrangement, status: u.status, begrunnelse: u.begrunnelse ?? "" }} />
                      <TnSlettUttak id={u.id} beskrivelse={`Uttaket av ${navn} til ${u.arrangement}`} />
                    </TnKnapperekke>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
        {uttak.length === 0 ? <TnMangler>Ingen uttak er registrert ennå. {data.kontekst.kanAdministrere ? "Registrer uttak når trenerteamet har bestemt." : ""}</TnMangler> : null}
      </TnFlate>
    </SkjermRamme>
  );
}
