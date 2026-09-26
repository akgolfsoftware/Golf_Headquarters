import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { brukerStatusOrd, brukerStatusTone } from "@/lib/domain/bruker-status";
import {
  hentTnArbeidskontekst,
  hentTnSamlinger,
  hentTnSpillere,
  hentTnTurneringer,
  type TnArbeidskontekst,
  type TnSpillerRad,
} from "@/lib/domain/tn-arbeidsflate";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";
import { TN } from "@/lib/v2/team-norway";
import { TnDataTable } from "./tn-data-table";
import { TnInviterSpiller } from "./tn-inviter-spiller";
import { TnManuellTurnering } from "./tn-manuell-turnering";
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

type Skjerm =
  | "fellestesting"
  | "samlinger"
  | "samlingsdetalj"
  | "uttak"
  | "turneringer"
  | "turnering-ny"
  | "inviter";

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });
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
export const UTTAKSKRITERIER = [
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
    spiller: <Link href={`/team-norway/spiller/${spiller.id}`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{spiller.navn}</Link>,
    hcp: spiller.hcp === null ? "Ukjent" : tall.format(spiller.hcp),
    plan: spiller.aktivPlan ?? "Ingen aktiv plan",
    tester: spiller.tester,
    siste: spiller.sisteTest ? dato.format(spiller.sisteTest) : "Ingen resultater",
    status: <TnPille tone={brukerStatusTone(spiller.status)}>{brukerStatusOrd(spiller.status)}</TnPille>,
  }));
}

export async function TnRegistrertSkjerm({ skjerm, id }: { skjerm: Skjerm; id?: string }) {
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const brukerNavn = bruker.name ?? "Ukjent";

  if (skjerm === "fellestesting" || skjerm === "uttak") {
    const data = await hentTnSpillere(bruker);
    if (!data) notFound();
    if (data.kontekst.erSpiller) notFound();

    if (skjerm === "fellestesting") {
      return (
        <Chrome aktiv="fellestesting" brukerNavn={brukerNavn} kontekst={data.kontekst}>
          <TnSidehode overlinje="Daglig · Test" tittel="Fellestesting" ingress="Velg spiller og protokoll. Selve skåringen bruker AK Golf HQs versjonerte testmotor." handling={<TnLenke href="/team-norway/protokoller" fremhevet>Velg protokoll</TnLenke>} />
          <TnMetrikkRutenett><TnMetrikk etikett="Spillere" verdi={data.rader.length} /><TnMetrikk etikett="Protokoller" verdi={TN_CATALOG.length} /><TnMetrikk etikett="Registrerte tester" verdi={data.rader.reduce((sum, spiller) => sum + spiller.tester, 0)} /></TnMetrikkRutenett>
          <TnSeksjon tittel="Spillerkø" forklaring="Ukjent resultat vises som ukjent, aldri som null."><TnDataTable caption="Spillerkø for fellestesting" kolonner={[{ key: "spiller", label: "Spiller" }, { key: "tester", label: "Resultater", align: "right" }, { key: "siste", label: "Siste test" }, { key: "handling", label: "Neste steg" }]} rader={data.rader.map((spiller) => ({ spiller: spiller.navn, tester: spiller.tester, siste: spiller.sisteTest ? dato.format(spiller.sisteTest) : "Ukjent", handling: <Link href={`/team-norway/spiller/${spiller.id}`} style={{ color: TN.navy700 }}>Åpne spiller</Link> }))} empty="Ingen spillere er tildelt Team Norway-gruppen." /></TnSeksjon>
        </Chrome>
      );
    }

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

    notFound();
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

  if (skjerm === "turneringer") {
    const data = await hentTnTurneringer(bruker);
    if (!data) notFound();
    return (
      <Chrome aktiv="turneringer" brukerNavn={brukerNavn} kontekst={data.kontekst}>
        <TnSidehode overlinje="Data · Brutto score" tittel="Turneringsoversikt" ingress="Turneringer, planer og resultater kommer fra AK Golf HQs felles turneringsmotor." handling={data.kontekst.erSpiller ? <TnLenke href="/team-norway/turneringer/ny" fremhevet>Legg inn turnering</TnLenke> : undefined} />
        <TnDataTable caption="Turneringer" kolonner={[{ key: "turnering", label: "Turnering" }, { key: "dato", label: "Dato" }, { key: "sted", label: "Sted" }, { key: "kilde", label: "Kilde" }, { key: "spillere", label: "Spillere", align: "right" }]} rader={data.turneringer.map((turnering) => ({ turnering: turnering.name, dato: dato.format(turnering.startDate), sted: turnering.location ?? "Ikke registrert", kilde: <TnPille tone={turnering.sourceOrigin === "MANUAL" ? "nøytral" : "info"}>{turnering.sourceOrigin ?? "Ukjent"}</TnPille>, spillere: new Set([...turnering.entries.map((rad) => rad.userId), ...turnering.results.map((rad) => rad.userId)]).size }))} empty="Ingen Team Norway-turneringer er koblet til spillernes planer eller resultater." />
      </Chrome>
    );
  }

  if (skjerm === "turnering-ny") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst || !kontekst.erSpiller) notFound();
    return <Chrome aktiv="turneringer" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Data · Manuell kilde" tittel="Legg inn turnering selv" ingress="Brukes når turneringen ikke finnes i katalogen." /><TnKort><TnManuellTurnering /></TnKort></Chrome>;
  }

  if (skjerm === "inviter") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst?.kanAdministrere) notFound();
    return <Chrome aktiv="inviter" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Administrasjon · Medlemmer" tittel="Inviter spiller" ingress="Invitasjonen bruker AK Golf HQs eksisterende gruppe- og e-postflyt." /><TnKort><TnInviterSpiller groupId={kontekst.gruppe.id} /></TnKort></Chrome>;
  }

  notFound();
}
