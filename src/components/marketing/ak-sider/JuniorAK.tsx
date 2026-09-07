import Image from "next/image";

import {
  Akkordeon,
  Knapp,
  Kort,
  Seksjon,
  Talleblokk,
} from "@/components/marketing/ak";

/**
 * /junior i Master AK Golf (MASTERPLAN 18.33 runde 2).
 *
 * Tegning: `designsystem/ak-golf/ui_kits/markedsside/JuniorDeler.jsx`.
 * Tekst: `designsystem/ak-golf/guidelines/tekstkonsept.md` §Junior.
 * Ingen bilder av barn — arkivet har ingen med samtykke (kitets egen merknad).
 *
 * Tre steder der denne fila avviker fra kitet, alle med kilde:
 *
 * 1. SVARTIDSLØFTET ER UTE. Kitets avslutning sier «så tar vi kontakt innen
 *    én virkedag». Anders 05.09: løftet gis ikke på noen markedsflate før
 *    Jarvis er i drift (beslutninger.md §FORSIDETEKSTEN LÅST, MASTERPLAN 18.34).
 *
 * 2. FEM TRINN, IKKE FIRE — OG KODENS ALDRE. Kitet tegner fire kort (Elite
 *    mangler) med aldre 6–8/8–10/10–13/13+. AK-stigen har fem trinn, og
 *    aldrene i `src/lib/agencyos/ak-stigen-data.ts` er koblet til de faktiske
 *    GFGK-gruppene (U10/U13/U15/U19). Koden er sannheten; kitet er tegning.
 *
 * 3. TO TALL ER TATT UT. Kitets Faktarad lover «8 plasser per gruppe» og
 *    «2 trenere per gruppe». Ingen kilde funnet, og det er et løfte til
 *    foreldre. Anders 07.09: ta dem ut til de er sikre. Da sto bare «køller
 *    til lån» igjen, og en Faktarad med ett tall er ikke den komponenten
 *    brukt riktig — svaret står i akkordeonet under. Hele raden er ute til
 *    tallene er bekreftet.
 */

const FOTO = "/brand/foto/";

function JuniorHero() {
  return (
    <section style={{ background: "var(--ak-v-junior)", color: "#FFFFFF" }}>
      <div
        className="mx-auto px-ak-4 pt-ak-8 pb-ak-9 md:px-ak-6 md:pt-ak-9 md:pb-ak-10"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <span className="ak-etikett" style={{ color: "rgba(255,255,255,.78)" }}>
          AK Golf Junior Academy
        </span>
        <h1
          className="mt-ak-3 text-ak-48 md:text-ak-72"
          style={{
            lineHeight: "var(--ak-lh-display)",
            letterSpacing: "var(--ak-sp-display)",
            color: "#FFFFFF",
            maxWidth: "18ch",
          }}
        >
          Barnet ditt skal vite hva det jobber med.
        </h1>
        <p className="mt-ak-5 text-ak-21" style={{ color: "rgba(255,255,255,.92)", maxWidth: "52ch" }}>
          AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn med
          navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste.
        </p>
        <div className="mt-ak-6">
          <Knapp
            storrelse="lg"
            href="/kontakt"
            className="w-full sm:w-auto"
            style={{ background: "#FFFFFF", color: "var(--ak-v-junior)" }}
          >
            Meld interesse
          </Knapp>
        </div>
      </div>
    </section>
  );
}

function Forelderen() {
  return (
    <Seksjon>
      <div className="grid grid-cols-1 items-center gap-ak-6 md:grid-cols-2 md:gap-ak-8">
        <div>
          <span className="ak-etikett">For forelderen</span>
          <h2
            className="mt-ak-3 text-ak-34 md:text-ak-48"
            style={{
              letterSpacing: "var(--ak-sp-display)",
              lineHeight: "var(--ak-lh-display)",
              maxWidth: "20ch",
            }}
          >
            Du slipper å spørre hvordan det går.
          </h2>
          <p className="mt-ak-5 text-ak-17" style={{ maxWidth: "54ch" }}>
            Foreldreportalen viser hva som er trent, hva som er målt og hva som er neste steg. Ingen
            ukentlige meldinger fra deg som må besvares — du ser det selv.
          </p>
        </div>
        <Kort tyngde={2}>
          <Talleblokk
            etikett="Trinn på AK-stigen"
            tall="3"
            enhet="av 5"
            storrelse="lg"
            forklaring="Basis. Neste trinn krever to turneringsrunder under 85."
            kilde="AK Golf HQ"
            dato="18.08.2026"
          />
          <p
            className="ak-maalt mt-ak-3 text-ak-13"
            style={{ color: "var(--ak-dempet)" }}
          >
            Eksempel — slik ser det ut i foreldreportalen
          </p>
        </Kort>
      </div>
    </Seksjon>
  );
}

/* Aldre og trinn fra src/lib/agencyos/ak-stigen-data.ts — samme stige som
   AgencyOS bruker, koblet til de faktiske GFGK-gruppene. */
