/**
 * TN-19 Tilgang og samtykke (erstatter Samtykke og Inviter spiller).
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm «tilgang».
 * Avvikene står i tn-tilgang-samtykke.tsx. Tilgang og lagring avgjøres på
 * serveren; valgt person for «Endre» og delingsfilteret følger adressen.
 */
import { notFound } from "next/navigation";

import { TnTilgangSkjema } from "@/components/team-norway/tn-tilgang-skjema";
import { hentTnSamtykkeoversikt } from "@/components/team-norway/tn-uttak-plan-gruppe-admin/samtykke-hent";
import { lesDelingFilter } from "@/components/team-norway/tn-uttak-plan-gruppe-admin/samtykke-data";
import { TnTilgangSamtykkeSkjerm } from "@/components/team-norway/tn-uttak-plan-gruppe-admin/tn-tilgang-samtykke";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";
import { erSportssjef, hentTeamNorwayTilganger, tnTilgangStatus } from "@/lib/domain/tn-tilgang";
import { avsluttTilgangAction, leggTilTrenerAction, settTilgangAction } from "./tn-tilgang-actions";

export const metadata = { title: "Tilgang og samtykke · Team Norway Golf" };

function tilInputIso(dato: Date): string {
  return dato.toISOString().slice(0, 10);
}

export default async function TilgangPage({ searchParams }: { searchParams: Promise<{ valgt?: string; deling?: string }> }) {
  // Domenesperren: @golfforbundet.no + trenerrolle, eller ADMIN (tn-flate-tilgang.ts).
  const { bruker, kontekst } = await krevTnTrenerflate();
  // erSportssjef er selve sperren: aktiv COACH i TN-gruppen, eller ADMIN.
  if (!(await erSportssjef({ id: bruker.id, role: bruker.role }))) notFound();

  const { valgt, deling } = await searchParams;
  const data = await hentTeamNorwayTilganger(bruker.id);
  if (!data) notFound();
  const { gruppe, rader } = data;
  const spillere = await hentTnSamtykkeoversikt(gruppe.id);
  const valgtRad = rader.find((rad) => rad.userId === valgt);

  return (
    <TnTilgangSamtykkeSkjerm
      brukerNavn={bruker.name}
      kontekst={kontekst}
      gruppeNavn={gruppe.name}
      spillere={spillere}
      filter={lesDelingFilter(deling)}
      trenere={rader.map((rad) => ({ ...rad, aktiv: tnTilgangStatus(rad) === "AKTIV" }))}
      egenId={bruker.id}
      valgtId={valgtRad?.userId}
      avslutt={avsluttTilgangAction.bind(null, gruppe.id)}
      leggTil={leggTilTrenerAction}
      skjema={valgtRad ? (
        <TnTilgangSkjema
          key={valgtRad.userId}
          groupId={gruppe.id}
          targetUserId={valgtRad.userId}
          gruppeNavn={gruppe.name}
          rolleInitial={valgtRad.rolle}
          fraInitialIso={tilInputIso(valgtRad.joinedAt)}
          tilInitialIso={valgtRad.endedAt ? tilInputIso(valgtRad.endedAt) : null}
          settTilgang={settTilgangAction}
          avsluttTilgang={avsluttTilgangAction}
        />
      ) : undefined}
    />
  );
}
