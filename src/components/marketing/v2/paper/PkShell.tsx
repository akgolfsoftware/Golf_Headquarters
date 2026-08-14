import Link from "next/link";
import "@/styles/paper-katalog.css";
import "@/styles/paper-side.css";

/**
 * PkShell — delt Paper marketing-skall. To nav-varianter, samme skall:
 *  - `katalog` (default): coacher, anlegg, blogg, cases, turneringer.
 *    Fasit: designsystem/paper/fase2/marketing/marketing-katalog.html.
 *  - `side`: forside, coaching, playerhq, junior, priser, om-oss,
 *    treningsfilosofi, faq, kontakt, jobb, suksess, vilkar, personvern,
 *    cookies. Fasit: .../marketing-side.html (§mnav/§footer).
 * Bruker KUN --p-*-tokens.
 *
 * Ingen egen header/nav per side. Mobil (<800px) skjuler midtre nav-lenker
 * (CSS), matcher fasitens `.mnav nav{ display:none }`-regel — ingen
 * hamburger-erstatning i denne malen.
 */

const NAV_KATALOG: { href: string; label: string }[] = [
  { href: "/coaching", label: "Coaching" },
  { href: "/coacher", label: "Coacher" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/blogg", label: "Blogg" },
  { href: "/priser", label: "Priser" },
];

const NAV_SIDE: { href: string; label: string }[] = [
  { href: "/coaching", label: "Coaching" },
  { href: "/playerhq", label: "PlayerHQ" },
  { href: "/junior", label: "Junior" },
  { href: "/priser", label: "Priser" },
  { href: "/om-oss", label: "Om oss" },
];

const FOOTER_KATALOG: { href: string; label: string }[] = [
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/blogg", label: "Blogg" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/vilkar", label: "Vilkår" },
  { href: "/personvern", label: "Personvern" },
];

const FOOTER_SIDE: { href: string; label: string }[] = [
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/jobb", label: "Jobb hos oss" },
  { href: "/blogg", label: "Blogg" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/vilkar", label: "Vilkår" },
  { href: "/personvern", label: "Personvern" },
  { href: "/cookies", label: "Cookies" },
];

export function PkShell({
  aktiv,
  children,
  dataSlug,
  variant = "katalog",
}: {
  /** Hvilken nav-lenke som er aktiv — matcher href-segmentet. */
  aktiv?: string;
  children: React.ReactNode;
  dataSlug: string;
  /** Nav-/footer-sett: katalogflatene eller de redaksjonelle sidene. */
  variant?: "katalog" | "side";
}) {
  const NAV = variant === "side" ? NAV_SIDE : NAV_KATALOG;
  const FOOTER = variant === "side" ? FOOTER_SIDE : FOOTER_KATALOG;

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
          <Link href="/booking" className="pk-btn pk-btn-sm pk-btn-ink">
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
