/* AK Golf HQ — MARKEDSSIDE: Forsiden (/).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero, bilde, bevis-bånd, tre inngangskort,
   todelt case-sitat og sentrert avslutning. Skallet er PkShell (variant «side»).
   Ingen inline-stiler, ingen egne farger.

   AVVIK (bevisst, dokumentert i PR): parallakse-hero, scroll-avsløring
   (`m-avslor`), den klebrige telefon-sekvensen og SG-illustrasjonen er tatt
   bort. Alle fire var Presis-mønstre bygd på T-tokens (mørk palett) og finnes
   ikke i Paper-fasiten, som er en rolig, lys editorial-flate. Innholdet de bar
   lever videre: appen har egen inngang (/playerhq), SG-sammenligningen ligger
   fortsatt på /stats/sg-sammenlign.
   COPY: uendret der teksten er beholdt. Markus Røinås Pedersen er ekte coach
   (navne-kanon §unntak) og står fortsatt. */

import Image from "next/image";
import Link from "next/link";
import { PkShell } from "./paper/PkShell";

const TJENESTER: { navn: string; varighet: string; tekst: string; img: string; alt: string }[] = [
  {
    navn: "Flex-økt",
    varighet: "20 / 50 / 90 min",
    tekst: "Drop-in med coach — ett tema eller dypere, når det passer.",
    img: "/images/akademy/coaching-tripod.jpg",
    alt: "Coach filmer sving med stativ",
  },
  {
    navn: "Performance",
    varighet: "60 min",
    tekst: "Strukturert økt: TrackMan, analyse og plan inn i PlayerHQ.",
    img: "/images/akademy/putting-data.jpg",
    alt: "Putting med måleutstyr",
  },
  {
    navn: "Performance Pro",
    varighet: "90 min",
    tekst: "TrackMan, video, spredning og skriftlig plan.",
    img: "/images/akademy/utslag-fairway.jpg",
    alt: "Utslag fra fairway",
  },
  {
    navn: "Gruppe-økt",
    varighet: "60 min · inntil 6",
    tekst: "Nivåtilpasset trening i gruppe med coach.",
    img: "/images/akademy/bunker-shot.jpg",
    alt: "Bunkerslag",
  },
];

const PAKKER: { navn: string; okter: string; frem?: boolean; pkt: string[] }[] = [
  {
    navn: "Performance",
    okter: "2 økter per måned",
    pkt: [
      "Faste økter med coachen din",
      "Treningsplan i PlayerHQ",
      "PlayerHQ inkludert uten månedspris",
      "Meldingskontakt mellom øktene",
    ],
  },
  {
    navn: "Performance Pro",
    okter: "4 økter per måned",
    frem: true,
    pkt: [
      "Alt i Performance",
      "Dobbelt så mange coach-økter",
      "TrackMan og videoanalyse",
      "Oppfølging rundt turneringer",
    ],
  },
];

const BEVIS: { t: string; d: string }[] = [
  { t: "TrackMan og video", d: "Vi måler før vi mener." },
  { t: "Plan i PlayerHQ", d: "Samme tall for deg og coachen." },
  { t: "Faste økter", d: "2 eller 4 per måned i pakke." },
];

const INNGANGER: { eyebrow: string; navn: string; tekst: string; href: string }[] = [
  {
    eyebrow: "Én til én",
    navn: "Coaching",
    tekst:
      "Fast coach, egen plan og TrackMan-oppfølging. For deg som vil vite hvor slagene ligger.",
    href: "/coaching",
  },
  {
    eyebrow: "6–19 år",
    navn: "Junior og elite",
    tekst:
      "Gruppetrening gjennom hele året, med skoleplan og foreldreoversikt. Fire nivåer, fra første kølle til NM.",
    href: "/junior",
  },
  {
    eyebrow: "App",
    navn: "PlayerHQ",
    tekst:
      "Planen, øktene og tallene dine på telefonen. Følger med i alle coachingpakker, kan også kjøpes alene.",
    href: "/playerhq",
  },
];

