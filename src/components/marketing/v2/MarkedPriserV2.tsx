/* AK Golf HQ — MARKEDSSIDE: Priser (/priser).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §pris (skallvariant 2) — prisrad + spørsmålsliste. Skallet er PkShell
   (variant «side»). Ingen inline-stiler, ingen egne farger.

   VIKTIG — innholdet følger BUSINESS-RULES, ikke fasitens demo-tall:
   299 kr/mnd-kanon (gratis via prøveperiode / coaching-pakke / gruppe, ellers
   299 kr/mnd). Coaching-pakker (Performance / Performance Pro) er antall økter,
   IKKE app-nivåer. ELITE finnes ikke. Fasitens tre pakker (249/1890/3400) er
   designdemo — CLAUDE.md: BUSINESS-RULES vinner ved konflikt.

   Trekkspillet er native <details>, som i fasiten — ingen klient-state. */

import Link from "next/link";
import { PkShell } from "./paper/PkShell";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Hvordan får jeg PlayerHQ gratis?",
    a: "Tre veier: én måneds prøveperiode for alle nye spillere, coaching-pakke (Performance eller Performance Pro) der appen er inkludert, eller gruppe via AK Golf, for eksempel WANG eller klubbtrening.",
  },
  {
    q: "Hva er forskjellen på coaching-pakker og appen?",
    a: "Coaching-pakkene handler om antall økter med coach per måned, ikke om app-funksjoner. Appen er den samme for alle med tilgang, ingen nivåer, ingenting låst bak dyrere trinn.",
  },
  {
    q: "Kan jeg si opp når som helst?",
    a: "Ja. Abonnementet løper måned for måned uten binding, og du beholder tilgangen ut perioden du har betalt for.",
  },
  {
    q: "Hva skjer etter prøveperioden?",
    a: "Du velger selv: fortsett for 299 kr per måned, gå videre med en coaching-pakke der appen er inkludert, eller la kontoen hvile. Dataene dine slettes ikke.",
  },
];

export function MarkedPriserV2() {
  return (
    <PkShell variant="side" aktiv="/priser" dataSlug="marketing-priser">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Priser</span>
          <h1 className="pk-hero">Enkelt og ærlig.</h1>
          <p className="pk-ing">
            Én app, to måter å ha den på. Coaching-pakker med antall økter kjøpes separat, de er
            ikke app-nivåer.
          </p>

          <div className="pk-prisrad">
            <div className="pk-pris">
              <span className="pk-eyebrow">Gratis</span>
              <span className="pk-tall">
                0 <small>kr/mnd</small>
              </span>
              <p className="pk-pris-lede">Full app, uten månedspris, hvis ett av dette gjelder deg:</p>
              <ul>
                <li>Én måneds prøveperiode, for alle nye</li>
                <li>Coaching-pakke: Performance eller Performance Pro</li>
                <li>Gruppe via AK Golf, som WANG eller klubbtrening</li>
              </ul>
              <Link className="pk-btn" href="/auth/signup">
                Kom i gang gratis
              </Link>
            </div>

            <div className="pk-pris pk-pris-valgt">
              <span className="pk-eyebrow">Pro · full tilgang</span>
              <span className="pk-tall">
                299 <small>kr/mnd</small>
              </span>
              <p className="pk-pris-lede">For deg som trener på egen hånd, uten pakke eller gruppe.</p>
              <ul>
                <li>Strokes gained-analyse og runder</li>
                <li>Treningsplan og loggføring</li>
                <li>TrackMan-data og video</li>
                <li>AI-caddie og prioritert støtte</li>
              </ul>
              <Link className="pk-btn pk-btn-ink" href="/auth/signup">
                Velg Pro
              </Link>
            </div>
          </div>

          <p className="pk-ing pk-ing-fot">
            Eller 2 690 kr/år — tre måneder gratis (299 kr × 9). Coaching-pakker kjøpes separat: Performance og
            Performance Pro er antall økter med coach, ikke app-nivåer. Har du pakke, er appen
            inkludert. Les mer på <Link href="/coaching">coaching-siden</Link>.
          </p>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal">
          <h2 className="pk-sekt">Spørsmål som går igjen</h2>
          {FAQ.map((f) => (
            <details className="pk-qa" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </PkShell>
  );
}
