import Link from "next/link";
import type { ReactNode } from "react";
import type { TnAvsluttResultat, TnLeggTilResultat, TnTilgangRad, TnTilgangStatus, TnTrenerRolle } from "@/lib/domain/tn-tilgang";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnMangler, TnSkjermhode } from "./tn-flate";
import { TnAvsluttTilgang, TnLeggTilTrener } from "./tn-tilgang-handlinger";
import { TnShell } from "./tn-shell";

/**
 * TN-19 Trenere og tilgang.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-19.
 *
 * Avvik:
 *   - «Legg til trener» gir tilgang til en eksisterende AK Golf-konto, slått
 *     opp på e-post. Invitasjon av personer uten konto finnes ikke ennå, og
 *     navnefeltet er derfor tatt bort. Ventende invitasjoner vises ikke.
 *   - «Hva rollene ser» beskriver det appen faktisk gjør i dag: Assist Coach
 *     ser trenerskjermene, men ikke Trenere og tilgang. Fasitens tekst
 *     (Assist Coach ser ikke uttak) er ikke bygget.
 *   - Rolle og periode kan fortsatt endres per person under «Endre».
 */
export type TnTilgangVisningsrad = TnTilgangRad & { status: TnTilgangStatus };

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const rolleNavn = (rolle: TnTrenerRolle) => (rolle === "COACH" ? "Trener" : "Assist Coach");

const ROLLER = [
  ["Trener", "Ser alle trenerskjermene i gruppen: uttak, fellestesting, fagapparat, plan og gruppeposter. Den som er trener i Team Norway-gruppen, styrer også tilgangen her."],
  ["Assist Coach", "Ser de samme trenerskjermene som Trener, men kan ikke gi eller avslutte tilgang."],
  ["Spiller", "Ser egen plan, samlinger, turneringer, gruppeposter og dokumenter. Ser aldri uttak, fellestesting, fagapparat eller tilgang."],
] as const;

export function TnTilgangVisning({ brukerNavn, gruppeId, gruppeNavn, rader, valgtId, skjema, egenId, avslutt, leggTil }: {
  brukerNavn: string;
  gruppeId?: string;
  gruppeNavn: string;
  rader: TnTilgangVisningsrad[];
  valgtId?: string;
  skjema?: ReactNode;
  egenId?: string;
  avslutt?: (userId: string) => Promise<TnAvsluttResultat>;
  leggTil?: (epost: string, rolle: TnTrenerRolle) => Promise<TnLeggTilResultat>;
}) {
  const aktive = rader.filter((r) => r.status === "AKTIV");
  const avsluttede = rader.filter((r) => r.status !== "AKTIV");
  const valgt = rader.find((rad) => rad.userId === valgtId);
  const trenere = aktive.filter((r) => r.rolle === "COACH").length;

  return (
    <TnShell aktiv="tilgang" brukerNavn={brukerNavn} rolle="Trener" groupId={gruppeId} visTrenerflater kanAdministrere>
      <TnSkjermhode rute="/team-norway/tilgang" tittel="Trenere og tilgang" ingress="Hvem som er trener eller Assist Coach i gruppen. Legg til nye, og avslutt tilgang for dem som ikke lenger er med." />

      <TnFlate>
        <TnFlatehode tittel={`Tilgang til ${gruppeNavn}`} merknad={`Trener ${trenere} · Assist Coach ${aktive.length - trenere}`} />
        {aktive.map((r) => (
          <div key={r.userId} style={{ display: "flex", flexWrap: "wrap", gap: "12px 16px", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
            <div style={{ flex: "1 1 260px", minWidth: 0, display: "flex", gap: 12, alignItems: "center" }}>
              <TnInitialer navn={r.navn} storrelse={40} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{r.navn}</div>
                <div style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary, overflowWrap: "anywhere" }}>{r.epost}</div>
              </div>
            </div>
            <div style={{ flex: "0 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{rolleNavn(r.rolle)}</div>
              <div style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary }}>
                Siden {dato.format(r.joinedAt)}{r.endedAt ? ` · til ${dato.format(r.endedAt)}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <Link href={`/team-norway/tilgang?valgt=${encodeURIComponent(r.userId)}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 6px", color: TN.navy700, fontSize: 14 }}>Endre</Link>
              {r.userId === egenId ? <TnEtikett style={{ padding: "0 6px" }}>Deg</TnEtikett> : avslutt ? <TnAvsluttTilgang navn={r.navn} avslutt={avslutt.bind(null, r.userId)} /> : null}
            </div>
          </div>
        ))}
        {aktive.length === 0 ? <TnMangler>Ingen har trener- eller Assist Coach-tilgang til gruppen.</TnMangler> : null}
      </TnFlate>

      {valgt && skjema ? (
        <TnFlate>
          <TnFlatehode tittel={`Endre ${valgt.navn}`}>
            <Link href="/team-norway/tilgang" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", color: TN.navy700, fontSize: 14 }}>Lukk</Link>
          </TnFlatehode>
          <div style={{ marginTop: 16, maxWidth: 520 }}>{skjema}</div>
        </TnFlate>
      ) : null}

      {avsluttede.length > 0 ? (
        <TnFlate>
          <TnFlatehode tittel="Avsluttet tilgang" merknad={String(avsluttede.length)} />
          {avsluttede.map((r) => (
            <div key={r.userId} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 16px", padding: "12px 0", borderBottom: `1px solid ${TN.navy100}`, fontSize: 14 }}>
              <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{r.navn} · {rolleNavn(r.rolle)}</span>
              <span style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary }}>Avsluttet {r.endedAt ? dato.format(r.endedAt) : "—"}</span>
                <Link href={`/team-norway/tilgang?valgt=${encodeURIComponent(r.userId)}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", color: TN.navy700 }}>Endre</Link>
              </span>
            </div>
          ))}
        </TnFlate>
      ) : null}

      {leggTil ? (
        <TnFlate>
          <TnFlatehode tittel="Legg til trener" />
          <TnLeggTilTrener leggTil={leggTil} />
          <TnFotnote>Personen må ha en AK Golf-konto. Tilgangen gjelder med en gang.</TnFotnote>
        </TnFlate>
      ) : null}

      <TnFlate>
        <TnFlatehode tittel="Hva rollene ser" />
        {ROLLER.map(([rolle, tekst]) => (
          <div key={rolle} style={{ display: "grid", gridTemplateColumns: "minmax(0, 140px) minmax(0, 1fr)", gap: 16, padding: "12px 0", borderBottom: `1px solid ${TN.navy100}` }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{rolle}</span>
            <span style={{ fontSize: 14, lineHeight: 1.6, color: TN.textSecondary }}>{tekst}</span>
          </div>
        ))}
      </TnFlate>
    </TnShell>
  );
}
