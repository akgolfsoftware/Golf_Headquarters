/* AK Golf HQ — MARKEDSSIDE: Coaching (/coaching).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero med bilde, katalogkort med foto,
   pakkerad, stegrekke, spørsmålsliste og sentrert avslutning.
   Skallet er PkShell (variant «side»). Ingen inline-stiler, ingen egne farger.

   AVVIK (bevisst): scroll-avsløringen (`m-avslor`) er tatt bort — fasiten har
   ingen inn-animasjon på marketing. Spørsmålene er native <details>.
   COPY og bilder: uendret fra forrige versjon. Markus Røinås Pedersen står
   fortsatt som Head Coach (ekte coach — navne-kanon §unntak). */

import Image from "next/image";
import Link from "next/link";
import { PkShell } from "./paper/PkShell";

const TJENESTER: {
  navn: string;
  varighet: string;
  skjer: string;
  tarMed: string;
  forHvem: string;
  img: string;
  alt: string;
}[] = [
  {
    navn: "Flex-økt",
    varighet: "20 / 50 / 90 min",
    skjer: "Én konkret sak eller dypere økt — du og coachen blir enige på stedet.",
    tarMed: "Tydelig neste steg og notater i PlayerHQ om du har tilgang.",
    forHvem: "Deg som vil ha en enkeltøkt uten abonnement.",
    img: "/images/akademy/coaching-tripod.jpg",
    alt: "Coach filmer sving",
  },
  {
    navn: "Performance",
    varighet: "60 min",
    skjer: "TrackMan, analyse og plan som legges inn i PlayerHQ.",
    tarMed: "Oppdatert ukeplan og øvelser du kan trene videre på.",
    forHvem: "Spillere som vil ha struktur og oppfølging over tid.",
    img: "/images/akademy/putting-data.jpg",
    alt: "Putting med data",
  },
  {
    navn: "Performance Pro",
    varighet: "90 min",
    skjer: "TrackMan, video, spredning og skriftlig plan.",
    tarMed: "Dypere analyse og tydelig prioritert treningsfokus.",
    forHvem: "Deg som vil gå grundigere og ha mer tid på banen/range.",
    img: "/images/akademy/utslag-fairway.jpg",
    alt: "Utslag",
  },
  {
    navn: "Gruppe-økt",
    varighet: "60 min · max 6",
    skjer: "Nivåtilpasset trening i gruppe med coach.",
    tarMed: "Felles økt + individuelle justeringer.",
    forHvem: "Junior, lag eller venner som vil trene sammen.",
    img: "/images/akademy/bunker-shot.jpg",
    alt: "Bunker",
  },
];

const PAKKER: { navn: string; okter: string; frem?: boolean; pkt: string[] }[] = [
  {
    navn: "Performance",
    okter: "2 økter / mnd",
    pkt: ["Faste økter", "Plan i PlayerHQ", "App inkludert", "Meldinger mellom økter"],
  },
  {
    navn: "Performance Pro",
    okter: "4 økter / mnd",
    frem: true,
    pkt: ["Alt i Performance", "Dobbelt frekvens", "TrackMan og video", "Turneringsoppfølging"],
  },
];

const STEG: { t: string; d: string }[] = [
  { t: "Ankomst", d: "Kort prat om form og mål for økten." },
  { t: "Måling", d: "TrackMan, video eller tester — tall før mening." },
  { t: "Arbeid", d: "Trening på det som koster flest slag." },
  { t: "Plan", d: "Neste steg legges i PlayerHQ før du drar." },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Trenger jeg egne køller?",
    a: "Ja, ta med baggen din. Vi har ikke utleiekøller som standard. Si ifra på forhånd hvis du trenger tilpasning.",
  },
  {
    q: "Hvor langt i forveien må jeg booke?",
    a: "Jo tidligere, jo bedre — spesielt kvelder og helger. Ledige tider ser du i booking, eller vi finner tid i samtalen.",
  },
  {
    q: "Hva hvis jeg må avbestille?",
    a: "Avbestill i god tid (helst mer enn 24 timer før). Nærmere frist kan økten gå tapt, avhengig av avtale. Det står også i bekreftelsen.",
  },
  {
    q: "Passer dette for nybegynnere?",
    a: "Ja. Vi tilpasser tempo og språk. Flex-økt eller Performance er vanlig start — vi anbefaler det som passer deg, uten å stenge noe ute.",
  },
];

export function MarkedCoachingV2() {
  return (
    <PkShell variant="side" aktiv="/coaching" dataSlug="marketing-coaching">
      <div className="pk-sek">
        <div className="pk-wrap pk-todelt">
          <div>
            <span className="pk-eyebrow">Coaching</span>
            <h1 className="pk-hero">Bedre golf i hverdagen.</h1>
            <p className="pk-ing">
              Du får en coach som følger deg over tid, ikke bare én time på rangen. Måling, plan og
              økter henger sammen.
            </p>
            <p className="pk-ing pk-ing-fot">
              Markus Røinås Pedersen — Head Coach, AK Golf Academy
            </p>
            <div className="pk-knapperad">
              <Link className="pk-btn pk-btn-ink" href="/booking">
                Book en samtale
              </Link>
            </div>
          </div>
          <div className="pk-foto">
            <Image
              src="/images/akademy/coach-observerer.jpg"
              alt="Coach følger spiller"
              fill
              sizes="(max-width: 900px) 100vw, 540px"
              priority
            />
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Tjenester</span>
          <h2 className="pk-sekt">Velg form — samme coachingkvalitet.</h2>
          <div className="pk-rutenett">
            {TJENESTER.map((t) => (
              <div className="pk-mkort pk-mkort-foto" key={t.navn}>
                <div className="pk-foto">
                  <Image src={t.img} alt={t.alt} fill sizes="(max-width: 900px) 100vw, 360px" />
                </div>
                <span className="pk-eyebrow">{t.varighet}</span>
                <h3 className="pk-und">{t.navn}</h3>
                <div className="pk-fakta-liste">
                  <div className="pk-linje">
                    <span>I økten</span>
                    <span className="pk-v">{t.skjer}</span>
                  </div>
                  <div className="pk-linje">
                    <span>Du tar med deg</span>
                    <span className="pk-v">{t.tarMed}</span>
                  </div>
                  <div className="pk-linje">
                    <span>Passer for</span>
                    <span className="pk-v">{t.forHvem}</span>
                  </div>
                </div>
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
                  {p.okter.split(" ")[0]} <small>økter / mnd</small>
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
            Pakke er antall økter: Performance og Performance Pro er coaching-pakker (2 eller 4
            økter per måned), ikke app-nivåer. PlayerHQ er inkludert.
          </p>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Slik går en økt</span>
          <h2 className="pk-sekt">Fra ankomst til plan.</h2>
          <div className="pk-rutenett">
            {STEG.map((s, i) => (
              <div className="pk-mkort" key={s.t}>
                <span className="pk-eyebrow">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="pk-und">{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Spørsmål før du booker</span>
          <h2 className="pk-sekt">Kort og ærlig.</h2>
          {FAQ.map((f) => (
            <details className="pk-qa" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <h2 className="pk-sekt">Finn riktig opplegg i en samtale.</h2>
          <p className="pk-ing">
            Uforpliktende. Vi snakker om mål, tid og nivå — pris avtales der.
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
