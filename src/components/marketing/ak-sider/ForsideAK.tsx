import Image from "next/image";

import {
  Akkordeon,
  Faktarad,
  Fotokort,
  Instrumentflate,
  Knapp,
  Kort,
  Merkelapp,
  Seksjon,
  Talleblokk,
} from "@/components/marketing/ak";

/**
 * Forsiden i Master AK Golf (MASTERPLAN 18.33 runde 1).
 *
 * Tegning: `designsystem/ak-golf/ui_kits/markedsside/Deler.jsx`.
 * Tekst: `docs/marketing/tekstplan-forside-2026-09-05.md` — LÅST 05.09.2026.
 * Der kitet og tekstplanen spriker, vinner planen (Anders 05.09): bunnens
 * roller, svartidsløftet og bildeteksten under heroen. Bunnen tegnes av
 * `(marketing)/layout.tsx`; denne fila tegner aldri eget skall.
 *
 * Ett bevisst avvik fra kitet: heroens rutenett er 56 px også på mobil.
 * Kitet setter `tett` på mobil-artboardet, men masterens eget token sier at
 * 56 px er valgt nettopp for å lese «på Mac uten å bli støy på 390 px»
 * (instrument.css). Å bytte størrelse på brekkpunkt ville krevd ny CSS.
 */

const FOTO = "/brand/foto/";

function Hero() {
  return (
    <Instrumentflate som="section" style={{ borderBottom: "1px solid var(--ak-linje)" }}>
      <div
        className="mx-auto px-ak-4 pt-ak-8 pb-ak-9 md:px-ak-6 md:pt-ak-9 md:pb-ak-10"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <h1
          className="text-ak-72 md:text-ak-112 md:max-w-[15ch]"
          style={{
            lineHeight: "var(--ak-lh-display)",
            letterSpacing: "var(--ak-sp-display)",
            textTransform: "uppercase",
          }}
        >
          Uansett hvor du står, vet du hva du trener på.
        </h1>
        <p className="mt-ak-5 text-ak-21 md:mt-ak-6" style={{ color: "var(--ak-tekst)", maxWidth: "54ch" }}>
          Vi måler svingen din, tallene dine og spillet ditt. Så får du en plan som holder mellom
          øktene — og oppfølging som gjør at den faktisk blir fulgt.
        </p>
        <div className="mt-ak-6 flex flex-wrap gap-ak-4">
          <Knapp storrelse="lg" href="/booking" className="w-full sm:w-auto">
            Book kartleggingsøkt
          </Knapp>
        </div>
        <p className="mt-ak-5 text-ak-15" style={{ color: "var(--ak-dempet)", maxWidth: "52ch" }}>
          Første økt er 90 minutter, til vanlig timepris. Vi kartlegger hvor du står, og du går
          derfra med en skriftlig plan.
        </p>
      </div>
    </Instrumentflate>
  );
}

/* Uten bildetekst: «Trackman står i hver økt» er tatt ut (Anders 05.09,
   tekstplanen § 1.1). Alt-teksten står. */
