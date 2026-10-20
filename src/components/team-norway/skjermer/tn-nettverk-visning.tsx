import Link from "next/link";
import type { ReactNode } from "react";

import { brukerStatusOrd } from "@/lib/domain/bruker-status";
import type { hentTnCollege, hentTnRangliste, hentTnSamlinger, hentTnSkoler, hentTnTrenere } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { initialer } from "../initialer";
import { TnDataTable } from "../tn-data-table";
import { TnDatoRad, TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnListerad, TnMangler, TnRutenett } from "../tn-flate";
import { TnHandlingLenke, TnKnapperekke } from "../tn-handlinger";
import { COLLEGE_TEKST, TnCollegeSkjema, TnSlettCollege } from "../tn-redigering-skjema";
import { TnShell, tnRolleNavn, type TnAktivSide } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnBaandListe, TnHeltKnapper, TnHeltTall, TnHeltTekst, TnHeltTellere, TnMarkor, TnSpillerrad } from "../tn-stall";
import { ER_COLLEGE, datoLang, periode } from "./felles";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";

/**
 * TN-17 Skoleoversikt, TN-06 College og USA, TN-09 Fagapparat og WANG-testresultater i retning «Skrå»
 * (godkjent av Anders 20.10.2026, canvaset «Team Norway nøkkelskjermer», tavlene E1–E4).
 * Ren visning: skjermene henter data. Skjermprøve: tests/visual/team-norway/skjermer/TN-17.tsx.
 *
 * Avvik (uendret fra tidligere pakker):
 *   - Skoler med færre enn tre spillere slås sammen til én rad uten navn (mindreårige).
 *   - Konferanse, klasse, WAGR og tilgjengelighet per samling for college har ingen datamodell.
 *   - Fagpersoner fra Olympiatoppen og oppfølgingsplan har ingen datamodell. E-post bare for administrator.
 *   - WANG-resultater: bare testresultater fra elever med gyldig delingssamtykke, uten lenke til profilen.
 */

type Hentet<F extends (...a: never[]) => Promise<unknown>> = NonNullable<Awaited<ReturnType<F>>>;

function Ramme({ aktiv, brukerNavn, kontekst, visDataGolf, children }: { aktiv: TnAktivSide; brukerNavn: string | null; kontekst: TnArbeidskontekst; visDataGolf: boolean; children: ReactNode }) {
  return (
    <TnShell aktiv={aktiv} brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={!kontekst.erSpiller && visDataGolf}>
      {children}
    </TnShell>
  );
}

const flertall = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;
const IKKE_REGISTRERT = "Ikke registrert";

// ---------------------------------------------------------------------------
// E1 Skoleoversikt
// ---------------------------------------------------------------------------

