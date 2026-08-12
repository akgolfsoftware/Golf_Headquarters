import Link from "next/link";
import "@/styles/paper-katalog.css";

/**
 * PkShell — delt Paper marketing-skall for katalog-flatene (coacher, anlegg,
 * blogg, cases, turneringer). Fasit: designsystem/paper/fase2/marketing/
 * marketing-katalog.html (§mnav/§footer). Bruker KUN --p-*-tokens.
 *
 * Ingen egen header/nav per side — dette er «marketing-shell»-en for
 * katalog-flatene. Mobil (<800px) skjuler midtre nav-lenker (CSS), matcher
 * fasitens `.mnav nav{ display:none }`-regel — ingen hamburger-erstatning
 * i denne malen.
 */

const NAV: { href: string; label: string }[] = [
  { href: "/coaching", label: "Coaching" },
  { href: "/coacher", label: "Coacher" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/blogg", label: "Blogg" },
  { href: "/priser", label: "Priser" },
];

const FOOTER: { href: string; label: string }[] = [
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/blogg", label: "Blogg" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/vilkar", label: "Vilkår" },
  { href: "/personvern", label: "Personvern" },
];

export function PkShell({
  aktiv,
  children,
  dataSlug,
}: {
  /** Hvilken nav-lenke som er aktiv — matcher href-segmentet. */
  aktiv?: string;
  children: React.ReactNode;
  dataSlug: string;
}) {
  return (
    <div className="pk-page" data-paper-slug={dataSlug}>
      <header className="pk-nav">
        <Link href="/" aria-label="AK Golf, hjem" className="pk-nav-logo">
          AK Golf<span>.</span>
        </Link>
        <nav className="pk-nav-links" aria-label="Hovedmeny">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={aktiv === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="pk-nav-right">
          <Link href="/auth/login" className="pk-btn pk-btn-sm">
            Logg inn
          </Link>
          <Link href="/booking" className="pk-btn pk-btn-sm pk-btn-clay">
            Bestill time
          </Link>
        </div>
      </header>

      <main id="innhold">{children}</main>

      <footer className="pk-footer">
        <div className="pk-wrap">
          <div className="pk-lenker">
            {FOOTER.map((f) => (
              <Link key={f.label} href={f.href}>
                {f.label}
              </Link>
            ))}
          </div>
          <p style={{ margin: 0 }}>AK Golf Group AS · Fredrikstad · org. 923 456 789</p>
        </div>
      </footer>
    </div>
  );
}
