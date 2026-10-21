import type { hentGruppeDokumenter } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnShell } from "../tn-shell";
import { TnFilterknapper, TnFlate, TnFotnote, TnRutenett } from "../tn-flate";
import { TnHandlingLenke } from "../tn-handlinger";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltKnapper, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { TnDokumentSkjema, TnInnleggKort, TnInnleggSkjema, type TnInnlegg } from "../tn-gruppe-klient";
import { TnSlettDokument } from "../tn-redigering-skjema";
import { datoLang } from "./felles";

/**
 * TN-13 Gruppeposter og TN-14 Dokumenter i retning «Skrå» (godkjent av Anders 20.10.2026, canvaset
 * «Team Norway nøkkelskjermer», tavlene D1–D2). Ren visning: skjermene henter data og sender
 * server-handlingene hit. Skjermprøve: tests/visual/team-norway/skjermer/TN-13.tsx.
 *
 * Avvik (uendret fra pakke 6):
 *   - Mottaker er alltid hele gruppa; posten har ikke mottakerfelt.
 *   - «Send påminnelse» er et varsel i appen, én gang per innlegg, bare til dem som ikke har lest.
 *   - Spillere og foresatte ser andelen som har lest, ikke navnene.
 *   - Filtypene er de lagringen godtar. Trenere ser hvor mange som har åpnet hvert dokument.
 */

type Send = Parameters<typeof TnInnleggSkjema>[0]["send"];

export function TnGruppeposterVisning({ brukerNavn, rolleEtikett, groupId, harTrenertilgang, erTrener, gruppeNavn, utovere, under18, innlegg, send }: {
  brukerNavn: string;
  rolleEtikett: string;
  groupId: string;
  harTrenertilgang: boolean;
  erTrener: boolean;
  gruppeNavn: string;
  utovere: number;
  under18: number;
  innlegg: TnInnlegg[];
  send: Send;
}) {
  const siste = innlegg[0] ?? null;
  const ikkeLest = siste && siste.totalt > 0 ? siste.totalt - siste.lest : null;
  const alleLest = innlegg.filter((p) => p.totalt > 0 && p.lest >= p.totalt).length;
  const paaminnelser = innlegg.filter((p) => p.paaminnelse).length;
  const mottakere = under18 > 0 ? `Hele gruppen · ${utovere} spillere + foresatte` : `Hele gruppen · ${utovere} spillere`;

  return (
    <TnShell aktiv="gruppeposter" brukerNavn={brukerNavn} rolle={rolleEtikett} groupId={groupId} visTrenerflater={harTrenertilgang} kanAdministrere={harTrenertilgang}>
      <TnSkraTopp
        bilde="putting-green"
        etikett="Gruppeposter"
        overlinje={`${gruppeNavn} · ${utovere} spillere`}
        tittel="Gruppeposter"
        ingress={`Beskjeder til hele gruppa. Spillerne og foresatte ser dem i PlayerHQ.${erTrener ? " Du ser hvem som har lest hva." : ""}`}
        venstre={
          <>
            {erTrener ? (
              <TnHeltTall verdi={ikkeLest ?? "—"} enhet={siste && siste.totalt > 0 ? `av ${siste.totalt}` : undefined}>{siste ? "har ikke lest siste innlegg" : "ingen innlegg ennå"}</TnHeltTall>
            ) : (
              <TnHeltTall verdi={innlegg.length}>innlegg fra trenerteamet</TnHeltTall>
            )}
            {siste ? <TnHeltTekst>Siste fra {siste.forfatter}, {datoLang(new Date(siste.tidIso))}.</TnHeltTekst> : null}
            <TnHeltKnapper>
              <TnHandlingLenke href={`/team-norway/${groupId}/dokumenter`} variant="hvit">Dokumenter</TnHandlingLenke>
            </TnHeltKnapper>
          </>
        }
        hoyre={erTrener ? <TnHeltTellere tall={[{ verdi: innlegg.length, tekst: "innlegg" }, { verdi: alleLest, tekst: "lest av alle" }, { verdi: paaminnelser, tekst: paaminnelser === 1 ? "påminnelse sendt" : "påminnelser sendt" }]} /> : undefined}
      />
      <TnSkraKort>
        {/* Full bredde på desktop (beslutning 21.10): skjemaet over hele raden, innleggene i kolonner under. */}
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 14, alignItems: "start", minWidth: 0 }}>
          {erTrener ? <div style={{ gridColumn: "1 / -1", minWidth: 0 }}><TnInnleggSkjema send={send} forfatterNavn={brukerNavn} mottakere={mottakere} /></div> : null}

          {innlegg.map((p) => (
            <TnInnleggKort key={p.id} innlegg={p} visHvem={erTrener} kvitter={!erTrener} />
          ))}

          {innlegg.length === 0 ? (
            <TnFlate style={{ gridColumn: "1 / -1", background: TN.ink50 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TN.ink900 }}>Ingen innlegg ennå</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: TN.ink700, margin: "8px 0 0", maxWidth: "60ch" }}>
                {erTrener ? "Skriv det første innlegget til gruppen i feltet over. Du ser hvem som har lest det her." : "Trenerteamet har ikke skrevet noe til gruppen ennå."}
              </p>
            </TnFlate>
          ) : null}

          {under18 > 0 ? <div style={{ gridColumn: "1 / -1" }}><TnFotnote>Mindreårige står med fornavn og forbokstav i lesekvitteringen. Fullt navn finnes bare i spillerprofilen.</TnFotnote></div> : null}
        </div>
      </TnSkraKort>
    </TnShell>
  );
}

