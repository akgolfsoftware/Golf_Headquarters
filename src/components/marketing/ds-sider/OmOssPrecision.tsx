import { Knapp } from "@/components/marketing/ak";

import { Foto, INGRESS, LISTE, Rad, SeksjonsHode, Seksjon, SideHode, Tekstkort } from "./felles";

/**
 * Om oss (/om-oss) i «AK Golf Precision Athletics». Mønster fra forsiden.
 * Utelatt fra forrige versjon: sitatet fra Anders. Merkereglene tillater ikke
 * sitater; innholdet står som vanlig tekst.
 */

const PRINSIPPER = [
  {
    tittel: "Tydelig, ikke magisk",
    tekst: "Du skal alltid vite hva vi jobber med, hvorfor, og hvordan du ser at det virker.",
  },
  {
    tittel: "Balansert, ikke tilfeldig",
    tekst:
      "AK Golf-pyramiden fordeler treningstiden mellom fysisk, teknikk, golfslag, spill og turnering.",
  },
  {
    tittel: "Målt, ikke synset",
    tekst: "PlayerHQ samler plan, runder og statistikk på ett sted. Fremgangen kan leses av.",
  },
];

const SELSKAP = [
  { navn: "Org.nummer", hvor: "927 248 581" },
  { navn: "Selskap", hvor: "AK Golf Group AS, Fredrikstad" },
  { navn: "E-post", hvor: "post@akgolf.no" },
];

export function OmOssPrecision() {
  return (
    <>
      <SideHode
        etikett="Om oss · AK Golf Academy"
        tittel="Personlig coaching, bygd på måling."
        ingress="AK Golf Academy drives av Anders Kristiansen, golfcoach og daglig leder i AK Golf Group AS. Tett oppfølging og fremgang du kan se."
        knapper={
          <>
            <Knapp href="/booking" storrelse="lg">
              Book time
            </Knapp>
            <Knapp href="/coacher" variant="sekundaer" storrelse="lg">
              Møt coachene
            </Knapp>
          </>
        }
        bilde={{ src: "/images/akademy/walking-bag.jpg", alt: "Spiller går med baggen på banen" }}
      />

      <Seksjon id="prinsipper" senk>
        <SeksjonsHode etikett="Det vi står for" tittel="Tre ting vi ikke går på akkord med" />
        <div className="mt-ak-5 grid gap-ak-4 md:grid-cols-3">
          {PRINSIPPER.map((p, i) => (
            <Tekstkort
              key={p.tittel}
              etikett={String(i + 1).padStart(2, "0")}
              tittel={p.tittel}
              tekst={p.tekst}
            />
          ))}
        </div>
      </Seksjon>

      <Seksjon id="historien">
        <div className="grid gap-ak-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode etikett="Historien" tittel="Coaching som kan måles" />
            <p style={INGRESS}>
              Anders har jobbet med spillere på alle nivåer i mer enn ti år, fra klubbspillere
              til turneringsspillere. Underveis vokste det fram en praksis der personlig
              oppfølging og målbare resultater er to sider av samme arbeid.
            </p>
            <p style={{ ...INGRESS, marginTop: "var(--ak-r-4)" }}>
              Kjernen er AK Golf-pyramiden, som fordeler treningstiden over hele sesongen. Til
              daglig støttes coachingen av PlayerHQ, appen der plan, runder og statistikk ligger
              samlet.
            </p>
          </div>
          <Foto src="/images/akademy/putting-data.jpg" alt="Putting med måling" />
        </div>
      </Seksjon>

      <Seksjon id="selskapet" senk>
        <div className="grid gap-ak-6 md:grid-cols-[0.8fr_1.2fr]">
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode etikett="Selskapet" tittel="AK Golf Group AS" />
          </div>
          <ul style={LISTE}>
            {SELSKAP.map((r) => (
              <Rad key={r.navn} navn={r.navn} hvor={<span className="ak-maalt">{r.hvor}</span>} />
            ))}
          </ul>
        </div>
      </Seksjon>

      <Seksjon id="book">
        <SeksjonsHode
          etikett="Fredrikstad"
          tittel="Klar for første time?"
          ingress="Start med én time, så ser vi sammen hva som er riktig vei videre."
        />
        <div className="mt-ak-5 flex flex-wrap gap-ak-3">
          <Knapp href="/booking">Book time</Knapp>
          <Knapp href="/kontakt" variant="sekundaer">
            Skriv til oss
          </Knapp>
        </div>
      </Seksjon>
    </>
  );
}
