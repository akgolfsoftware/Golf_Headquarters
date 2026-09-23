import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { brukerStatusOrd, brukerStatusTone } from "@/lib/domain/bruker-status";
import {
  hentTnArbeidskontekst,
  hentTnManedsplan,
  hentTnProtokollbibliotek,
  hentTnProtokolldetalj,
  hentTnRangliste,
  hentTnReferansenivaer,
  hentTnSamlinger,
  hentTnSkoler,
  hentTnSpillere,
  hentTnTestdag,
  hentTnTestdager,
  hentTnTrenere,
  hentTnTurneringer,
  type TnArbeidskontekst,
  type TnSpillerRad,
} from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";
import { TN } from "@/lib/v2/team-norway";
import { TnDataTable } from "./tn-data-table";
import { TnInviterSpiller } from "./tn-inviter-spiller";
import { TnManuellTurnering } from "./tn-manuell-turnering";
import { TnOpprettTestdag } from "./tn-testdag-opprett";
import { TnTestdagKo } from "./tn-testdag-ko";
import {
  TnLenke,
  TnMetrikk,
  TnMetrikkRutenett,
  TnSeksjon,
  TnShell,
  TnSidehode,
  TnTomtilstand,
  tnRolleNavn,
  type TnAktivSide,
} from "./tn-shell";
import { TnKort, TnPille } from "./core";
import { TnFotnote, TnKnapp, TnMerkelapp, TnNotis, TnSeksjonDS, TnSidehodeDS, TnTabell, TnTallrad, TnUkjent } from "./tn-skjerm";

type Skjerm =
  | "spillere"
  | "fellestesting"
  | "samlinger"
  | "samlingsdetalj"
  | "college"
  | "manedsplan"
  | "uttak"
  | "rangliste"
  | "skoler"
  | "protokoller"
  | "protokolldetalj"
  | "turneringer"
  | "turnering-ny"
  | "referansenivaer"
  | "inviter"
  | "apparatet";

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });
const datoTid = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
const datoNumerisk = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
const tall = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });

function Chrome({ aktiv, brukerNavn, kontekst, children }: { aktiv: TnAktivSide; brukerNavn: string; kontekst: TnArbeidskontekst; children: ReactNode }) {
  return (
    <TnShell aktiv={aktiv} brukerNavn={brukerNavn} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere}>
      {children}
    </TnShell>
  );
}

/**
 * Uttakskriteriene, hver for seg (Anders, bindende).
 * Resultater, prestasjoner og prosess/adferd summeres aldri til én uttaksscore.
 * Skjermen har derfor ingen sumkolonne, og skal ikke få en.
 */
const UTTAKSKRITERIER = [
  {
    nummer: "Kriterium 1",
    tittel: "Resultater",
    tekst: "Registrerte bruttoresultater og plasseringer. Grunnlaget ligger i Rangliste og er uendret her.",
    kilde: "Kilde: registrerte turneringsresultater",
  },
  {
    nummer: "Kriterium 2",
    tittel: "Prestasjoner",
    tekst: "Testresultater og målinger fra fellestesting. Antall tester i tabellen over sier hvor mye som faktisk er målt.",
    kilde: "Kilde: TN-batteriet, fellestesting",
  },
  {
    nummer: "Kriterium 3",
    tittel: "Prosess og adferd",
    tekst: "Trenerens vurdering av arbeid, oppmøte og holdning. Ikke registrert i noen modell i dag — feltet står tomt framfor å gjette.",
    kilde: "Kilde: ingen — krever godkjent vurderingsmodell",
  },
] as const;