type Dokument = NonNullable<Awaited<ReturnType<typeof hentGruppeDokumenter>>>[number];

function filtype(navn: string) {
  const deler = navn.split(".");
  return deler.length > 1 ? deler.pop()!.toUpperCase() : "FIL";
}

function storrelse(bytes: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} MB`;
}

export function TnDokumenterVisning({ brukerNavn, brukerId, rolleEtikett, groupId, harTrenertilgang, erTrener, gruppeNavn, dokumenter, kategori, kategorier, maksMb }: {
  brukerNavn: string;
  brukerId: string;
  rolleEtikett: string;
  groupId: string;
  harTrenertilgang: boolean;
  erTrener: boolean;
  gruppeNavn: string;
  dokumenter: Dokument[];
  kategori: string | null;
  kategorier: string[];
  maksMb: number;
}) {
  const liste = dokumenter.filter((d) => !kategori || d.kategori === kategori);
  const base = `/team-norway/${groupId}/dokumenter`;
  const lastetOpp = dokumenter.filter((d) => d.kilde === "LASTET_OPP").length;

  return (
    <TnShell aktiv="dokumenter" brukerNavn={brukerNavn} rolle={rolleEtikett} groupId={groupId} visTrenerflater={harTrenertilgang} kanAdministrere={harTrenertilgang}>
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett="Dokumenter"
        overlinje={`${gruppeNavn} · Gruppe`}
        tittel="Dokumenter"
        ingress={`Program, planer og avtaler for gruppa.${erTrener ? " Du ser hvor mange som har åpnet hvert dokument." : ""}`}
        venstre={
          <>
            <TnHeltTall verdi={dokumenter.length}>{dokumenter.length === 1 ? "dokument" : "dokumenter"}</TnHeltTall>
            <TnHeltTekst>{dokumenter[0] ? `Sist lagt til ${datoLang(dokumenter[0].oppdatert)}.` : "Ingen dokumenter er delt ennå."}</TnHeltTekst>
            <TnHeltKnapper>
              <TnHandlingLenke href={`/team-norway/${groupId}`} variant="konturHvit">Gruppeposter</TnHandlingLenke>
            </TnHeltKnapper>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: lastetOpp, tekst: "lastet opp" }, { verdi: dokumenter.length - lastetOpp, tekst: "fra innlegg" }, { verdi: kategorier.filter((k) => dokumenter.some((d) => d.kategori === k)).length, tekst: "kategorier i bruk" }]} />}
      />
      <TnSkraKort>
        <TnRutenett min={340}>
          <TnFlate style={{ display: "grid", gap: 12 }}>
            <TnFilterknapper
              etikett="Filtrer dokumenter"
              valg={[
                { href: base, label: "Alle", aktiv: kategori === null, antall: dokumenter.length },
                ...kategorier.map((k) => ({ href: `${base}?kategori=${k.toLowerCase()}`, label: k, aktiv: kategori === k, antall: dokumenter.filter((d) => d.kategori === k).length })),
              ]}
            />
            <section aria-label="Dokumenter" style={{ display: "grid", minWidth: 0 }}>
              {liste.map((d) => (
                <div key={d.attachmentId} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "6px 16px", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${TN.ink100}` }}>
                  <a href={`/api/team-norway/vedlegg/${encodeURIComponent(d.attachmentId)}`} style={{ flex: "1 1 240px", minWidth: 0, minHeight: 44, display: "flex", gap: 12, alignItems: "center", color: TN.textPrimary, textDecoration: "none" }}>
                    <span aria-hidden="true" style={{ width: 44, height: 44, flex: "none", borderRadius: 10, background: TN.navy100, color: TN.navy900, fontFamily: TN.font.mono, fontWeight: 600, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {filtype(d.fileName).slice(0, 4)}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{d.fileName}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: TN.ink500, marginTop: 2, overflowWrap: "anywhere" }}>
                        {d.kategori ?? (d.kilde === "LASTET_OPP" ? "Uten kategori" : "Fra innlegg")} · {d.opplasterNavn} · {datoLang(d.oppdatert)} · {storrelse(d.fileSize)}
                      </span>
                    </span>
                  </a>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {erTrener ? <span style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.ink700, whiteSpace: "nowrap" }}>{d.kvittering.apnet}/{d.kvittering.totalt} åpnet</span> : null}
                    {harTrenertilgang || d.opplasterId === brukerId ? <TnSlettDokument id={d.attachmentId} navn={d.fileName} /> : null}
                  </div>
                </div>
              ))}
              {liste.length === 0 ? (
                <div style={{ padding: "12px 0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TN.ink900 }}>{dokumenter.length === 0 ? "Ingen dokumenter" : "Ingen treff"}</div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: TN.ink700, margin: "8px 0 0", maxWidth: "60ch" }}>
                    {dokumenter.length > 0
                      ? "Ingen dokumenter i denne kategorien."
                      : erTrener
                        ? "Last opp sesongplan, uttakskriterier og reiseinfo, så finner spillerne alt på ett sted."
                        : "Trenerteamet har ikke delt noen dokumenter ennå."}
                  </p>
                </div>
              ) : null}
            </section>
          </TnFlate>
          {erTrener ? (
            <TnFlate style={{ display: "grid", gap: 8 }}>
              <TnDokumentSkjema groupId={groupId} maksMb={maksMb} kategorier={kategorier} />
            </TnFlate>
          ) : null}
        </TnRutenett>
      </TnSkraKort>
    </TnShell>
  );
}
