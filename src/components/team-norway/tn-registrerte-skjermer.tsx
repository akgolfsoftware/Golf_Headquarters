import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  hentTnArbeidskontekst,
  hentTnSpillere,
  hentTnTestdag,
  hentTnTestdager,
  type TnArbeidskontekst,
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
  TnSeksjon,
  TnShell,
  TnSidehode,
  TnTomtilstand,
  tnRolleNavn,
  type TnAktivSide,
} from "./tn-shell";
import { TnKort, TnPille } from "./core";
import { TnKnapp, TnNotis, TnSeksjonDS, TnSidehodeDS, TnTabell, TnTallrad, TnUkjent } from "./tn-skjerm";

type Skjerm =
  | "fellestesting"
  | "turnering-ny"
  | "inviter";

const datoTid = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
const datoNumerisk = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });

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

export async function TnRegistrertSkjerm({ skjerm, dagId }: { skjerm: Skjerm; dagId?: string }) {
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

  if (skjerm === "turnering-ny") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst || !kontekst.erSpiller) notFound();
    return <Chrome aktiv="turneringer" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Data · Manuell kilde" tittel="Legg inn turnering selv" ingress="Brukes når turneringen ikke finnes i katalogen." /><TnKort><TnManuellTurnering /></TnKort></Chrome>;
  }

  if (skjerm === "inviter") {
    const kontekst = await hentTnArbeidskontekst(bruker);
    if (!kontekst?.kanAdministrere) notFound();
    return <Chrome aktiv="inviter" brukerNavn={brukerNavn} kontekst={kontekst}><TnSidehode overlinje="Administrasjon · Medlemmer" tittel="Inviter spiller" ingress="Inviter spillere til Team Norway og følg status for hver invitasjon." /><TnKort><TnInviterSpiller groupId={kontekst.gruppe.id} /></TnKort></Chrome>;
  }

  notFound();
}