export function MarkedForsideV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-forside">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">AK Golf Academy · Fredrikstad</span>
          <h1 className="pk-hero">Coaching som gir fremgang.</h1>
          <p className="pk-ing">
            Personlig oppfølging med faste økter, en plan som lever mellom øktene, og tall som viser
            hva som faktisk fungerer. Appen følger med — coachen er hovedsaken.
          </p>
          <div className="pk-knapperad">
            <Link className="pk-btn pk-btn-ink" href="/booking">
              Book en samtale
            </Link>
            <Link className="pk-btn" href="/coaching">
              Se oppleggene
            </Link>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <div className="pk-foto pk-foto-bred">
            <Image
              src="/images/akademy/coach-observerer.jpg"
              alt="Coach følger en spiller under trening"
              fill
              sizes="(max-width: 860px) 100vw, 1120px"
              priority
            />
          </div>
        </div>
      </div>

      <div className="pk-sek pk-band">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Hvorfor det fungerer</span>
          <div className="pk-bevis pk-bevis-topp">
            {BEVIS.map((b) => (
              <div key={b.t}>
                <span className="pk-t pk-t-tekst">{b.t}</span>
                <span className="pk-u">{b.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek">
        <div className="pk-wrap">
          <h2 className="pk-sekt">Tre måter å jobbe med oss på.</h2>
          <div className="pk-rutenett">
            {INNGANGER.map((k) => (
              <Link className="pk-mkort" href={k.href} key={k.navn}>
                <span className="pk-eyebrow">{k.eyebrow}</span>
                <h3 className="pk-und">{k.navn}</h3>
                <p>{k.tekst}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Hva coaching hos oss er</span>
          <h2 className="pk-sekt">Fire måter å booke en økt.</h2>
          <p className="pk-ing">
            Alle økter er med coach. Pris avtales i samtalen — den avhenger av opplegg og reisevei.
          </p>
          <div className="pk-rutenett">
            {TJENESTER.map((t) => (
              <div className="pk-mkort pk-mkort-foto" key={t.navn}>
                <div className="pk-foto">
                  <Image src={t.img} alt={t.alt} fill sizes="(max-width: 900px) 100vw, 360px" />
                </div>
                <span className="pk-eyebrow">{t.varighet}</span>
                <h3 className="pk-und">{t.navn}</h3>
                <p>{t.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Pakker</span>
          <h2 className="pk-sekt">Fast frekvens.</h2>
          <div className="pk-prisrad">
            {PAKKER.map((p) => (
              <div className={`pk-pris${p.frem ? " pk-pris-valgt" : ""}`} key={p.navn}>
                <span className="pk-eyebrow">{p.frem ? "Mest valgt" : "Pakke"}</span>
                <h3 className="pk-und">{p.navn}</h3>
                <span className="pk-tall">
                  {p.okter.split(" ")[0]} <small>økter per måned</small>
                </span>
                <ul>
                  {p.pkt.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <Link className={`pk-btn${p.frem ? " pk-btn-ink" : ""}`} href="/booking">
                  Book {p.navn}
                </Link>
              </div>
            ))}
          </div>
          <p className="pk-ing pk-ing-fot">
            Hva er en coaching-pakke? Antall økter med coach per måned — ikke et app-nivå. PlayerHQ
            er den samme for alle og er inkludert uten egen månedspris så lenge du har pakke.
          </p>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-todelt">
          <div className="pk-foto">
            <Image
              src="/images/akademy/putting-data.jpg"
              alt="Putting med måleutstyr"
              fill
              sizes="(max-width: 900px) 100vw, 540px"
            />
          </div>
          <div>
            <span className="pk-eyebrow">Verktøyet følger med</span>
            <blockquote className="pk-sitat">
              «Du og coachen ser de samme tallene. Planen, øktene og strokes gained lever mellom
              timene — ikke i et regneark ingen åpner.»
            </blockquote>
            <p className="pk-ing pk-ing-fot">
              Markus Røinås Pedersen — Head Coach, AK Golf Academy
            </p>
            <div className="pk-knapperad">
              <Link className="pk-btn" href="/playerhq">
                Se PlayerHQ
              </Link>
              <Link className="pk-btn" href="/stats/sg-sammenlign">
                Åpne SG-sammenligning
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <h2 className="pk-sekt">Klar for en uforpliktende samtale?</h2>
          <p className="pk-ing">
            Vi finner opplegg som passer spillet ditt. Pris avtales i samtalen.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/booking">
              Book en samtale
            </Link>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