const TRINN = [
  {
    navn: "Mini",
    alder: "til og med 10 år",
    brodtekst: "Første møte med ballen. Lek, grep og balanse. Køller til lån, ingen tall ennå.",
  },
  {
    navn: "Knøtt",
    alder: "11–12 år",
    brodtekst: "Broen mellom lek og struktur. Første egne mål, og første måling: hvor langt går 7-jernet.",
  },
  {
    navn: "Basis",
    alder: "til og med 13 år",
    brodtekst: "Fast teknisk fundament. Teknikk med Trackman, egen plan i appen, første turnering.",
  },
  {
    navn: "Utvikling",
    alder: "til og med 15 år",
    brodtekst: "Egen plan og egne tester. Konkurranse begynner å telle.",
  },
  {
    navn: "Elite",
    alder: "til og med 19 år",
    brodtekst: "Turneringsspill, periodisering og måling mot mål.",
  },
];

function Gruppene() {
  return (
    <Seksjon senket>
      <span className="ak-etikett">Gruppene</span>
      <h2
        className="mt-ak-3 text-ak-34 md:text-ak-48"
        style={{ letterSpacing: "var(--ak-sp-display)", lineHeight: "var(--ak-lh-display)" }}
      >
        Fem trinn med navn.
      </h2>
      <p className="mt-ak-5 text-ak-17" style={{ maxWidth: "58ch" }}>
        Gruppene er satt etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner
        riktig gruppe i en samtale før oppstart.
      </p>
      <div className="mt-ak-7 grid grid-cols-1 gap-ak-4 sm:grid-cols-2 md:grid-cols-5 md:gap-ak-5">
        {TRINN.map((t, i) => (
          <Kort key={t.navn} tyngde={1} style={{ borderTop: "3px solid var(--ak-v-junior)" }}>
            <span className="ak-etikett">
              Trinn {i + 1} · {t.alder}
            </span>
            <h3 className="mt-ak-2 text-ak-26">{t.navn}</h3>
            <p className="mt-ak-3 text-ak-15" style={{ color: "var(--ak-dempet)" }}>
              {t.brodtekst}
            </p>
          </Kort>
        ))}
      </div>
    </Seksjon>
  );
}

const SPORSMAL = [
  {
    tittel: "Må barnet ha eget utstyr?",
    innhold: "Nei. Vi har køller til lån i alle gruppene til og med U12.",
  },
  {
    tittel: "Hva koster det?",
    innhold:
      "Gruppeplass betales per semester. Prisen står i bookingen, ikke her — den hentes fra samme sted som fakturaen.",
  },
  {
    tittel: "Kan jeg se hva barnet trener på?",
    innhold:
      "Ja. Foreldreportalen viser øktene, målingene og neste steg. Du får en kort rapport etter hver periode.",
  },
  {
    tittel: "Hva hvis barnet ikke vil konkurrere?",
    innhold:
      "Da konkurrerer det ikke. Trinnene handler om hva spilleren kan, ikke om turneringer. Turneringsspill kommer når spilleren vil.",
  },
];

function JuniorSporsmal() {
  return (
    <Seksjon>
      <h2 className="text-ak-26 md:text-ak-34">Det foreldre spør om</h2>
      <Akkordeon style={{ marginTop: "var(--ak-r-5)", maxWidth: 760 }} apenIndeks={0} poster={SPORSMAL} />
    </Seksjon>
  );
}

function JuniorAvslutning() {
  return (
    <section style={{ background: "var(--ak-tekst)", color: "var(--ak-grunn)" }}>
      <div
        className="mx-auto grid grid-cols-1 items-center gap-ak-8 px-ak-4 py-ak-9 md:grid-cols-2 md:px-ak-6 md:py-ak-10"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <div>
          <h2
            className="text-ak-34 md:text-ak-48"
            style={{
              letterSpacing: "var(--ak-sp-display)",
              lineHeight: "var(--ak-lh-display)",
              color: "var(--ak-grunn)",
              maxWidth: "20ch",
            }}
          >
            Lurer du på hvilken gruppe som passer?
          </h2>
          {/* Uten «innen én virkedag» — se filhodet, punkt 1. */}
          <p className="mt-ak-4 text-ak-21" style={{ color: "var(--ak-grunn)", opacity: 0.9 }}>
            Send oss alder og litt om erfaringen, så tar vi kontakt.
          </p>
          <div className="mt-ak-6">
            <Knapp storrelse="lg" href="/kontakt" className="w-full sm:w-auto">
              Meld interesse
            </Knapp>
          </div>
        </div>
        <div
          className="relative h-[220px] w-full md:h-[340px]"
          style={{ borderRadius: "var(--ak-hjorne-md)", overflow: "hidden" }}
        >
          <Image
            src={`${FOTO}AK-Golf-Academy-24.jpg`}
            alt="Spiller slår ballen opp av gresset, jord og ball i luften"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}

export function JuniorAK() {
  return (
    <>
      <JuniorHero />
      <Forelderen />
      <Gruppene />
      <JuniorSporsmal />
      <JuniorAvslutning />
    </>
  );
}
