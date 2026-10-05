import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Knapp } from "@/components/marketing/ak";

/**
 * Forsiden (akgolf.no) i «AK Golf Precision Athletics» — Anders 04.10.2026.
 * Erstatter den mørke, filmatiske forsiden (canvas-rull, partikler, filmkorn).
 * Teksten er den samme; bare utseendet er byttet. Lyst tema, grafitt
 * primærknapp, kort med radius 8 og hårlinje, ingen skygger.
 *
 * Utelatt: sitatpanelet («SITAT TIL GODKJENNING») — merkereglene tillater ikke
 * sitater, og det var aldri godkjent.
 */

const FOTO = "/images/akgolf/";

const MAATER = [
  { nr: "01", navn: "Enkelttime på bane", hvor: "Fredrikstad" },
  { nr: "02", navn: "Enkelttime i studio", hvor: "Innendørs · helår" },
  { nr: "03", navn: "Gruppetrening", hvor: "Fast gruppe" },
  { nr: "04", navn: "Foreldresamtale og veiledning", hvor: "For juniorforeldre" },
  { nr: "05", navn: "Bedrift og firmaturer", hvor: "På forespørsel" },
];

const AKADEMIET = [
  { navn: "Helårsplan med fast trener", hvor: "Junior og voksen" },
  { navn: "Player HQ inkludert", hvor: "Uten tillegg" },
  { navn: "Opptak etter prøvetime", hvor: "Løpende" },
];

const PLAYERHQ = [
  { tittel: "I dag", tekst: "Dagens økt, klar når du våkner." },
  { tittel: "Plan", tekst: "Uken framover. Lagret er ikke delt." },
  { tittel: "Analyse", tekst: "Det vi har målt, ikke det vi tror." },
  { tittel: "Meg", tekst: "Din historikk, dine mål." },
];

const ARKIV = [
  "AK-Golf-Academy-35.webp",
  "AK-Golf-Academy-34.webp",
  "AK-Golf-Academy-31.webp",
  "AK-Golf-Academy-44.webp",
  "AK-Golf-Academy-33.webp",
  "AK-Golf-Academy-30.webp",
];

const WRAP = "mx-auto px-ak-4 md:px-ak-6";
const WRAP_STIL = { maxWidth: "var(--ak-sidebredde)" } as const;
const H2 = {
  font: "var(--type-title-l)",
  fontSize: "var(--ak-t-seksjon)",
  margin: "var(--ak-r-3) 0",
} as const;
const KORTLENKE = {
  padding: "var(--ak-r-5)",
  textDecoration: "none",
  color: "inherit",
  gap: "var(--ak-r-2)",
} as const;

function Rad({ nr, navn, hvor }: { nr: string; navn: string; hvor: string }) {
  return (
    <li
      className="flex flex-wrap items-baseline gap-x-ak-4 gap-y-ak-1 py-ak-3"
      style={{ borderTop: "1px solid var(--ak-linje)", minWidth: 0 }}
    >
      <span
        className="ak-maalt"
        style={{ width: 28, color: "var(--ak-svak)", fontSize: "var(--ak-t-13)" }}
      >
        {nr}
      </span>
      <span style={{ flex: "1 1 220px", minWidth: 0, fontWeight: 500 }}>{navn}</span>
      <span className="ak-etikett">{hvor}</span>
    </li>
  );
}

