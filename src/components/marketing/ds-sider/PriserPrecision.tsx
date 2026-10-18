import type { ReactNode } from "react";

import { Akkordeon, Knapp } from "@/components/marketing/ak";
import {
  PLAYERHQ_AAR_BESPARELSE_ORE,
  PLAYERHQ_PRIS_AAR_ORE,
  PLAYERHQ_PRIS_MND_ORE,
} from "@/lib/domain/abonnement";

import { KORT, LISTE, Rad, SeksjonsHode, Seksjon, SideHode, hentTjenester, kroner } from "./felles";

/**
 * Priser (/priser) i «AK Golf Precision Athletics».
 * - PlayerHQ-prisen leses fra `src/lib/domain/abonnement.ts`.
 * - Coachingprisene leses fra `ServiceType.priceOre`, gruppert som på BK-01.
 * - Nivåene heter Gratis og Full (ordbokas §2.5). Prøveuken er én uke med kort
 *   (BUSINESS-RULES §Abonnement, beslutninger.md §PRØVEUKE).
 */

const GRATIS = [
  "Hele testbatteriet, med resultatene over tid",
  "Logg runder og se hvor du taper slagene",
  "Book enkelttimer med coach",
];

const FULL = [
  "Treningsplan i Workbench: år, periode, måned og uke",
  "Øvelsesbanken og live-økter med tellere",
  "TrackMan-data og video",
  "Caddie, AI-hjelperen i appen",
];

const SPORSMAL = [
  {
    tittel: "Hvordan får jeg Full uten å betale for appen?",
    innhold:
      "Full følger med coaching-pakken Performance eller Performance Pro, og med gruppetrening gjennom AK Golf, for eksempel WANG eller klubbtrening.",
  },
  {
    tittel: "Hvordan virker prøveuken?",
    innhold:
      "Første gang du velger Full, får du én uke før første trekk. Du legger inn kort, og sier du ikke opp innen uken er over, går abonnementet videre.",
  },
  {
    tittel: "Kan jeg si opp når som helst?",
    innhold:
      "Ja. Abonnementet løper måned for måned uten binding, og du beholder tilgangen ut perioden du har betalt for.",
  },
  {
    tittel: "Hva er forskjellen på coaching-pakker og appen?",
    innhold:
      "Coaching-pakkene er antall timer med coach hver måned. Appen er den samme for alle med Full, uten nivåer.",
  },
  {
    tittel: "Hva skjer med dataene mine hvis jeg slutter?",
    innhold:
      "Du beholder Gratis: testbatteriet og rundene dine ligger der fortsatt. Ingenting slettes fordi abonnementet stopper.",
  },
];

function Prisliste({ rader, tom }: { rader: { slug: string; navn: string; minutter: number; pris: string }[]; tom: string }) {
  if (rader.length === 0) {
    return <p style={{ color: "var(--ak-dempet)" }}>{tom}</p>;
  }
  return (
    <ul style={LISTE}>
      {rader.map((t) => (
        <Rad
          key={t.slug}
          navn={
            <>
              {t.navn}
              {t.navn.includes(`${t.minutter} min`) ? null : (
                <span style={{ color: "var(--ak-svak)", fontWeight: 400 }}> · {t.minutter} min</span>
              )}
            </>
          }
          hvor={<span className="ak-maalt">{t.pris}</span>}
        />
      ))}
    </ul>
  );
}

function Nivakort({
  navn,
  pris,
  enhet,
  punkter,
  under,
  knapp,
}: {
  navn: string;
  pris: string;
  enhet: string;
  punkter: string[];
  under: string;
  knapp: ReactNode;
}) {
  return (
    <div className="pa-card" style={{ ...KORT, padding: "var(--ak-r-5)", gap: "var(--ak-r-3)" }}>
      <span className="ak-etikett">{navn}</span>
      <span className="ak-maalt" style={{ font: "var(--type-title-l)", fontSize: "var(--ak-t-seksjon)" }}>
        {pris} <span style={{ fontSize: "var(--ak-t-15)", color: "var(--ak-dempet)" }}>{enhet}</span>
      </span>
      <ul style={{ ...LISTE, borderBottom: 0 }}>
        {punkter.map((p) => (
          <Rad key={p} navn={p} />
        ))}
      </ul>
      <span style={{ color: "var(--ak-dempet)", fontSize: "var(--ak-t-15)" }}>{under}</span>
      <div className="mt-ak-2 flex flex-wrap gap-ak-3">{knapp}</div>
    </div>
  );
}

