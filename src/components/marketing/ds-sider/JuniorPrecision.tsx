import { Akkordeon, Knapp } from "@/components/marketing/ak";

import { Foto, LISTE, Rad, SeksjonsHode, Seksjon, SideHode, Tekstkort } from "./felles";

/**
 * Junior (/junior) i «AK Golf Precision Athletics». Mønster fra forsiden.
 *
 * Teksten om trinnene er den publiserte (fem trinn med Knøtt). AK-stigen i
 * koden har fire trinn, med Knøtt som egen gruppe ved siden av (beslutninger.md
 * §AK-stigen har fire trinn, 22.09), men omskrivingen av denne siden venter på
 * Anders. Ingen bilder av barn: arkivet har ingen med samtykke.
 *
 * Utelatt fra forrige versjon: eksempelkortet «3 av 5 · to turneringsrunder
 * under 85». Kravet finnes ikke i koden, og foreldre kunne lest det som en regel.
 */

const TRINN = [
  {
    navn: "Mini",
    alder: "til og med 10 år",
    tekst: "Første møte med ballen. Lek, grep og balanse. Køller til lån, ingen tall ennå.",
  },
  {
    navn: "Knøtt",
    alder: "11–12 år",
    tekst: "Broen mellom lek og struktur. Første egne mål, og første måling: hvor langt går 7-jernet.",
  },
  {
    navn: "Basis",
    alder: "til og med 13 år",
    tekst: "Fast teknisk fundament. Teknikk med TrackMan, egen plan i appen, første turnering.",
  },
  {
    navn: "Utvikling",
    alder: "til og med 15 år",
    tekst: "Egen plan og egne tester. Konkurranse begynner å telle.",
  },
  {
    navn: "Elite",
    alder: "til og med 19 år",
    tekst: "Turneringsspill, periodisering og måling mot mål.",
  },
];

const FORELDER = [
  { navn: "Hva som er trent", hvor: "Øktene" },
  { navn: "Hva som er målt", hvor: "Testene" },
  { navn: "Hva som er neste steg", hvor: "Planen" },
];

const SPORSMAL = [
  {
    tittel: "Må barnet ha eget utstyr?",
    innhold: "Nei. Vi har køller til lån i alle gruppene til og med U12.",
  },
  {
    tittel: "Hva koster det?",
    innhold:
      "Gruppeplass betales per semester. Prisen står i bookingen, hentet fra samme sted som fakturaen.",
  },
  {
    tittel: "Kan jeg se hva barnet trener på?",
    innhold: "Ja. Foreldreportalen viser øktene, målingene og neste steg.",
  },
  {
    tittel: "Hva hvis barnet ikke vil konkurrere?",
    innhold:
      "Da konkurrerer det ikke. Trinnene handler om hva spilleren kan, ikke om turneringer. Turneringsspill kommer når spilleren vil.",
  },
];

export function JuniorPrecision() {
  return (
    <>
      <SideHode
        etikett="AK Golf Junior Academy"
        tittel="Barnet ditt skal vite hva det jobber med."
        ingress="AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn med navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste."
        knapper={
          <>
            <Knapp href="/kontakt" storrelse="lg">
              Meld interesse
            </Knapp>
            <Knapp href="/booking" variant="sekundaer" storrelse="lg">
              Book time
            </Knapp>
          </>
        }
      />

      <Seksjon id="trinn" senk>
        <SeksjonsHode
          etikett="Gruppene"
          tittel="Fem trinn med navn"
          ingress="Gruppene er satt etter alder og erfaring, ikke etter hvem som meldte seg først. Riktig gruppe finner vi i en samtale før oppstart."
        />
        <div className="mt-ak-5 grid gap-ak-4 sm:grid-cols-2 lg:grid-cols-5">
          {TRINN.map((t, i) => (
            <Tekstkort
              key={t.navn}
              etikett={`Trinn ${i + 1} · ${t.alder}`}
              tittel={t.navn}
              tekst={t.tekst}
            />
          ))}
        </div>
      </Seksjon>

      <Seksjon id="forelder">
        <div className="grid gap-ak-6 md:grid-cols-[0.8fr_1.2fr]">
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode
              etikett="For forelderen"
              tittel="Du slipper å spørre hvordan det går"
              ingress="Foreldreportalen viser det samme som coachen ser. Du trenger ikke vente på en melding."
            />
          </div>
          <ul style={LISTE}>
            {FORELDER.map((f, i) => (
              <Rad key={f.navn} nr={String(i + 1).padStart(2, "0")} navn={f.navn} hvor={f.hvor} />
            ))}
          </ul>
        </div>
      </Seksjon>

      <Seksjon id="sporsmal" senk>
        <div style={{ maxWidth: "72ch" }}>
          <SeksjonsHode etikett="Spørsmål" tittel="Det foreldre spør om" />
          <Akkordeon poster={SPORSMAL} apenIndeks={0} style={{ marginTop: "var(--ak-r-5)" }} />
        </div>
      </Seksjon>

      <Seksjon id="interesse">
        <div className="grid gap-ak-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode
              etikett="Kom i gang"
              tittel="Lurer du på hvilken gruppe som passer?"
              ingress="Send oss alder og litt om erfaringen, så tar vi kontakt."
            />
            <div className="mt-ak-5 flex flex-wrap gap-ak-3">
              <Knapp href="/kontakt">Meld interesse</Knapp>
            </div>
          </div>
          <Foto
            src="/brand/foto/AK-Golf-Academy-24.jpg"
            alt="Spiller slår ballen opp av gresset, jord og ball i luften"
          />
        </div>
      </Seksjon>
    </>
  );
}