function spillerRader(rader: TnSpillerRad[]) {
  return rader.map((spiller) => ({
    spiller: <Link href={`/team-norway/spiller/${spiller.id}/oversikt`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{spiller.navn}</Link>,
    hcp: spiller.hcp === null ? "Ukjent" : tall.format(spiller.hcp),
    plan: spiller.aktivPlan ?? "Ingen aktiv plan",
    tester: spiller.tester,
    siste: spiller.sisteTest ? dato.format(spiller.sisteTest) : "Ingen resultater",
    status: <TnPille tone={brukerStatusTone(spiller.status)}>{brukerStatusOrd(spiller.status)}</TnPille>,
  }));
}

export async function TnRegistrertSkjerm({ skjerm, id, dagId }: { skjerm: Skjerm; id?: string; dagId?: string }) {
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const brukerNavn = bruker.name ?? "Ukjent";

  if (skjerm === "fellestesting") {
    const spillerside = await hentTnSpillere(bruker);
    if (!spillerside || spillerside.kontekst.erSpiller) notFound();
    const protokoller = TN_CATALOG.filter((p) => !p.blocked && !p.variableCount).map((p) => ({ id: p.id, navn: p.name }));
    const spillere = spillerside.rader.map((r) => ({ id: r.id, navn: r.navn }));

    if (dagId) {
      const valgt = await hentTnTestdag(bruker, dagId);
      if (!valgt) notFound();
      return (
        <Chrome aktiv="fellestesting" brukerNavn={brukerNavn} kontekst={valgt.kontekst}>
          <TnSidehode overlinje="Daglig · Test" tittel={valgt.dag.title} ingress={`${valgt.dag.protokollNavn}${valgt.dag.location ? ` · ${valgt.dag.location}` : ""} · ${datoTid.format(valgt.dag.scheduledAt)}`} handling={<TnLenke href="/team-norway/fellestesting">Alle testdager</TnLenke>} />
          {(() => {
            const antallFort = valgt.dag.deltakere.filter((d) => d.status === "DONE").length;
            const antallTotalt = valgt.dag.deltakere.length;
            const fremdriftPct = antallTotalt === 0 ? 0 : Math.round((antallFort / antallTotalt) * 100);
            return (
              // Kompakt Claw-føringshode (valgt TN-03) — de tre store metrikk-
              // kortene skjøv første spillerrad ut av 844px-mobilskjermen.
              <TnKort padding={12} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontFamily: TN.font.mono, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{antallFort} av {antallTotalt} ført</span>
                  <TnPille tone={valgt.dag.status === "COMPLETED" ? "green" : "amber"}>{valgt.dag.status === "ACTIVE" ? "Pågår" : valgt.dag.status === "COMPLETED" ? "Avsluttet" : valgt.dag.status}</TnPille>
                </div>
                <div style={{ height: 4, borderRadius: TN.radius.full, background: TN.ink100, overflow: "hidden" }} role="progressbar" aria-valuenow={fremdriftPct} aria-valuemin={0} aria-valuemax={100}>
                  <div style={{ width: `${fremdriftPct}%`, height: "100%", background: TN.navy600, borderRadius: TN.radius.full }} />
                </div>
              </TnKort>
            );
          })()}
          <TnTestdagKo dag={valgt.dag} kanSkrive={valgt.kontekst.kanAdministrere} />
        </Chrome>
      );
    }

    const testdager = await hentTnTestdager(bruker);
    const ko = [...spillerside.rader].sort((a, b) => a.tester - b.tester || a.navn.localeCompare(b.navn, "nb-NO"));
    const utenResultat = ko.filter((r) => r.tester === 0).length;
    return (
      <Chrome aktiv="fellestesting" brukerNavn={brukerNavn} kontekst={spillerside.kontekst}>
        <TnSidehodeDS overlinje="Daglig · Test" tittel="Fellestesting" ingress="Velg spiller og protokoll. Selve skåringen bruker AK Golf HQs versjonerte testmotor." handling={<TnKnapp primar href="/team-norway/protokoller">Velg protokoll</TnKnapp>} />
        <TnTallrad tall={[
          { verdi: spillerside.rader.length, etikett: "Spillere" },
          { verdi: protokoller.length, etikett: "Protokoller" },
          { verdi: spillerside.rader.reduce((sum, r) => sum + r.tester, 0), etikett: "Registrerte tester" },
        ]} />
        <TnNotis tittel="Ukjent er ukjent.">En spiller uten resultat står som ukjent, aldri som null. Null er en måling; ukjent er fravær av måling.</TnNotis>
        <TnSeksjonDS tittel="Spillerkø" antall={`${utenResultat} uten resultat`}>
          <TnTabell
            caption="Spillerkø for fellestesting"
            kolonner={[{ key: "spiller", label: "Spiller" }, { key: "resultater", label: "Resultater", tall: true }, { key: "siste", label: "Siste test" }]}
            rader={ko.map((r) => ({
              spiller: <Link href={`/team-norway/spiller/${r.id}/oversikt`}>{r.navn}</Link>,
              resultater: r.tester,
              siste: r.sisteTest ? datoNumerisk.format(r.sisteTest) : <TnUkjent />,
            }))}
          />
        </TnSeksjonDS>
        {testdager && testdager.dager.length > 0 && (
          <TnSeksjon tittel="Testdager">
            <TnDataTable
              caption="Testdager"
              kolonner={[{ key: "title", label: "Testdag" }, { key: "tid", label: "Tidspunkt" }, { key: "status", label: "Status" }, { key: "fremdrift", label: "Fremdrift", align: "right" }]}
              rader={testdager.dager.map((d) => ({
                title: <Link href={`/team-norway/fellestesting?dag=${d.id}`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{d.title}</Link>,
                tid: datoTid.format(d.scheduledAt),
                status: <TnPille tone={d.status === "COMPLETED" ? "green" : d.status === "ACTIVE" ? "amber" : "nøytral"}>{d.status === "ACTIVE" ? "Pågår" : d.status === "COMPLETED" ? "Avsluttet" : d.status}</TnPille>,
                fremdrift: `${d.antallFullfort} / ${d.antallDeltakere}`,
              }))}
            />
          </TnSeksjon>
        )}
        {spillerside.kontekst.kanAdministrere ? (
          <TnSeksjon tittel="Ny testdag">
            <TnKort>
              <TnOpprettTestdag spillere={spillere} protokoller={protokoller} />
            </TnKort>
          </TnSeksjon>
        ) : (
          <TnTomtilstand tittel="Kun trenere kan starte en testdag" tekst="Du har innsyn som hjelpetrener. Be en trener i gruppen om å starte testdagen." />
        )}
      </Chrome>
    );
  }

  if (skjerm === "protokoller" || skjerm === "protokolldetalj") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst || kontekst.erSpiller) notFound();
    if (skjerm === "protokolldetalj") {
      const protokoll = hentTnProtokolldetalj(id ?? "");
      if (!protokoll) notFound();
      return (
        <Chrome aktiv="protokoller" brukerNavn={brukerNavn} kontekst={kontekst}>
          <TnSidehode overlinje={`Data · ${protokoll.versjon}`} tittel={protokoll.name} ingress="Protokollens forsøk og målefelt kommer fra AK Golf HQs versjonerte Team Norway-katalog." handling={<TnLenke href="/team-norway/protokoller">Alle protokoller</TnLenke>} />
          <TnMetrikkRutenett>
            <TnMetrikk etikett="Forsøk" verdi={protokoll.rows.length} forklaring="Antall registreringsrader i denne varianten." />
            <TnMetrikk etikett="Type" verdi={protokoll.kind} forklaring="Skåringsmotor i AK Golf HQ." />
            <TnMetrikk etikett="Status" verdi={protokoll.blocked ? "Utkast" : "Klar"} tone={protokoll.blocked ? "amber" : "green"} forklaring={protokoll.blocked ?? "Kan gjennomføres i dagens testmotor."} />
          </TnMetrikkRutenett>
          <TnSeksjon tittel="Forsøk og målefelt" forklaring={`Kilde: ${protokoll.source}`}>
            <TnDataTable caption={protokoll.name} kolonner={[{ key: "forsok", label: "Forsøk" }, { key: "maal", label: "Mål", align: "right" }, { key: "felt", label: "Registreres" }]} rader={protokoll.rows.map((rad) => ({ forsok: rad.label, maal: rad.target ?? "—", felt: rad.fields.map((felt) => `${felt.label}${felt.unit ? ` (${felt.unit})` : ""}`).join(" · ") }))} />
          </TnSeksjon>
          <TnLenke href={`/portal/tren/tester/team-norway?test=${encodeURIComponent(protokoll.id)}`} fremhevet>Åpne testføring i PlayerHQ</TnLenke>
        </Chrome>
      );
    }
    const bibliotek = hentTnProtokollbibliotek();
    return (
      <Chrome aktiv="protokoller" brukerNavn={brukerNavn} kontekst={kontekst}>
        <TnSidehode overlinje={`Data · ${bibliotek.versjon}`} tittel="Testprotokoller" ingress="Én versjonert kilde for testdefinisjoner, forsøk, enheter og skåringsregler." />
        <TnMetrikkRutenett><TnMetrikk etikett="Protokoller" verdi={bibliotek.rader.length} /><TnMetrikk etikett="Klare" verdi={bibliotek.rader.filter((rad) => rad.status === "KLAR").length} tone="green" /><TnMetrikk etikett="Må avklares" verdi={bibliotek.rader.filter((rad) => rad.status === "UTKAST").length} tone="amber" /></TnMetrikkRutenett>
        <TnDataTable caption="Testprotokoller" kolonner={[{ key: "navn", label: "Protokoll" }, { key: "omrade", label: "Type" }, { key: "forsok", label: "Forsøk", align: "right" }, { key: "status", label: "Status" }]} rader={bibliotek.rader.map((rad) => ({ navn: <Link href={`/team-norway/protokoller/${rad.id}`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{rad.navn}</Link>, omrade: rad.omrade, forsok: rad.forsok, status: <TnPille tone={rad.status === "KLAR" ? "green" : "amber"}>{rad.status}</TnPille> }))} />
      </Chrome>
    );
  }

  if (skjerm === "spillere" || skjerm === "uttak" || skjerm === "college") {
    const data = await hentTnSpillere(bruker);
    if (!data) notFound();
    if (["spillere", "uttak"].includes(skjerm) && data.kontekst.erSpiller) notFound();

    if (skjerm === "uttak") {
      return (
        <Chrome aktiv="uttak" brukerNavn={brukerNavn} kontekst={data.kontekst}>
          <TnSidehode overlinje="Uttak · Beslutningsstøtte" tittel="Uttaksliste" ingress="Systemet samler grunnlaget, men konkluderer aldri automatisk hvem som skal tas ut." />
          <TnTomtilstand tittel="Tre kriterier skal vurderes hver for seg" tekst="Resultater, prestasjoner og prosess/adferd skal ikke summeres til én automatisk uttaksscore. En egen, sporbar vurderingsmodell må godkjennes før vurderinger kan lagres." />
          <TnDataTable caption="Uttaksgrunnlag" kolonner={[{ key: "spiller", label: "Spiller" }, { key: "plan", label: "Plan" }, { key: "tester", label: "Tester", align: "right" }, { key: "status", label: "Status" }]} rader={spillerRader(data.rader).map((rad) => ({ spiller: rad.spiller, plan: rad.plan, tester: rad.tester, status: rad.status }))} empty="Ingen spillere er tilgjengelige for vurdering." />
          <TnSeksjon tittel="De tre kriteriene" forklaring="Vurderes hver for seg. Skjermen viser tre kolonner med grunnlag og ingen fjerde kolonne med sum — en samlescore ville gjort et trenerskjønn om til et tall ingen kan gå god for.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
              {UTTAKSKRITERIER.map((kriterium) => (
                <TnKort key={kriterium.tittel}>
                  <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textSecondary }}>{kriterium.nummer}</p>
                  <h3 style={{ margin: "10px 0 0", color: TN.navy900, fontSize: TN.text.h3, letterSpacing: TN.tracking.heading }}>{kriterium.tittel}</h3>
                  <p style={{ margin: "10px 0 0", color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>{kriterium.tekst}</p>
                  <p style={{ margin: "16px 0 0", paddingTop: 14, borderTop: `1px solid ${TN.borderSubtle}`, fontFamily: TN.font.mono, fontSize: TN.text.micro, color: TN.textSecondary }}>{kriterium.kilde}</p>
                </TnKort>
              ))}
            </div>
          </TnSeksjon>
        </Chrome>
      );
    }

    const erCollege = skjerm === "college";
    const rader = erCollege ? data.rader.filter((spiller) => /college|university|universitet/i.test(spiller.skole ?? "")) : data.rader;
    const utenPlan = rader.filter((spiller) => !spiller.aktivPlan).length;
    return (
      <Chrome aktiv={erCollege ? "college" : "spillere"} brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehodeDS overlinje={erCollege ? "Daglig · College" : "Daglig · Spillerutvikling"} tittel={erCollege ? "Collegegruppen" : "Spillere"} ingress={erCollege ? "Collegeinformasjon leses fra spillerprofilen. NCAA-kollisjoner krever fortsatt en egen datamodell." : "Samlet inngang til spillerens plan, tester og sporbare Team Norway-poster."} />
        {!erCollege ? <TnTallrad tall={[{ verdi: rader.length, etikett: "Spillere" }, { verdi: rader.filter((spiller) => spiller.aktivPlan).length, etikett: "Med aktiv plan" }, { verdi: rader.filter((spiller) => spiller.tester === 0).length, etikett: "Mangler testresultat" }]} /> : null}
        <TnSeksjonDS tittel={erCollege ? "Spillere med college" : "Team Norway-spillere"} antall={erCollege ? `${rader.length} av ${data.rader.length}` : `${rader.length} i gruppen`}>
          {rader.length === 0 ? <TnUkjent>{erCollege ? "Ingen spillere har registrert college i profilen." : "Ingen aktive spillere i Team Norway-gruppen."}</TnUkjent> : erCollege ? (
            <TnTabell caption="Collegegruppen" kolonner={[{ key: "spiller", label: "Spiller" }, { key: "skole", label: "College / skole" }, { key: "ar", label: "År" }, { key: "status", label: "Status" }]} rader={rader.map((spiller) => ({ spiller: <Link href={`/team-norway/spiller/${spiller.id}/oversikt`}>{spiller.navn}</Link>, skole: spiller.skole ?? <TnUkjent>Ikke registrert</TnUkjent>, ar: spiller.skolear ?? <TnUkjent />, status: <TnMerkelapp variant={spiller.status === "AKTIV" ? "ok" : undefined}>{brukerStatusOrd(spiller.status)}</TnMerkelapp> }))} />
          ) : (
            <TnTabell caption="Team Norway-spillere" kolonner={[{ key: "spiller", label: "Spiller" }, { key: "hcp", label: "HCP", tall: true }, { key: "plan", label: "Aktiv plan" }, { key: "tester", label: "Tester", tall: true }, { key: "status", label: "Status" }]} rader={rader.map((spiller) => ({ spiller: <Link href={`/team-norway/spiller/${spiller.id}/oversikt`}>{spiller.navn}</Link>, hcp: spiller.hcp === null ? <TnUkjent /> : tall.format(spiller.hcp), plan: spiller.aktivPlan ?? <TnUkjent>Ingen aktiv plan</TnUkjent>, tester: spiller.tester, status: <TnMerkelapp variant={spiller.status === "AKTIV" ? "ok" : undefined}>{brukerStatusOrd(spiller.status)}</TnMerkelapp> }))} />
          )}
        </TnSeksjonDS>
        {erCollege ? (
          <>
            <TnNotis tittel="To ord, to betydninger.">«Ikke registrert» betyr at feltet står tomt i profilen. «Ukjent» betyr at vi ikke vet. De blandes aldri — det er appens egne ord, og de skal bety det samme her.</TnNotis>
            <TnNotis tittel="Ikke bygget ennå.">Kollisjoner mot NCAA-kalenderen vises ikke her. Det krever en egen datamodell for terminlister, og den finnes ikke.</TnNotis>
          </>
        ) : utenPlan > 0 ? (
          <TnFotnote>{utenPlan} {utenPlan === 1 ? "spiller står" : "spillere står"} uten aktiv plan. Det er ikke en feil i listen — det er {utenPlan === 1 ? "en spiller som ikke har" : `${utenPlan} spillere som ikke har`} kommet i gang. Listen sier det, og konkluderer ikke.</TnFotnote>
        ) : null}
      </Chrome>
    );
  }

  if (skjerm === "rangliste") {
    const data = await hentTnRangliste(bruker);
    if (!data || data.kontekst.erSpiller) notFound();
    return (
      <Chrome aktiv="rangliste" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehode overlinje="Uttak · Resultatgrunnlag" tittel="Rangliste" ingress="Viser registrerte bruttoresultater og plasseringer. Manglende data vises som ukjent og påvirker ikke uttak automatisk." />
        <TnTomtilstand tittel="Kun brutto" tekst="Alle tall er ekte slag. Snittplassering og brutto score er gjennomsnitt av de registrerte startene — ikke en rangering systemet har regnet seg fram til, og ikke et uttak. En spiller uten starter står nederst fordi ingenting er registrert, ikke fordi hun er dårligst." />
        <TnDataTable caption="Resultatgrunnlag" kolonner={[{ key: "spiller", label: "Spiller" }, { key: "starter", label: "Starter", align: "right" }, { key: "plassering", label: "Snittplassering", align: "right" }, { key: "score", label: "Brutto score", align: "right" }, { key: "tester", label: "Tester", align: "right" }]} rader={data.rader.map((spiller) => ({ spiller: spiller.navn, starter: spiller.starter, plassering: spiller.snittplassering === null ? "Ukjent" : tall.format(spiller.snittplassering), score: spiller.bruttoScore === null ? "Ukjent" : tall.format(spiller.bruttoScore), tester: spiller.tester }))} empty="Ingen turneringsresultater er registrert for gruppen." />
      </Chrome>
    );
  }

  if (skjerm === "samlinger" || skjerm === "samlingsdetalj") {
    const data = await hentTnSamlinger(bruker);
    if (!data) notFound();
    const valgt = skjerm === "samlingsdetalj" ? data.samlinger.find((samling) => samling.id === id) : null;
    if (skjerm === "samlingsdetalj" && !valgt) notFound();
    return (
      <Chrome aktiv="samlinger" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehode overlinje="Daglig · Samlinger" tittel={valgt?.name ?? "Samlingspunkt"} ingress={valgt ? `${dato.format(valgt.startDate)}–${dato.format(valgt.endDate)}${valgt.location ? ` · ${valgt.location}` : ""}` : "Samlinger fra AK Golf HQs spillerplaner, samlet på gruppenivå."} handling={valgt ? <TnLenke href="/team-norway/samlinger">Alle samlinger</TnLenke> : undefined} />
        {valgt ? <><TnMetrikkRutenett><TnMetrikk etikett="Deltakere" verdi={valgt.antallDeltakere} /><TnMetrikk etikett="Fra" verdi={dato.format(valgt.startDate)} /><TnMetrikk etikett="Til" verdi={dato.format(valgt.endDate)} /></TnMetrikkRutenett><TnKort><p style={{ margin: 0, color: TN.textSecondary, lineHeight: TN.leading.normal }}>{valgt.notes ?? "Ingen programdetaljer er registrert på samlingen."}</p></TnKort></> : <TnDataTable caption="Samlinger" kolonner={[{ key: "samling", label: "Samling" }, { key: "periode", label: "Periode" }, { key: "sted", label: "Sted" }, { key: "deltakere", label: "Deltakere", align: "right" }]} rader={data.samlinger.map((samling) => ({ samling: <Link href={`/team-norway/samlinger/${samling.id}`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{samling.name}</Link>, periode: `${dato.format(samling.startDate)}–${dato.format(samling.endDate)}`, sted: samling.location ?? "Ikke registrert", deltakere: samling.antallDeltakere }))} empty="Ingen samlinger er registrert for Team Norway-spillerne." />}
      </Chrome>
    );
  }

  if (skjerm === "manedsplan") {
    const data = await hentTnManedsplan(bruker);
    if (!data) notFound();
    return (
      <Chrome aktiv="manedsplan" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehodeDS overlinje="Daglig · Plan" tittel="Månedsplan" ingress="Gruppeøkter og periodisering leses direkte fra AK Golf HQs planleggingsmodeller." />
        <TnTallrad tall={[{ verdi: data.okter.length, etikett: "Gruppeøkter" }, { verdi: data.perioder.length, etikett: "Perioder" }, { verdi: "Ikke beregnet", etikett: "Publisert avvik" }]} />
        <TnNotis tittel="Avvik beregnes ikke.">Modellen mangler en godkjent avviksberegning, så feltet står tomt framfor å vise et tall ingen kan gå god for.</TnNotis>
        <TnSeksjonDS tittel="Økter" antall={`${data.okter.length} i perioden`}>
          {data.okter.length === 0 ? <TnUkjent>Ingen gruppeøkter er registrert i perioden.</TnUkjent> : (
            <TnTabell caption="Månedsplanens økter" kolonner={[{ key: "tid", label: "Tid" }, { key: "okt", label: "Økt" }, { key: "sted", label: "Sted" }, { key: "type", label: "Type" }]} rader={data.okter.map((okt) => ({ tid: datoTid.format(okt.startAt), okt: okt.title, sted: okt.location ?? <TnUkjent>Ikke registrert</TnUkjent>, type: <TnMerkelapp>{okt.kind ?? "Trening"}</TnMerkelapp> }))} />
          )}
        </TnSeksjonDS>
        <TnSeksjonDS tittel="Periodisering" antall={`${data.perioder.length} perioder`}>
          {data.perioder.length === 0 ? <TnUkjent>Ingen gruppeperioder er registrert.</TnUkjent> : (
            <TnTabell caption="Periodisering" kolonner={[{ key: "fase", label: "Fase" }, { key: "periode", label: "Periode" }, { key: "fokus", label: "Fokus" }, { key: "volum", label: "Ukevolum", tall: true }]} rader={data.perioder.map((periode) => ({ fase: <TnMerkelapp variant="navy">{periode.lPhase}</TnMerkelapp>, periode: `${datoNumerisk.format(periode.startDate)}–${datoNumerisk.format(periode.endDate)}`, fokus: periode.focus ?? <TnUkjent>Ikke registrert</TnUkjent>, volum: periode.weeklyVolMin === null && periode.weeklyVolMax === null ? <TnUkjent /> : `${periode.weeklyVolMin ?? 0}–${periode.weeklyVolMax ?? "?"} min` }))} />
          )}
        </TnSeksjonDS>
      </Chrome>
    );
  }

  if (skjerm === "skoler") {
    const data = await hentTnSkoler(bruker);
    if (!data || data.kontekst.erSpiller) notFound();
    return (
      <Chrome aktiv="skoler" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehode overlinje="Skoler · Oversikt" tittel="Skoleoversikt" ingress="Skole og trinn kommer fra spillerprofilene. Uregistrerte verdier holdes synlige som datagap." />
        <TnMetrikkRutenett><TnMetrikk etikett="Skoler" verdi={data.skoler.filter((rad) => rad.skole !== "Ikke registrert").length} /><TnMetrikk etikett="Spillere" verdi={data.skoler.reduce((sum, rad) => sum + rad.spillere.length, 0)} /><TnMetrikk etikett="Mangler skole" verdi={data.skoler.find((rad) => rad.skole === "Ikke registrert")?.spillere.length ?? 0} tone="amber" /></TnMetrikkRutenett>
        <TnDataTable caption="Skoler" kolonner={[{ key: "skole", label: "Skole" }, { key: "spillere", label: "Spillere", align: "right" }, { key: "trinn", label: "Trinn" }]} rader={data.skoler.map((rad) => ({ skole: rad.skole, spillere: rad.spillere.length, trinn: [...new Set(rad.spillere.map((spiller) => spiller.skolear).filter(Boolean))].join(" · ") || "Ukjent" }))} empty="Ingen spillere er tildelt Team Norway-gruppen." />
        <TnTomtilstand tittel="«Ikke registrert» er en egen rad, ikke en skole" tekst="Spillere uten skole i profilen samles i sin egen rad. Den skjules ikke og slås ikke sammen med de andre — da ville totalen sett riktig ut mens profilene fortsatt sto tomme. Trinn settes sammen av verdiene som faktisk står i profilene i hver gruppe; står ingen av dem fylt ut, står det «Ukjent»." />
      </Chrome>
    );
  }

  if (skjerm === "turneringer") {
    const data = await hentTnTurneringer(bruker);
    if (!data) notFound();
    return (
      <Chrome aktiv="turneringer" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehode overlinje="Data · Brutto score" tittel="Turneringsoversikt" ingress="Turneringer, planer og resultater kommer fra AK Golf HQs felles turneringsmotor." handling={data.kontekst.erSpiller ? <TnLenke href="/team-norway/turneringer/ny" fremhevet>Legg inn turnering</TnLenke> : undefined} />
        <TnDataTable caption="Turneringer" kolonner={[{ key: "turnering", label: "Turnering" }, { key: "dato", label: "Dato" }, { key: "sted", label: "Sted" }, { key: "kilde", label: "Kilde" }, { key: "spillere", label: "Spillere", align: "right" }]} rader={data.turneringer.map((turnering) => ({ turnering: turnering.name, dato: turnering.startDate ? dato.format(turnering.startDate) : "Dato ikke registrert", sted: turnering.location ?? "Ikke registrert", kilde: <TnPille tone={turnering.sourceOrigin === "MANUAL" ? "nøytral" : "info"}>{turnering.sourceOrigin ?? "Ukjent"}</TnPille>, spillere: new Set([...turnering.entries.map((rad) => rad.userId), ...turnering.results.map((rad) => rad.userId)]).size }))} empty="Ingen Team Norway-turneringer er koblet til spillernes planer eller resultater." />
      </Chrome>
    );
  }

  if (skjerm === "turnering-ny") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst || !kontekst.erSpiller) notFound();
    return <Chrome aktiv="turneringer" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Data · Manuell kilde" tittel="Legg inn turnering selv" ingress="Brukes når turneringen ikke finnes i katalogen." /><TnKort><TnManuellTurnering /></TnKort></Chrome>;
  }

  if (skjerm === "referansenivaer") {
    const data = await hentTnReferansenivaer(bruker);
    if (!data) notFound();
    return (
      <Chrome aktiv="referansenivaer" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehode overlinje={`Data · ${data.versjon}`} tittel="Referansenivåer" ingress="Viser bare målverdier som finnes eksplisitt i den versjonerte protokollkilden." />
        <TnDataTable caption="Referansenivåer" kolonner={[{ key: "protokoll", label: "Protokoll" }, { key: "mal", label: "Måling" }, { key: "verdi", label: "Referanse", align: "right" }]} rader={data.rader.map((rad) => ({ protokoll: data.kontekst.erSpiller ? rad.protokoll : <Link href={`/team-norway/protokoller/${rad.protokollId}`} style={{ color: TN.navy700 }}>{rad.protokoll}</Link>, mal: rad.mal, verdi: rad.verdi ?? "Ukjent" }))} empty="Ingen eksplisitte referanseverdier finnes i protokollkilden." />
      </Chrome>
    );
  }

  if (skjerm === "apparatet") {
    const data = await hentTnTrenere(bruker);
    if (!data) notFound();
    return (
      <Chrome aktiv="apparatet" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehode overlinje="Administrasjon · Apparat" tittel="Trenerkatalog" ingress="Katalogen viser aktive trenere i Team Norway-gruppen. Den gir ingen tilgang i seg selv." />
        <TnDataTable caption="Trenerkatalog" kolonner={[{ key: "navn", label: "Navn" }, { key: "rolle", label: "Rolle" }, { key: "kontakt", label: "Kontakt" }, { key: "siden", label: "Aktiv siden" }]} rader={data.rader.map((rad) => ({ navn: rad.user.name, rolle: <TnPille tone={rad.role === "COACH" ? "navy" : "nøytral"}>{rad.role === "COACH" ? "Trener" : "Hjelpetrener"}</TnPille>, kontakt: data.kontekst.kanAdministrere ? rad.user.email : "Skjult", siden: dato.format(rad.joinedAt) }))} empty="Ingen aktive trenere er registrert." />
      </Chrome>
    );
  }

  if (skjerm === "inviter") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst?.kanAdministrere) notFound();
    return <Chrome aktiv="inviter" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Administrasjon · Medlemmer" tittel="Inviter spiller" ingress="Inviter spillere til Team Norway og følg status for hver invitasjon." /><TnKort><TnInviterSpiller groupId={kontekst.gruppe.id} /></TnKort></Chrome>;
  }

  notFound();
}