export function TnSkolerVisning({ brukerNavn, visDataGolf, data }: { brukerNavn: string | null; visDataGolf: boolean; data: Hentet<typeof hentTnSkoler> }) {
  const skoler = data.skoler
    .map((s) => ({ ...s, spillere: s.spillere.filter((p) => !ER_COLLEGE.test(p.skole ?? "")) }))
    .filter((s) => s.spillere.length > 0)
    .sort((a, b) => (a.skole === IKKE_REGISTRERT ? 1 : b.skole === IKKE_REGISTRERT ? -1 : a.skole.localeCompare(b.skole, "nb")));
  const college = data.skoler.flatMap((s) => s.spillere).filter((p) => ER_COLLEGE.test(p.skole ?? "")).length;

  const trinn = new Map<string, number>();
  for (const s of skoler) {
    if (s.skole === IKKE_REGISTRERT) continue;
    for (const p of s.spillere) {
      const t = p.skolear?.trim() || "Trinn ikke registrert";
      trinn.set(t, (trinn.get(t) ?? 0) + 1);
    }
  }
  // Små skoler (under tre spillere) vises samlet og uten navn. «Ikke registrert» vises alltid, så hullene i profilene synes.
  const store = skoler.filter((s) => s.skole === IKKE_REGISTRERT || s.spillere.length >= 3);
  const sma = skoler.filter((s) => s.skole !== IKKE_REGISTRERT && s.spillere.length < 3);
  const trinnTekst = (spillere: { skolear: string | null }[]) => {
    const m = new Map<string, number>();
    for (const p of spillere) m.set(p.skolear?.trim() || "trinn —", (m.get(p.skolear?.trim() || "trinn —") ?? 0) + 1);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb")).map(([t, n]) => `${t} ${n}`).join(" · ");
  };
  const uregistrert = skoler.find((s) => s.skole === IKKE_REGISTRERT)?.spillere.length ?? 0;
  const tall = [...trinn.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb"));
  const antallSpillere = skoler.reduce((n, s) => n + s.spillere.length, 0);
  const antallSkoler = skoler.filter((s) => s.skole !== IKKE_REGISTRERT).length;

  return (
    <Ramme aktiv="skoler" brukerNavn={brukerNavn} kontekst={data.kontekst} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett="Skoleoversikt"
        overlinje={`${data.kontekst.gruppe.name} · fra spillerprofilene`}
        tittel="Skoleoversikt"
        ingress="Skole og trinn slik spillerne har registrert det i profilen. Bruk den når samlinger skal legges utenom eksamen."
        venstre={
          <>
            <TnHeltTall verdi={antallSpillere} enhet={antallSpillere === 1 ? "spiller" : "spillere"}>{`på ${flertall(antallSkoler, "skole", "skoler")}`}</TnHeltTall>
            <TnHeltTekst>{uregistrert ? `${flertall(uregistrert, "spiller har", "spillere har")} ikke skole i profilen.` : "Alle spillerne har skole i profilen."}</TnHeltTekst>
          </>
        }
        hoyre={tall.length ? <TnHeltTellere tall={tall.slice(0, 3).map(([etikett, antall]) => ({ verdi: antall, tekst: etikett }))} /> : undefined}
      />
      <TnSkraKort>
        <TnFlate>
          <TnFlatehode tittel="Skoler og trinn" merknad={`${antallSpillere} spillere, ${antallSkoler} skoler`} />
          {store.map((s) => (
            <TnListerad
              key={s.skole}
              tittel={<span style={{ color: s.skole === IKKE_REGISTRERT ? TN.ink500 : TN.ink900 }}>{s.skole}</span>}
              tekst={<>
                {trinnTekst(s.spillere)}
                <span style={{ display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
                  {s.spillere.map((p) => <Link key={p.id} href={`/team-norway/spiller/${p.id}/oversikt`} style={{ color: TN.navy600, fontWeight: 700, minHeight: 44, display: "inline-flex", alignItems: "center", textUnderlineOffset: 4 }}>{p.navn}</Link>)}
                </span>
              </>}
              hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 600, fontSize: 18, color: TN.navy900 }}>{s.spillere.length}</span>}
            />
          ))}
          {sma.length > 0 ? (
            <TnListerad
              tittel={`${sma.length} ${sma.length === 1 ? "annen skole" : "andre skoler"}`}
              tekst="Færre enn tre spillere per skole, vises ikke enkeltvis."
              hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 600, fontSize: 18, color: TN.ink700 }}>{sma.reduce((n, s) => n + s.spillere.length, 0)}</span>}
            />
          ) : null}
          {skoler.length === 0 ? <TnMangler>Ingen spillere i gruppen ennå. Skolene vises her når spillerne er lagt inn.</TnMangler> : null}
          <TnFotnote>
            {college > 0 ? <>{college} {college === 1 ? "spiller" : "spillere"} på college i USA står under <Link href="/team-norway/college" style={{ color: TN.navy600, fontWeight: 700 }}>College og USA</Link>. </> : null}
            «Ikke registrert» er spillere uten skole i profilen. Den raden skjules ikke, så hullene i profilene synes.
          </TnFotnote>
        </TnFlate>
      </TnSkraKort>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------
// E2 College og USA
// ---------------------------------------------------------------------------

