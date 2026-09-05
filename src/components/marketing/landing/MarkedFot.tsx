import Link from "next/link";

import { Logo, Merkelapp } from "@/components/marketing/ak";

/**
 * MarkedFot — ENESTE footer på landingssidene.
 *
 * Fasit: `Bunn` i `designsystem/ak-golf/ui_kits/markedsside/Deler.jsx` (tre
 * kolonner: merke, Tilbud, Kontakt). Kitet har tre sider; HQ har over tjue,
 * og vilkår, personvern og cookies MÅ være nåbare — derfor en fjerde kolonne
 * «Mer» og en juridisk rad nederst. Ingenting annet er endret fra kitet.
 */

const TILBUD = [
  { href: "/coaching", tekst: "Coaching" },
  { href: "/junior", tekst: "Junior Academy" },
  { href: "/priser", tekst: "Priser" },
  { href: "/kontakt", tekst: "Kontakt" },
];

const MER = [
  { href: "/playerhq", tekst: "AK Golf HQ" },
  { href: "/mulligan", tekst: "Mulligan Indoor Golf" },
  { href: "/coacher", tekst: "Coacher" },
  { href: "/anlegg", tekst: "Anlegg" },
  { href: "/treningsfilosofi", tekst: "Slik trener vi" },
  { href: "/turneringer", tekst: "Turneringer" },
  { href: "/blogg", tekst: "Blogg" },
  { href: "/faq", tekst: "Spørsmål og svar" },
  { href: "/jobb", tekst: "Jobb hos oss" },
  { href: "/auth/login", tekst: "Logg inn" },
];

const JURIDISK = [
  { href: "/vilkar", tekst: "Vilkår" },
  { href: "/personvern", tekst: "Personvern" },
  { href: "/cookies", tekst: "Informasjonskapsler" },
];

const LENKE = {
  fontSize: "var(--ak-t-15)",
  color: "var(--ak-tekst)",
  textDecoration: "none",
} as const;

export function MarkedFot() {
  return (
    <footer style={{ borderTop: "1px solid var(--ak-linje)", background: "var(--ak-grunn)" }}>
      <div
        className="mx-auto grid gap-ak-6 px-ak-4 py-ak-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-ak-6 md:py-ak-7"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <div>
          <Logo hoyde={32} />
          <p
            style={{
              marginTop: "var(--ak-r-4)",
              fontSize: "var(--ak-t-15)",
              color: "var(--ak-dempet)",
              maxWidth: "34ch",
            }}
          >
            AK Golf Academy drives av Anders Kristiansen — golfcoach, sportslig
            ansvarlig i Gamle Fredrikstad Golfklubb og sportssjef ved WANG Toppidrett
            Fredrikstad.
          </p>
          <div className="mt-ak-4 flex flex-wrap gap-ak-2">
            <Merkelapp variant="junior">Junior Academy</Merkelapp>
            <Merkelapp variant="hq">AK Golf HQ</Merkelapp>
            <Merkelapp variant="produkt">Skarpnord</Merkelapp>
          </div>
        </div>

        <nav className="flex flex-col gap-ak-3" aria-label="Tilbud">
          <span className="ak-etikett">Tilbud</span>
          {TILBUD.map((l) => (
            <Link key={l.href} href={l.href} style={LENKE}>
              {l.tekst}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-ak-3" aria-label="Mer">
          <span className="ak-etikett">Mer</span>
          {MER.map((l) => (
            <Link key={l.href} href={l.href} style={LENKE}>
              {l.tekst}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-ak-3">
          <span className="ak-etikett">Kontakt</span>
          <a href="mailto:post@akgolf.no" className="ak-maalt" style={LENKE}>
            post@akgolf.no
          </a>
          <span style={{ fontSize: "var(--ak-t-13)", color: "var(--ak-dempet)" }}>
            Gamle Fredrikstad GK, Fredrikstad
          </span>
        </div>
      </div>

      <div
        className="mx-auto flex flex-col gap-ak-3 px-ak-4 pb-ak-5 md:flex-row md:items-center md:justify-between md:px-ak-6"
        style={{
          maxWidth: "var(--ak-sidebredde)",
          fontSize: "var(--ak-t-13)",
          color: "var(--ak-dempet)",
        }}
      >
        <span>AK Golf Group AS</span>
        <div className="flex flex-wrap gap-x-ak-5 gap-y-ak-2">
          {JURIDISK.map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "var(--ak-dempet)", textDecoration: "none" }}>
              {l.tekst}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
