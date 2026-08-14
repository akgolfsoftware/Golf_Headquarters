/* AK Golf HQ — MARKEDSSIDE: PlayerHQ (/playerhq).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero, todelte seksjoner og sentrert avslutning.
   Skallet er PkShell (variant «side»). Ingen inline-stiler, ingen egne farger.

   AVVIK mot forrige versjon (bevisst): de mørke telefon-mockupene er byttet med
   Paper-native app-utsnitt (samme tall og samme rekkefølge). Mockupene var bygd
   av T-tokens fra Presis-paletten og kunne ikke stå på en lys Paper-flate.
   COPY: uendret. */

import Link from "next/link";
import { PkShell } from "./paper/PkShell";

type Utsnitt = { l: string; v: string };
type Feature = { eyebrow: string; tittel: string; tekst: string; utsnitt: Utsnitt[] };

const FEATURES: Feature[] = [
  {
    eyebrow: "Strokes gained i dybden",
    tittel: "Se hvor slagene forsvinner.",
    tekst:
      "Appen forteller deg hva du taper mest på og hva du skal trene. Ikke gjetting, ikke generiske råd. Tee, innspill, nærspill og putting, målt mot nivået du sikter på.",
    utsnitt: [
      { l: "SG totalt", v: "+1,8" },
      { l: "Nærspill", v: "−1,2" },
      { l: "Putting", v: "−0,5" },
      { l: "Tee", v: "+0,4" },
    ],
  },
  {
    eyebrow: "TrackMan per kølle",
    tittel: "Tallene dine, kølle for kølle.",
    tekst:
      "Lengder, spredning og treffbilde per kølle, rett fra TrackMan. Du vet nøyaktig hva en 7-er går, ikke hva du håper den går.",
    utsnitt: [
      { l: "Driver", v: "248 m" },
      { l: "Jern 7", v: "152 m" },
      { l: "PW", v: "108 m" },
      { l: "SW 56°", v: "78 m" },
    ],
  },
  {
    eyebrow: "Plan fra coachen din",
    tittel: "En uke som er din.",
    tekst:
      "Treningsplanen bygges rundt tallene dine og oppdateres av coachen. Du åpner appen og vet hva du skal gjøre i dag, og hvorfor.",
    utsnitt: [
      { l: "Nærspill 30 til 60 m", v: "I dag · 60 min" },
      { l: "FYS styrke", v: "I morgen · 45 min" },
      { l: "Teknikk P4", v: "Torsdag · 90 min" },
    ],
  },
  {
    eyebrow: "AI-caddie",
    tittel: "Svar når du lurer.",
    tekst:
      "Still spørsmål om spillet ditt og få svar basert på dine egne tall. Caddien foreslår, du og coachen bestemmer. Anbefalinger, aldri sperrer.",
    utsnitt: [
      { l: "Innsikt", v: "Du taper mest fra 30 til 60 m" },
      { l: "Neste økt", v: "Torsdag trener akkurat det" },
      { l: "Siste runde", v: "Putting +0,7 mot snittet" },
    ],
  },
];

export function MarkedPlayerHQV2() {
  return (
    <PkShell variant="side" aktiv="/playerhq" dataSlug="marketing-playerhq">
      <div className="pk-sek">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">PlayerHQ</span>
          <h1 className="pk-hero">Din golf, målt og planlagt.</h1>
          <p className="pk-ing">
            Appen forteller deg hva du taper mest på og hva du skal trene. Ikke gjetting, ikke
            generiske råd.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/auth/signup">
              Prøv gratis i én måned
            </Link>
          </div>
        </div>
      </div>

      {FEATURES.map((f) => (
        <div className="pk-sek pk-sek-tett" key={f.eyebrow}>
          <div className="pk-wrap pk-todelt">
            <div>
              <span className="pk-eyebrow">{f.eyebrow}</span>
              <h2 className="pk-sekt">{f.tittel}</h2>
              <p className="pk-ing">{f.tekst}</p>
            </div>
            <div className="pk-kort pk-kort-pad">
              <span className="pk-eyebrow">App-utsnitt</span>
              <div className="pk-fakta-liste">
                {f.utsnitt.map((u) => (
                  <div className="pk-linje" key={u.l}>
                    <span>{u.l}</span>
                    <span className="pk-v">{u.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <h2 className="pk-sekt">Følg fremgangen.</h2>
          <p className="pk-ing">
            Gratis i én måned. Deretter 299 kr per måned, eller inkludert i coaching-pakke.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/auth/signup">
              Prøv gratis i én måned
            </Link>
            <Link className="pk-btn" href="/priser">
              Se priser
            </Link>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