export function ForsidePrecision() {
  return (
    <>
      {/* Hero */}
      <section className="py-ak-8 md:py-ak-9">
        <div
          className={`${WRAP} grid gap-ak-6 md:grid-cols-[1.1fr_0.9fr] md:items-center`}
          style={WRAP_STIL}
        >
          <div style={{ minWidth: 0 }}>
            <span className="ak-etikett">Fredrikstad · coaching siden 2018</span>
            <h1
              style={{
                font: "var(--type-display)",
                fontSize: "var(--ak-t-hero)",
                letterSpacing: "var(--tracking-display)",
                color: "var(--ak-tekst)",
                margin: "var(--ak-r-3) 0 var(--ak-r-4)",
              }}
            >
              Bedre golf, over tid.
            </h1>
            <p style={{ fontSize: "var(--ak-t-21)", color: "var(--ak-dempet)", maxWidth: "46ch" }}>
              Coaching med Anders Kristiansen — på bane, i studio og i gruppe. Ingen hurtigkur,
              ingen mirakelgrep.
            </p>
            <div className="mt-ak-5 flex flex-wrap gap-ak-3">
              <Knapp href="/booking" storrelse="lg">
                Book time
              </Knapp>
              <Knapp href="/playerhq" variant="sekundaer" storrelse="lg">
                Se Player HQ
              </Knapp>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 3",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              border: "1px solid var(--ak-linje)",
            }}
          >
            <Image
              src={`${FOTO}hero-bunker-shot.jpg`}
              alt="AK Golf — slag fra bunker"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              style={{ objectFit: "cover", objectPosition: "40% 58%" }}
            />
          </div>
        </div>

        <div className={`${WRAP} mt-ak-6 grid gap-ak-4 md:grid-cols-2`} style={WRAP_STIL}>
          <Link href="/booking" className="pa-card ak-trykk ak-kort-trykk" style={KORTLENKE}>
            <span className="ak-etikett">01</span>
            <span style={{ font: "var(--type-title-m)" }}>Coaching</span>
            <span style={{ color: "var(--ak-dempet)" }}>
              Enkelttime på bane eller i studio. Gruppetrening. Foreldresamtale.
            </span>
            <span
              className="inline-flex items-center gap-ak-2"
              style={{ marginTop: "var(--ak-r-2)", fontWeight: 600 }}
            >
              Book time <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
          <Link href="/playerhq" className="pa-card ak-trykk ak-kort-trykk" style={KORTLENKE}>
            <span className="ak-etikett">02</span>
            <span style={{ font: "var(--type-title-m)" }}>Player HQ</span>
            <span style={{ color: "var(--ak-dempet)" }}>
              Appen for deg som trener videre mellom timene.
            </span>
            <span
              className="inline-flex items-center gap-ak-2"
              style={{ marginTop: "var(--ak-r-2)", fontWeight: 600 }}
            >
              299 kr / mnd <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      {/* Coaching */}
      <section
        id="coaching"
        className="py-ak-8 md:py-ak-9"
        style={{ background: "var(--ak-grunn-senk)" }}
      >
        <div className={`${WRAP} grid gap-ak-6 md:grid-cols-[0.8fr_1.2fr]`} style={WRAP_STIL}>
          <div style={{ minWidth: 0 }}>
            <span className="ak-etikett">Coaching</span>
            <h2 style={H2}>Fem måter å jobbe sammen</h2>
            <p style={{ color: "var(--ak-dempet)", maxWidth: "40ch" }}>
              Alt starter med en time. Hva som følger etter den, bestemmer vi når vi vet hva du
              trenger.
            </p>
            <div className="mt-ak-5 flex flex-wrap items-center gap-ak-3">
              <Knapp href="/booking">Book en time</Knapp>
              <Knapp href="/priser" variant="tekst">
                Se priser
              </Knapp>
            </div>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              minWidth: 0,
              borderBottom: "1px solid var(--ak-linje)",
            }}
          >
            {MAATER.map((m) => (
              <Rad key={m.nr} {...m} />
            ))}
          </ul>
        </div>
      </section>

      {/* Player HQ */}
      <section id="playerhq" className="py-ak-8 md:py-ak-9">
        <div className={WRAP} style={WRAP_STIL}>
          <span className="ak-etikett">Player HQ · 299 kr/mnd</span>
          <h2 style={H2}>Appen mellom timene</h2>
          <p style={{ color: "var(--ak-dempet)", maxWidth: "52ch" }}>
            For satsende juniorer og for voksne som vil bli bedre. Samme app, samme plan, ulik
            mengde.
          </p>
          <div className="mt-ak-5 grid gap-ak-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLAYERHQ.map((p) => (
              <div
                key={p.tittel}
                className="pa-card"
                style={{ padding: "var(--ak-r-4)", gap: "var(--ak-r-2)" }}
              >
                <span style={{ font: "var(--type-title-s)" }}>{p.tittel}</span>
                <span style={{ color: "var(--ak-dempet)", fontSize: "var(--ak-t-15)" }}>
                  {p.tekst}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-ak-5">
            <Knapp href="/playerhq" variant="sekundaer">
              Se Player HQ
            </Knapp>
          </div>
        </div>
      </section>

      {/* Akademiet */}
      <section className="py-ak-8 md:py-ak-9" style={{ background: "var(--ak-grunn-senk)" }}>
        <div className={`${WRAP} grid gap-ak-6 md:grid-cols-[0.8fr_1.2fr]`} style={WRAP_STIL}>
          <div style={{ minWidth: 0 }}>
            <span className="ak-etikett">Akademiet</span>
            <h2 style={H2}>For dem som vil lenger</h2>
            <p style={{ color: "var(--ak-dempet)", maxWidth: "40ch" }}>
              AK Golf Academy er det tetteste sporet: helårsplan, fast oppfølging og Player HQ
              inkludert. Få plasser, opptak etter prøvetime.
            </p>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              minWidth: 0,
              borderBottom: "1px solid var(--ak-linje)",
            }}
          >
            {AKADEMIET.map((a, i) => (
              <Rad key={a.navn} nr={String(i + 1).padStart(2, "0")} navn={a.navn} hvor={a.hvor} />
            ))}
          </ul>
        </div>
      </section>

      {/* Bildearkiv */}
      <section className="py-ak-8 md:py-ak-9">
        <div className={WRAP} style={WRAP_STIL}>
          <span className="ak-etikett">Bildearkiv</span>
          <h2 style={{ ...H2, marginBottom: "var(--ak-r-5)" }}>Fra banen og studioet</h2>
          <div className="grid grid-cols-2 gap-ak-3 md:grid-cols-3">
            {ARKIV.map((fil) => (
              <div
                key={fil}
                style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: "1px solid var(--ak-linje)",
                }}
              >
                <Image
                  src={`${FOTO}${fil}`}
                  alt="AK Golf — bane og studio"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section
        id="kontakt"
        className="py-ak-8 md:py-ak-9"
        style={{ background: "var(--ak-grunn-senk)" }}
      >
        <div className={WRAP} style={WRAP_STIL}>
          <span className="ak-etikett">Ta kontakt</span>
          <h2 style={H2}>Én time forteller mer enn ti tips.</h2>
          <p style={{ color: "var(--ak-dempet)", maxWidth: "52ch" }}>
            Skriv hva du spiller i dag og hva du vil bli bedre på.
          </p>
          <div className="mt-ak-5 flex flex-wrap gap-ak-3">
            <Knapp href="/booking">Book en time</Knapp>
            <Knapp href="/kontakt" variant="sekundaer">
              Skriv til meg
            </Knapp>
          </div>
          <p className="ak-etikett mt-ak-5">Fredrikstad · post@akgolf.no</p>
        </div>
      </section>
    </>
  );
}
