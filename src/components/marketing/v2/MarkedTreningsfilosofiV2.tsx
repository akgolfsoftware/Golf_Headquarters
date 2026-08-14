/* AK Golf HQ — MARKEDSSIDE: Treningsfilosofi (/treningsfilosofi).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero, foto, kort-rutenett og sentrert
   avslutning. Skallet er PkShell (variant «side»). Ingen inline-stiler.

   Pyramide- og SG-kodene står som mono-eyebrow (Paper har ingen farget
   akse-brikke — fargekodingen fra Presis er bevisst borte).
   COPY: uendret fra forrige versjon. */

import Image from "next/image";
import Link from "next/link";
import { PkShell } from "./paper/PkShell";

const PYRAMIDE: { kort: string; navn: string; tekst: string }[] = [
  {
    kort: "FYS",
    navn: "Fysisk",
    tekst:
      "Rotasjon, mobilitet og kjernemuskulatur er fundamentet alt annet bygger på. Har du ikke basen, fester ikke tekniske endringer seg, uansett hvor mange repetisjoner du tar.",
  },
  {
    kort: "TEK",
    navn: "Teknisk",
    tekst:
      "Sving, grep, impact og club-path, analysert med Trackman som fasit. Vi bygger en sving du kan stole på under press, ikke én som bare ser bra ut på video.",
  },
  {
    kort: "SLAG",
    navn: "Slag",
    tekst:
      "60–65 % av alle slag skjer innen 100 meter fra flagget. Chip, pitch, putt og bunkerspill trenes systematisk, for det er her de fleste slag hentes.",
  },
  {
    kort: "SPILL",
    navn: "Spill",
    tekst:
      "Riktig valg er like viktig som riktig utførelse. Vi trener beslutninger, risk/reward og banetilpasning, slik at du skårer lavere med svingene du allerede har.",
  },
  {
    kort: "TURN",
    navn: "Turnering",
    tekst:
      "Alt du øver på må holde når det gjelder. Pre-shot rutine, fokusstrategi og press-håndtering, slik at du er den samme spilleren i runde to som i treningsrunden.",
  },
];

const SG: { kort: string; navn: string; tekst: string }[] = [
  { kort: "OTT", navn: "Off The Tee", tekst: "Drives og lengde-slag fra utslag" },
  { kort: "APP", navn: "Approach", tekst: "Innspill til grønn fra fairway/rough" },
  { kort: "ARG", navn: "Nærspill", tekst: "Chip, pitch og korthold" },
  { kort: "PUTT", navn: "Putting", tekst: "Alle slag på grønnen" },
];

export function MarkedTreningsfilosofiV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-treningsfilosofi">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Slik trener vi</span>
          <h1 className="pk-hero">Trening som er balansert, målbar og din egen.</h1>
          <p className="pk-ing">
            Vi tror ikke på trening-flavor-of-the-week. Hver spiller får en plan basert på tre
            prinsipper: balansert pyramide, data-drevet retning, og individualisering på alvor.
          </p>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <div className="pk-foto pk-foto-bred">
            <Image
              src="/images/akademy/putting-vann.jpg"
              alt="To spillere på putting-grønn med vann-refleksjon i forgrunnen"
              fill
              sizes="(max-width: 860px) 100vw, 1120px"
            />
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Prinsipp 1 · pyramiden</span>
          <h2 className="pk-sekt">Fem områder, samtidig.</h2>
          <p className="pk-ing">
            Fem områder må jobbes med samtidig, ikke ett etter et. Vi sørger for at tiden din
            fordeles riktig.
          </p>
          <div className="pk-rutenett">
            {PYRAMIDE.map((p) => (
              <div className="pk-mkort" key={p.kort}>
                <span className="pk-eyebrow">{p.kort}</span>
                <h3 className="pk-und">{p.navn}</h3>
                <p>{p.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Prinsipp 2 · strokes gained</span>
          <h2 className="pk-sekt">Data forteller hvor du skal trene.</h2>
          <p className="pk-ing">
            Vi bruker Strokes Gained (SG) til å se nøyaktig hvor du taper slag mot ditt nivå. Det
            betyr at planen din peker på det som faktisk koster deg slag, ikke det som føles
            dårligst.
          </p>
          <div className="pk-rutenett">
            {SG.map((s) => (
              <div className="pk-mkort" key={s.kort}>
                <span className="pk-eyebrow">{s.kort}</span>
                <h3 className="pk-und">{s.navn}</h3>
                <p>{s.tekst}</p>
              </div>
            ))}
          </div>
          <p className="pk-ing pk-ing-fot">
            Etter 3–5 registrerte runder ser vi et klart mønster. Kanskje driver du bedre enn du
            tror, men taper alt rundt grønnen. Kanskje er innspillene svakheten ingen har fortalt
            deg om. Planen peker dit dataen peker, ikke dit magefølelsen peker.
          </p>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <div className="pk-foto">
            <Image
              src="/images/akademy/bunker-shot.jpg"
              alt="Nærbilde av spiller midt i bunker-shot med sand som spruter"
              fill
              sizes="(max-width: 860px) 100vw, 1120px"
            />
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Prinsipp 3 · individualisering</span>
          <h2 className="pk-sekt">Ingen plan er kopi av en annen.</h2>
          <div className="pk-prosa">
            <p>
              Det som virker for en elite-junior, virker ikke for en 50-åring som spiller én gang i
              uken. Hver plan tar utgangspunkt i tre ting: <strong>målet ditt</strong>,{" "}
              <strong>tiden du har tilgjengelig</strong>, og{" "}
              <strong>ferdighetene du allerede har</strong>. Det er du som setter ambisjonen. Vi
              sørger for at veien dit er realistisk.
            </p>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">Neste steg</span>
          <h2 className="pk-sekt">Vil du trene slik?</h2>
          <p className="pk-ing">
            Book en intro-time, eller velg en av coaching-pakkene våre med månedlig oppfølging.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/booking">
              Book intro-time
            </Link>
            <Link className="pk-btn" href="/coaching">
              Se coaching-pakker
            </Link>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