function Bilde() {
  return (
    <div className="relative h-[260px] w-full md:h-[480px]">
      <Image
        src={`${FOTO}AK-Golf-Academy-1.jpg`}
        alt="Spiller slår, coach følger målingen på Trackman bak"
        fill
        sizes="100vw"
        priority
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

const PROBLEMER = [
  {
    tittel: "Timen hos proffen",
    brodtekst: "Slutter når timen slutter. Neste gang begynner på nytt, ofte med et nytt fokus.",
  },
  {
    tittel: "Å lære av video",
    brodtekst: "Uendelig med råd, null diagnose. Du vet ikke hvilket av tusen råd som gjelder deg.",
  },
  {
    tittel: "En app uten coach",
    brodtekst: "Registrerer hva du gjorde. Sier ingenting om hva du burde gjort.",
  },
];

function Problemet() {
  return (
    <Seksjon senket>
      <h2
        className="text-ak-34 md:text-ak-48"
        style={{
          letterSpacing: "var(--ak-sp-display)",
          lineHeight: "var(--ak-lh-display)",
          maxWidth: "24ch",
        }}
      >
        De fleste vet ikke hva de trener på.
      </h2>
      <p className="mt-ak-5 text-ak-17 md:mt-ak-6" style={{ maxWidth: "58ch" }}>
        Ikke fordi de er late. Fordi ingen har målt. Du slår en bøtte baller, det føles bedre eller
        verre, og neste uke starter du på nytt. Det er ikke trening — det er håp.
      </p>
      <div className="mt-ak-7 grid grid-cols-1 gap-ak-4 md:grid-cols-3 md:gap-ak-5">
        {PROBLEMER.map((k) => (
          <Kort key={k.tittel} tyngde={1}>
            <h3 className="text-ak-21">{k.tittel}</h3>
            <p className="mt-ak-3 text-ak-15" style={{ color: "var(--ak-dempet)" }}>
              {k.brodtekst}
            </p>
          </Kort>
        ))}
      </div>
    </Seksjon>
  );
}

function Losningen() {
  return (
    <Seksjon>
      <div className="grid grid-cols-1 items-start gap-ak-6 md:grid-cols-2 md:gap-ak-8">
        <div>
          <span className="ak-etikett">Slik jobber vi</span>
          <h2
            className="mt-ak-3 text-ak-34 md:text-ak-48"
            style={{ letterSpacing: "var(--ak-sp-display)", lineHeight: "var(--ak-lh-display)" }}
          >
            Vi begynner med et tall.
          </h2>
          <p className="mt-ak-5 text-ak-17">
            Trackman måler hva køllehodet faktisk gjør. Testbatteriet viser hvor du står i forhold
            til deg selv sist. Deretter legger vi planen — og den ligger i appen, så du vet hva
            onsdagsøkta skal inneholde.
          </p>
          <Faktarad
            style={{ marginTop: "var(--ak-r-6)" }}
            kompakt
            poster={[
              { etikett: "Testprotokoller", verdi: "20" },
              { etikett: "Posisjoner i svingen", verdi: "P1–P10" },
              { etikett: "Trackman i hver økt", verdi: "100", enhet: "%" },
            ]}
          />
        </div>
        <Fotokort
          bilde={`${FOTO}renset/AK-Golf-Academy-9.jpg`}
          alt="Coach og spiller ser på Trackman-skjermen sammen"
          bildetekst="Målingen tolkes i økta, ikke i etterkant."
          kilde="Foto #9"
          forhold="4 / 3"
        />
      </div>
    </Seksjon>
  );
}

function Tallet() {
  return (
    <Seksjon senket>
      <div className="grid grid-cols-1 items-center gap-ak-6 md:grid-cols-2 md:gap-ak-8">
        <div>
          {/* Tallet er ikke målt. Merket står synlig ved blokken til basen har
              et ekte tall (Anders 05.09, MASTERPLAN 0.14/0.15). */}
          <Merkelapp variant="fag">Eksempel</Merkelapp>
          <Talleblokk
            style={{ marginTop: "var(--ak-r-3)" }}
            etikett="Carry, driver"
            tall="+12,4"
            enhet="m"
            storrelse="lg"
            fremhevet
            forklaring="Vi endret ikke svingen først. Vi målte i seks økter, fant at Attack Angle var problemet, og jobbet bare med den."
            kilde="Trackman"
            dato="12.05–18.08.2026"
            antall={38}
          />
        </div>
        <div>
          <h2 className="text-ak-26">Slik leser du tallet</h2>
          <p className="mt-ak-4 text-ak-17" style={{ color: "var(--ak-dempet)" }}>
            Attack Angle beskriver om køllehodet går opp eller ned i treffet. Går det nedover med
            driver, får du høy Spin Rate og lav Launch Angle — du taper lengde uten å slå svakere.
          </p>
          <p className="mt-ak-4 text-ak-17" style={{ color: "var(--ak-dempet)" }}>
            Du kjenner det ikke. Det er derfor vi måler det.
          </p>
        </div>
      </div>
    </Seksjon>
  );
}

function Junior() {
  return (
    <section style={{ background: "var(--ak-v-junior)", color: "#FFFFFF" }}>
      <div
        className="mx-auto grid grid-cols-1 items-center gap-ak-6 px-ak-4 py-ak-9 md:grid-cols-[1.1fr_1fr] md:gap-ak-8 md:px-ak-6 md:py-ak-10"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <div>
          <span className="ak-etikett" style={{ color: "rgba(255,255,255,.78)" }}>
            Junior Academy
          </span>
          <h2
            className="mt-ak-3 text-ak-34 md:text-ak-48"
            style={{
              letterSpacing: "var(--ak-sp-display)",
              lineHeight: "var(--ak-lh-display)",
              color: "#FFFFFF",
            }}
          >
            Barnet ditt skal vite hva det jobber med.
          </h2>
          <p className="mt-ak-5 text-ak-17" style={{ color: "rgba(255,255,255,.92)" }}>
            AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn
            med navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste.
          </p>
          <div className="mt-ak-6">
            <Knapp
              variant="sekundaer"
              href="/kontakt"
              className="w-full sm:w-auto"
              style={{ borderColor: "rgba(255,255,255,.6)", color: "#FFFFFF", background: "transparent" }}
            >
              Meld interesse
            </Knapp>
          </div>
        </div>
        <div className="relative h-[220px] w-full md:h-[320px]" style={{ borderRadius: "var(--ak-hjorne-md)", overflow: "hidden" }}>
          <Image
            src={`${FOTO}AK-Golf-Academy-35.jpg`}
            alt="Ball i gresset på et treningsfelt, lav kameravinkel mot blå himmel"
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}

const SPORSMAL = [
  {
    tittel: "Hva koster kartleggingsøkta?",
    innhold:
      "90 minutter til vanlig timepris. Du går derfra med en skriftlig plan. Ingen binding etterpå.",
  },
  {
    tittel: "Må barnet ha eget utstyr?",
    innhold: "Nei. Vi har køller til lån i alle gruppene til og med U12.",
  },
  {
    tittel: "Hva koster appen?",
    innhold:
      "Testbatteriet, statistikken og verktøyene er gratis, uten utløpsdato. Resten av appen koster 299 kr i måneden. Har du coaching-pakke, følger appen med.",
  },
  {
    tittel: "Hvordan settes gruppene?",
    innhold:
      "Etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner riktig gruppe i en samtale før oppstart.",
  },
];

function Sporsmal() {
  return (
    <Seksjon>
      <h2 className="text-ak-26 md:text-ak-34">Det foreldre spør om</h2>
      <Akkordeon style={{ marginTop: "var(--ak-r-5)", maxWidth: 760 }} apenIndeks={0} poster={SPORSMAL} />
    </Seksjon>
  );
}

function Avslutning() {
  return (
    <section className="relative">
      <Image
        src={`${FOTO}AK-Golf-Academy-28.jpg`}
        alt="Spiller på green mot mørk bakgrunn"
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(20,20,19,.9) 0%, rgba(20,20,19,.66) 44%, rgba(20,20,19,.34) 100%)",
        }}
      />
      <div
        className="relative mx-auto px-ak-4 py-ak-9 md:px-ak-6 md:py-ak-10"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <h2
          className="text-ak-34 md:text-ak-48"
          style={{
            letterSpacing: "var(--ak-sp-display)",
            lineHeight: "var(--ak-lh-display)",
            color: "#FFFFFF",
            maxWidth: "22ch",
          }}
        >
          Klar for å finne ut hvor du faktisk står?
        </h2>
        <p className="mt-ak-4 text-ak-21" style={{ color: "rgba(255,255,255,.92)" }}>
          90 minutter, vanlig timepris. Du går derfra med en plan.
        </p>
        <div className="mt-ak-6">
          <Knapp storrelse="lg" href="/booking" className="w-full sm:w-auto">
            Book kartleggingsøkt
          </Knapp>
        </div>
      </div>
    </section>
  );
}

export function ForsideAK() {
  return (
    <>
      <Hero />
      <Bilde />
      <Problemet />
      <Losningen />
      <Tallet />
      <Junior />
      <Sporsmal />
      <Avslutning />
    </>
  );
}