export async function PriserPrecision() {
  const tjenester = await hentTjenester();
  return (
    <>
      <SideHode
        etikett="Priser"
        tittel="Det du betaler for, står her."
        ingress="PlayerHQ har to nivåer: Gratis og Full. Coaching betales per time eller som fast pakke, og pakken har Full inkludert."
        knapper={
          <>
            <Knapp href="/booking" storrelse="lg">
              Book time
            </Knapp>
            <Knapp href="/auth/signup" variant="sekundaer" storrelse="lg">
              Lag gratis konto
            </Knapp>
          </>
        }
      />

      <Seksjon id="playerhq" senk>
        <SeksjonsHode etikett="PlayerHQ" tittel="Gratis og Full" />
        <div className="mt-ak-5 grid gap-ak-4 md:grid-cols-2">
          <Nivakort
            navn="Gratis"
            pris="0 kr"
            enhet="uten utløpsdato"
            punkter={GRATIS}
            under="Ingen kort, ingen prøvetid."
            knapp={
              <Knapp href="/auth/signup" variant="sekundaer">
                Lag gratis konto
              </Knapp>
            }
          />
          <Nivakort
            navn="Full"
            pris={kroner(PLAYERHQ_PRIS_MND_ORE)}
            enhet="per måned"
            punkter={FULL}
            under={`Eller ${kroner(PLAYERHQ_PRIS_AAR_ORE)} per år, ${kroner(PLAYERHQ_AAR_BESPARELSE_ORE)} spart. Første gang får du én uke før første trekk.`}
            knapp={<Knapp href="/auth/signup">Velg Full</Knapp>}
          />
        </div>
      </Seksjon>

      <Seksjon id="coaching">
        <div className="grid gap-ak-6 md:grid-cols-[0.8fr_1.2fr]">
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode
              etikett="Coaching"
              tittel="Enkelttimer"
              ingress="Én time, betalt når du booker. Ingen binding."
            />
            <div className="mt-ak-5 flex flex-wrap gap-ak-3">
              <Knapp href="/booking">Book time</Knapp>
            </div>
          </div>
          {tjenester ? (
            <Prisliste rader={tjenester.timer} tom="Ingen timer er åpne for booking akkurat nå." />
          ) : (
            <p style={{ color: "var(--ak-dempet)" }}>
              Prisene kunne ikke hentes akkurat nå. Du ser dem når du booker.
            </p>
          )}
        </div>
      </Seksjon>

      <Seksjon id="pakker" senk>
        <div className="grid gap-ak-6 md:grid-cols-[0.8fr_1.2fr]">
          <div style={{ minWidth: 0 }}>
            <SeksjonsHode
              etikett="Fast oppfølging"
              tittel="Performance og Performance Pro"
              ingress="Pakkene er antall timer med coach hver måned: to i Performance, fire i Performance Pro. PlayerHQ Full er inkludert. Pakken avtales med coachen."
            />
            <div className="mt-ak-5 flex flex-wrap gap-ak-3">
              <Knapp href="/kontakt" variant="sekundaer">
                Skriv til oss
              </Knapp>
            </div>
          </div>
          {tjenester ? (
            <Prisliste rader={tjenester.abonnement} tom="Ingen pakker er åpne akkurat nå." />
          ) : null}
        </div>
      </Seksjon>

      <Seksjon id="sporsmal">
        <div style={{ maxWidth: "72ch" }}>
          <SeksjonsHode etikett="Spørsmål" tittel="Det folk lurer på" />
          <Akkordeon poster={SPORSMAL} style={{ marginTop: "var(--ak-r-5)" }} />
        </div>
      </Seksjon>
    </>
  );
}
