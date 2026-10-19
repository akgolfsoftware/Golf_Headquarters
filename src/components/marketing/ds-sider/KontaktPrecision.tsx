import { Akkordeon, Knapp } from "@/components/marketing/ak";
import { prisma } from "@/lib/prisma";

import { KontaktSkjema } from "./KontaktSkjema";
import { KORT, LISTE, Rad, SeksjonsHode, Seksjon, SideHode } from "./felles";

/**
 * Kontakt (/kontakt) i «AK Golf Precision Athletics». Mønster fra forsiden.
 * Adressen til golfklubben leses fra `Location`, samme rad som bookingen bruker.
 * Utelatt fra forrige versjon, fordi ingen kilde bekrefter det:
 * svartidsløftet (ikke før Jarvis er i drift), tabellen med coachenes
 * arbeidstid, «bedre pris per time» med abonnement og Mulligan-adressene
 * (de står på /mulligan, og basen har en annen adresse enn den siden).
 */

const SPORSMAL = [
  {
    tittel: "Trenger jeg medlemskap for å booke?",
    innhold: "Nei. Enkelttimer kan bookes uten medlemskap og uten konto i PlayerHQ.",
  },
  {
    tittel: "Hvor foregår timene?",
    innhold:
      "Ute på Gamle Fredrikstad GK i sesongen, og inne på Mulligan Indoor Golf med TrackMan hele året.",
  },
  {
    tittel: "Tar dere imot bedrifter?",
    innhold: "Ja. Skriv dato og antall deltakere, så lager vi et opplegg.",
  },
];

async function hentKlubbadresse(): Promise<string | null> {
  try {
    const l = await prisma.location.findFirst({
      where: { active: true, name: "Gamle Fredrikstad GK" },
      select: { address: true },
    });
    return l?.address ?? null;
  } catch {
    return null;
  }
}

export async function KontaktPrecision() {
  const klubbadresse = await hentKlubbadresse();
  return (
    <>
      <SideHode
        etikett="Kontakt"
        tittel="Skriv til oss."
        ingress="Spørsmål om coaching, juniorgruppene, PlayerHQ eller et opplegg for bedriften? Skriv noen ord, eller ring."
        knapper={
          <Knapp href="/booking" storrelse="lg">
            Book time
          </Knapp>
        }
      />

      <Seksjon id="skjema" senk>
        <div className="grid gap-ak-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="pa-card" style={{ ...KORT, padding: "var(--ak-r-5)", gap: "var(--ak-r-4)" }}>
            <SeksjonsHode etikett="Skjema" tittel="Send oss en melding" />
            <KontaktSkjema />
          </div>
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode etikett="Direkte" tittel="Ring eller send e-post" />
            <ul style={LISTE}>
              <Rad
                navn="Anders Kristiansen"
                hvor={
                  <a href="tel:+4748216540" className="ak-maalt" style={{ color: "inherit" }}>
                    +47 482 16 540
                  </a>
                }
              />
              <Rad
                navn="E-post"
                hvor={
                  <a href="mailto:post@akgolf.no" style={{ color: "inherit" }}>
                    post@akgolf.no
                  </a>
                }
              />
            </ul>
          </div>
        </div>
      </Seksjon>

      <Seksjon id="anlegg">
        <SeksjonsHode etikett="Finn fram" tittel="Der vi trener" />
        <ul style={{ ...LISTE, marginTop: "var(--ak-r-5)" }}>
          <Rad
            nr="01"
            navn={
              <>
                Gamle Fredrikstad GK
                <span style={{ display: "block", color: "var(--ak-dempet)", fontWeight: 400 }}>
                  {klubbadresse ?? "Gamle Fredrikstad"}
                </span>
              </>
            }
            hvor="Ute · sesong"
          />
          <Rad
            nr="02"
            navn={
              <>
                Mulligan Indoor Golf
                <span style={{ display: "block", color: "var(--ak-dempet)", fontWeight: 400 }}>
                  Adresser og åpningstider står på Mulligan-siden.
                </span>
              </>
            }
            hvor="Inne · hele året"
          />
        </ul>
        <div className="mt-ak-5 flex flex-wrap gap-ak-3">
          <Knapp href="/anlegg" variant="sekundaer">
            Se anleggene
          </Knapp>
          <Knapp href="/mulligan" variant="tekst">
            Mulligan Indoor Golf
          </Knapp>
        </div>
      </Seksjon>

      <Seksjon id="sporsmal" senk>
        <div style={{ maxWidth: "72ch" }}>
          <SeksjonsHode etikett="Spørsmål" tittel="Korte svar" />
          <Akkordeon poster={SPORSMAL} style={{ marginTop: "var(--ak-r-5)" }} />
          <div className="mt-ak-5">
            <Knapp href="/faq" variant="tekst">
              Flere spørsmål og svar
            </Knapp>
          </div>
        </div>
      </Seksjon>
    </>
  );
}