const snitt = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function TnCollegeVisning({ brukerNavn, visDataGolf, data, college, samlinger, naa }: {
  brukerNavn: string | null;
  visDataGolf: boolean;
  data: Hentet<typeof hentTnRangliste>;
  college: Awaited<ReturnType<typeof hentTnCollege>>;
  samlinger: Hentet<typeof hentTnSamlinger>["samlinger"];
  naa: Date;
}) {
  const spillere = data.rader.filter((s) => college.has(s.id) || ER_COLLEGE.test(s.skole ?? ""));
  const spillervalg = [...data.rader].sort((a, b) => a.navn.localeCompare(b.navn, "nb")).map((r) => ({ id: r.id, navn: r.navn }));
  const kommende = samlinger.filter((s) => s.endDate.getTime() >= naa.getTime()).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).slice(0, 5);
  const registrert = spillere.filter((s) => college.has(s.id)).length;

  return (
    <Ramme aktiv="college" brukerNavn={brukerNavn} kontekst={data.kontekst} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett="College-gruppen"
        overlinje={`College og USA · ${data.kontekst.gruppe.name}`}
        tittel="College-gruppen"
        ingress="Landslagsspillere på college i USA, og hvem som er på vei."
        venstre={
          <>
            <TnHeltTall verdi={spillere.length} enhet={spillere.length === 1 ? "spiller" : "spillere"}>i college-gruppen</TnHeltTall>
            <TnHeltTekst>{registrert ? `${registrert} er registrert av trener med skole og status.` : "Ingen er registrert av trener ennå."}</TnHeltTekst>
            {data.kontekst.kanAdministrere && spillervalg.length > 0 ? <TnHeltKnapper><TnCollegeSkjema spillere={spillervalg} knapp="Legg til college" variant="hvit" /></TnHeltKnapper> : null}
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: registrert, tekst: "registrert" }, { verdi: spillere.length - registrert, tekst: "fra profilen" }, { verdi: kommende.length, tekst: kommende.length === 1 ? "kommende samling" : "kommende samlinger" }]} />}
      />
      <TnSkraKort>
        <TnRutenett min={340}>
          <TnFlate>
            <TnFlatehode tittel="Utøvere på college" merknad={flertall(spillere.length, "spiller", "spillere")} />
            <TnBaandListe>
              {spillere.map((s) => {
                const reg = college.get(s.id);
                const statusTekst = reg ? COLLEGE_TEKST[reg.status] ?? reg.status : brukerStatusOrd(s.status);
                return (
                  <div key={s.id} style={{ display: "grid", gap: 8 }}>
                    <TnSpillerrad
                      href={`/team-norway/spiller/${s.id}/oversikt`}
                      status={reg || s.status === "AKTIV" ? "folger" : "ikkedelt"}
                      initialer={initialer(s.navn)}
                      navn={s.navn}
                      fakta={[reg?.skole ?? s.skole, reg ? (reg.startDato ? `start ${datoLang(reg.startDato)}` : null) : s.skolear].filter(Boolean).join(" · ") || "Skole ikke registrert"}
                      verdi={s.bruttoScore === null ? "—" : snitt.format(s.bruttoScore)}
                      verdiTekst="snitt brutto"
                      grunn={<TnMarkor status={reg || s.status === "AKTIV" ? "folger" : "ikkedelt"}>{statusTekst}</TnMarkor>}
                    />
                    {reg?.notat ? <p style={{ margin: 0, fontSize: 13, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{reg.notat}</p> : null}
                    {data.kontekst.kanAdministrere ? (
                      <TnKnapperekke>
                        <TnCollegeSkjema spillere={spillervalg} knapp={reg ? "Endre" : "Registrer"} variant="tekst" standard={{ spillerId: s.id, skole: reg?.skole ?? s.skole ?? "", status: reg?.status ?? "STUDERER", startDato: reg?.startDato ? reg.startDato.toISOString().slice(0, 10) : "", notat: reg?.notat ?? "" }} />
                        {reg ? <TnSlettCollege spillerId={s.id} navn={s.navn} /> : null}
                      </TnKnapperekke>
                    ) : null}
                  </div>
                );
              })}
            </TnBaandListe>
            {spillere.length === 0 ? <TnMangler>Ingen spillere er registrert med college ennå.</TnMangler> : null}
            <TnFotnote>Brutto snitt er ekte slag per runde i alle registrerte starter. Konferanse, klasse og WAGR er ikke koblet til ennå.</TnFotnote>
          </TnFlate>

          <TnFlate>
            <TnFlatehode tittel="Kommende samlinger" merknad={`${kommende.length} neste`} />
            {kommende.map((s) => (
              <TnDatoRad key={s.id} dato={periode(s.startDate, s.endDate)} tittel={<Link href={`/team-norway/samlinger/${s.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{s.name}</Link>} tekst={s.location ?? "Sted ikke registrert"} />
            ))}
            {kommende.length === 0 ? <TnMangler>Ingen kommende samlinger er registrert.</TnMangler> : null}
            <TnFotnote>Hvem i college-gruppen som kan stille på hver samling, kan ikke registreres ennå. Avklar direkte med spilleren og college-treneren.</TnFotnote>
          </TnFlate>
        </TnRutenett>
      </TnSkraKort>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------
// E3 Fagapparat
// ---------------------------------------------------------------------------

export function TnFagapparatVisning({ brukerNavn, visDataGolf, data }: { brukerNavn: string | null; visDataGolf: boolean; data: Hentet<typeof hentTnTrenere> }) {
  const trenere = data.rader.filter((r) => r.role === "COACH").length;
  return (
    <Ramme aktiv="fagapparat" brukerNavn={brukerNavn} kontekst={data.kontekst} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="putting-green"
        etikett="Fagapparat"
        overlinje={`Plan og fag · ${data.kontekst.gruppe.name}`}
        tittel="Fagapparat"
        ingress="Hvem i trenerteamet som følger landslagsspillerne."
        venstre={
          <>
            <TnHeltTall verdi={data.rader.length} enhet={data.rader.length === 1 ? "person" : "personer"}>i fagteamet</TnHeltTall>
            <TnHeltTekst>Fagpersoner fra Olympiatoppen kan ikke registreres ennå.</TnHeltTekst>
            {data.kontekst.kanAdministrere ? <TnHeltKnapper><TnHandlingLenke href="/team-norway/tilgang" variant="hvit">Legg til trener</TnHandlingLenke></TnHeltKnapper> : null}
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: trenere, tekst: trenere === 1 ? "trener" : "trenere" }, { verdi: data.rader.length - trenere, tekst: "Assist Coach" }, { verdi: "—", tekst: "Olympiatoppen" }]} />}
      />
      <TnSkraKort>
        <TnFlate style={{ paddingBlock: 4 }}>
          <TnFlatehode tittel="Fagteam" merknad={flertall(data.rader.length, "person", "personer")} />
          {data.rader.length === 0 ? <TnMangler>Ingen aktive trenere er registrert i Team Norway-gruppen.</TnMangler> : null}
          {data.rader.map((rad) => (
            <TnListerad
              key={rad.user.id}
              foran={<TnInitialer navn={rad.user.name ?? "?"} />}
              tittel={rad.user.name ?? "Navn mangler"}
              tekst={<>
                {tnRolleNavn(rad.role)} · aktiv siden {datoLang(rad.joinedAt)}
                {data.kontekst.kanAdministrere && rad.user.email ? <a href={`mailto:${rad.user.email}`} style={{ display: "flex", alignItems: "center", minHeight: 44, color: TN.navy600, fontWeight: 700, overflowWrap: "anywhere", textUnderlineOffset: 4 }}>{rad.user.email}</a> : null}
              </>}
              hoyre={<TnPille tone={rad.role === "COACH" ? "info" : "nøytral"}>{tnRolleNavn(rad.role)}</TnPille>}
            />
          ))}
          <TnFotnote>Fagpersoner fra Olympiatoppen, oppfølgingsplan per spiller og samlingsrapporter kan ikke registreres ennå.</TnFotnote>
        </TnFlate>
      </TnSkraKort>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------
// E4 WANG-testresultater
// ---------------------------------------------------------------------------

export type TnWangResultatRad = { id: string; skole: string; spiller: string; test: string; resultat: string; dato: string };

export function TnWangResultaterVisning({ brukerNavn, rolle, groupId, kanAdministrere, skoler, antall, side, sisteSide, rader }: {
  brukerNavn: string;
  rolle: string;
  groupId: string;
  kanAdministrere: boolean;
  skoler: { groupId: string; schoolName: string; antall: number }[];
  antall: number;
  side: number;
  sisteSide: number;
  rader: TnWangResultatRad[];
}) {
  const deler = skoler.reduce((n, s) => n + s.antall, 0);
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn} rolle={rolle} groupId={groupId} visTrenerflater kanAdministrere={kanAdministrere}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett="WANG-testresultater"
        overlinje="Tester · delt fra WANG-skolene"
        tittel="Testresultater fra WANG"
        ingress="Fullførte testresultater fra WANG-elever som har samtykket til å dele testene med WANG-skolen og Team Norway. Under 16 år har også forelder godkjent."
        venstre={
          <>
            <TnHeltTall verdi={antall}>{antall === 1 ? "delt testresultat" : "delte testresultater"}</TnHeltTall>
            <TnHeltTekst>Trekker en elev delingen, forsvinner resultatene med en gang.</TnHeltTekst>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: skoler.length, tekst: skoler.length === 1 ? "WANG-skole" : "WANG-skoler" }, { verdi: deler, tekst: deler === 1 ? "elev deler" : "elever deler" }, { verdi: `${side}/${sisteSide}`, tekst: "side" }]} />}
      />
      <TnSkraKort>
        <TnFlate style={{ display: "grid", gap: 12 }}>
          <TnFlatehode tittel="WANG-skoler" merknad="Elever som deler testene sine nå" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skoler.map((skole) => <TnPille key={skole.groupId} tone="info">{skole.schoolName} · {skole.antall} deler</TnPille>)}
          </div>
        </TnFlate>
        <section style={{ display: "grid", gap: 12 }}>
          <TnFlatehode tittel="Resultathistorikk" merknad={`${antall} resultater · nyeste først`} />
          {rader.length ? (
            <TnDataTable
              caption="Fullførte WANG-testresultater"
              kolonner={[
                { key: "skole", label: "Skole" },
                { key: "spiller", label: "Spiller" },
                { key: "test", label: "Test" },
                { key: "resultat", label: "Resultat", align: "right" },
                { key: "dato", label: "Dato" },
              ]}
              rader={rader.map((r) => ({ skole: r.skole, spiller: r.spiller, test: r.test, resultat: r.resultat, dato: r.dato }))}
              empty="Ingen delte WANG-resultater ennå."
            />
          ) : (
            <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen delte testresultater ennå. Testene vises her når en WANG-elev har samtykket til å dele dem.</TnMangler></TnFlate>
          )}
          {sisteSide > 1 ? (
            <nav aria-label="Resultatsider" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: TN.textSecondary, fontSize: TN.text.sm }}>
              {side > 1 ? <Link href={`/team-norway/wang-resultater?side=${side - 1}`} style={{ color: TN.navy600, fontWeight: 700, minHeight: 44, minWidth: 44, padding: "0 4px", display: "inline-flex", alignItems: "center" }}>Forrige</Link> : <span />}
              <span style={{ fontFamily: TN.font.mono }}>Side {side} av {sisteSide}</span>
              {side < sisteSide ? <Link href={`/team-norway/wang-resultater?side=${side + 1}`} style={{ color: TN.navy600, fontWeight: 700, minHeight: 44, minWidth: 44, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "flex-end" }}>Neste</Link> : <span />}
            </nav>
          ) : null}
        </section>
      </TnSkraKort>
    </TnShell>
  );
}
