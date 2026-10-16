// PH24ResultatListe — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ · Meg · Resultater.
 *
 * Spilleren kobler profilen til turneringshistorikken sin (GolfBox) og ser
 * resultatene sine her. Uten kobling: «Er dette deg?». Med kobling: nivåtall,
 * scoringsmønster, runder og hullkort.
 *
 * SKJERMEN ER IKKE VISUELT GODKJENT. AGENTS.md §Skjermarbeid krever at Anders
 * har sett den mot valgt designversjon (mobil 390 px og desktop, tomme, lastende
 * og feiltilstander) før den regnes som ferdig.
 *
 * Personvern: dataene gjelder ofte mindreårige. Siden viser bare den innloggede
 * brukerens EGNE resultater, hentet via databasefunksjonene som slår opp den
 * bekreftede koblingen selv (src/lib/profil-kobling/data.ts). Ingen DataGolf-data
 * (lisensen tillater ikke visning for andre).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentKoblingsstatus, hentProfilResultater } from "@/lib/profil-kobling/data";
import { Tittel } from "@/components/v2/core";
import { KobleProfil } from "./koble-profil";
import { AngreKnapp } from "./angre-knapp";
import { ResultaterVisning } from "./resultater-visning";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resultater · PlayerHQ" };

export default async function ResultaterPage() {
  // Resultatlesing er stats-lesing, som er åpen for gratisprofilen (TALENT).
  const user = await requirePortalUser({
    kreverTilgang: "TALENT",
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  if (user.role === "PARENT") redirect("/forelder");

  const status = await hentKoblingsstatus(user.id);
  const data = status.status === "confirmed" ? await hentProfilResultater(user.id) : null;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <div style={{ display: "grid", gap: 20 }}>
        <Tittel>Resultater</Tittel>
        {data ? (
          <>
            <ResultaterVisning data={data} />
            <AngreKnapp />
          </>
        ) : (
          <KobleProfil
            ventende={
              status.status === "pending" && status.candidate
                ? { linkId: status.link_id, kandidat: status.candidate }
                : null
            }
          />
        )}
      </div>
    </div>
    </PlayerHQSkall>
  );
}
