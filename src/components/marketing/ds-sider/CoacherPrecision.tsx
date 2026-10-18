import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Knapp } from "@/components/marketing/ak";

import { KORT, SeksjonsHode, Seksjon, SideHode, Tekstkort } from "./felles";

/**
 * Coachene (/coacher) i «AK Golf Precision Athletics». Hvem som vises, er den
 * kuraterte lista i page.tsx; basen beriker bare profilbildet.
 * Filterpillene fra forrige versjon er tatt ut: med to coacher filtrerer de ingenting.
 */

export type CoachKort = {
  slug: string;
  navn: string;
  tittel: string;
  bio: string;
  initialer: string;
  foto: string | null;
  tags: string[];
};

const ANLEGG = [
  {
    etikett: "Innendørs",
    tittel: "Mulligan Indoor Golf",
    tekst: "TrackMan-simulatorer i Fredrikstad. Trening og videoanalyse hele året.",
  },
  {
    etikett: "Utendørs",
    tittel: "Gamle Fredrikstad GK",
    tekst: "Driving range, nærspillområder og bane gjennom sesongen.",
  },
];

function Coachkort({ c }: { c: CoachKort }) {
  return (
    <Link
      href={`/coacher/${c.slug}`}
      className="pa-card ak-trykk ak-kort-trykk"
      style={{ ...KORT, padding: 0, overflow: "hidden", textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          background: "var(--ak-grunn-senk)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {c.foto ? (
          <Image
            src={c.foto}
            alt={c.navn}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            style={{ objectFit: "cover", objectPosition: "50% 30%" }}
          />
        ) : (
          <span
            aria-hidden="true"
            className="ak-maalt"
            style={{ font: "var(--type-title-l)", color: "var(--ak-svak)" }}
          >
            {c.initialer}
          </span>
        )}
      </div>
      <div className="flex flex-col" style={{ padding: "var(--ak-r-5)", gap: "var(--ak-r-2)" }}>
        <span className="ak-etikett">{c.tittel}</span>
        <span style={{ font: "var(--type-title-m)" }}>{c.navn}</span>
        <span style={{ color: "var(--ak-dempet)" }}>{c.bio}</span>
        {c.tags.length > 0 ? (
          <span className="flex flex-wrap gap-ak-2" style={{ marginTop: "var(--ak-r-2)" }}>
            {c.tags.map((t) => (
              <span
                key={t}
                className="ak-etikett"
                style={{
                  border: "1px solid var(--ak-linje)",
                  borderRadius: "var(--radius)",
                  padding: "2px var(--ak-r-2)",
                }}
              >
                {t}
              </span>
            ))}
          </span>
        ) : null}
        <span
          className="inline-flex items-center gap-ak-2"
          style={{ marginTop: "var(--ak-r-2)", fontWeight: 600 }}
        >
          Les mer <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function CoacherPrecision({ coacher }: { coacher: CoachKort[] }) {
  return (
    <>
      <SideHode
        etikett="Coachene · AK Golf Academy"
        tittel="Møt coachene"
        ingress="To trenere som utfyller hverandre. Samme plattform, samme krav til oppfølging."
        knapper={
          <Knapp href="/booking" storrelse="lg">
            Book time
          </Knapp>
        }
      />

      <Seksjon id="coacher">
        <div className="grid gap-ak-4 md:grid-cols-2">
          {coacher.map((c) => (
            <Coachkort key={c.slug} c={c} />
          ))}
        </div>
      </Seksjon>

      <Seksjon id="anlegg" senk>
        <SeksjonsHode etikett="Hvor vi trener" tittel="Anlegg" />
        <div className="mt-ak-5 grid gap-ak-4 md:grid-cols-2">
          {ANLEGG.map((a) => (
            <Tekstkort key={a.tittel} etikett={a.etikett} tittel={a.tittel} tekst={a.tekst} />
          ))}
        </div>
        <div className="mt-ak-5">
          <Knapp href="/anlegg" variant="sekundaer">
            Se alle anlegg
          </Knapp>
        </div>
      </Seksjon>

      <Seksjon id="book">
        <SeksjonsHode
          etikett="Tren med oss"
          tittel="Book en time med Anders eller Markus"
          ingress="Usikker på hvor du bør starte? Skriv til oss, så finner vi ut av det."
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
