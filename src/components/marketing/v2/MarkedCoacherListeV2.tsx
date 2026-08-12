/**
 * AK Golf HQ — markedsside COACHER-LISTE (/coacher), Paper.
 * Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html.
 * Ekte copy speilet fra (mlegacy)/coacher/page.tsx. Data (DB-foto-berikelse)
 * hentes server-side i page.tsx og sendes inn som prop.
 */
import Image from "next/image";
import Link from "next/link";
import { PkShell } from "./paper/PkShell";
import { PkSek, PkEyebrow, PkHero, PkIng, PkSekt, PkCta, PkKat, PkKort, PkBilde, PkTag } from "./paper/PkPrimitives";

export type CoachKort = {
  slug: string;
  navn: string;
  tittel: string;
  bio: string;
  initialer: string;
  foto: string | null;
  tags: string[];
};

type Fasilitet = { type: string; navn: string; beskrivelse: string; feats: string[] };

const FASILITETER: Fasilitet[] = [
  {
    type: "Innendørs",
    navn: "Mulligan Indoor Golf",
    beskrivelse:
      "TrackMan-simulatorer i Fredrikstad og Sarpsborg. Datadrevet trening og videoanalyse, åpent hele året.",
    feats: ["TrackMan", "Videoanalyse", "Årsåpent"],
  },
  {
    type: "Utendørs",
    navn: "Gamle Fredrikstad GK",
    beskrivelse: "Driving range, nærspill-områder og bane. Hovedanlegg for AK Golf Academy gjennom sesongen.",
    feats: ["Driving range", "Nærspill", "Bane"],
  },
];

export function MarkedCoacherListeV2({ coacher }: { coacher: CoachKort[] }) {
  return (
    <PkShell aktiv="/coacher" dataSlug="marketing-coacher-liste">
      <PkSek>
        <PkEyebrow>Coachene · AK Golf Academy</PkEyebrow>
        <PkHero>Møt coachene</PkHero>
        <PkIng>To trenere som utfyller hverandre. Felles plattform, samme forventning til kvalitet og oppfølging.</PkIng>
      </PkSek>

      <PkSek notop>
        <PkKat>
          {coacher.map((c) => (
            <CoachCard key={c.slug} c={c} />
          ))}
        </PkKat>
      </PkSek>

      <PkSek notop>
        <PkEyebrow>Hvor vi trener</PkEyebrow>
        <div style={{ marginTop: 12 }}>
          <PkSekt>Anlegg &amp; fasiliteter</PkSekt>
        </div>
        <PkKat>
          {FASILITETER.map((f) => (
            <div key={f.navn} className="pk-kort pk-kort-pad">
              <PkTag>{f.type}</PkTag>
              <span className="pk-navn" style={{ marginTop: 8, fontSize: 19 }}>
                {f.navn}
              </span>
              <p>{f.beskrivelse}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {f.feats.map((x) => (
                  <PkTag key={x}>{x}</PkTag>
                ))}
              </div>
            </div>
          ))}
        </PkKat>
        <div style={{ marginTop: 18 }}>
          <PkCta href="/anlegg" ghost small>
            Se alle anlegg
          </PkCta>
        </div>
      </PkSek>

      <PkSek notop>
        <PkKort tint>
          <div
            className="pk-kort-body"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <PkSekt>Tren med oss</PkSekt>
            <p style={{ fontFamily: "var(--p-body)", fontSize: 14.5, color: "var(--p-muted)", margin: 0, maxWidth: 480 }}>
              Book en økt med Anders eller Markus. Er du usikker på hvor du bør starte, ta kontakt, så finner vi ut av det sammen.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <PkCta href="/booking" clay>
                Book en økt
              </PkCta>
              <PkCta href="/kontakt" ghost icon={null}>
                Kontakt oss
              </PkCta>
            </div>
          </div>
        </PkKort>
      </PkSek>
    </PkShell>
  );
}

function CoachCard({ c }: { c: CoachKort }) {
  const rolleKort = c.tittel.split("·")[0]?.trim() ?? c.tittel;
  return (
    <Link href={`/coacher/${c.slug}`} className="pk-kort pk-kort-hover">
      <div style={{ position: "relative", aspectRatio: "4 / 5", width: "100%", background: "var(--p-soft)" }}>
        {c.foto ? (
          <Image src={c.foto} alt={c.navn} fill sizes="(max-width: 860px) 100vw, 440px" style={{ objectFit: "cover" }} />
        ) : (
          <PkBilde label={`Portrett: ${c.navn}`} />
        )}
        <span
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            fontFamily: "var(--p-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--p-on-accent)",
            background: "var(--p-accent)",
            borderRadius: 9999,
            padding: "5px 10px",
          }}
        >
          {rolleKort}
        </span>
      </div>
      <div className="pk-kort-body">
        <span className="pk-navn">{c.navn}</span>
        <span className="pk-meta">{c.tittel}</span>
        <p>{c.bio}</p>
        {c.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {c.tags.map((tag) => (
              <PkTag key={tag} accent>
                {tag}
              </PkTag>
            ))}
          </div>
        )}
        <span className="pk-lesmer">Les mer →</span>
      </div>
    </Link>
  );
}
