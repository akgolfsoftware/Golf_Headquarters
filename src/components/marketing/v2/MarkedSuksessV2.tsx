/* AK Golf HQ — MARKEDSSIDE: Suksesshistorier (/suksess).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero og sentrert avslutning. Skallet er
   PkShell (variant «side»). Ingen inline-stiler.

   Ryddet 20.08.2026: siden inneholdt tre oppdiktede HCP-historier (Lars H.,
   Emma S., Geir T.) merket «ekte spillere» — hardkodet i koden, ikke hentet
   fra noen kilde. Anders' beslutning samme dag: fjern seksjonen. Gjeninnfør
   den ALDRI med hardkodede navn/sitater — ekte resultater skal komme fra
   turneringsdatabasen (se /cases), aldri diktes. Samme rydding gjort på
   /cases (MarkedCasesV2), som hadde «Marcus R.» / «Sofie L.». */

import Link from "next/link";
import { PkShell } from "./kit/PkShell";

export function MarkedSuksessV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-suksess">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">AK Golf Academy</span>
          <h1 className="pk-hero">Vil du bli neste suksesshistorie?</h1>
          <p className="pk-ing">
            Vi bygger en samling av dokumenterte resultater fra ekte spillere
            i programmet. Følg turneringsresultater i mellomtiden, eller ta
            det første steget selv.
          </p>
          <div className="pk-knapperad">
            <Link className="pk-btn pk-btn-ink" href="/cases">
              Se turneringsresultater
            </Link>
            <Link className="pk-btn" href="/coaching">
              Les om coaching
            </Link>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">Begrenset antall plasser</span>
          <h2 className="pk-sekt">Klar for å trene med system?</h2>
          <p className="pk-ing">
            Vi tar imot et begrenset antall nye spillere hver sesong.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/booking">
              Book en kartleggingsøkt
            </Link>
            <Link className="pk-btn" href="/kontakt">
              Snakk med oss
            </Link>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
