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

  // Skallet (header + footer) eies siden 20.08.2026 av
  // src/app/(marketing)/layout.tsx — MarkedNav + MarkedFot, ett skall for hele
  // marketing. PkShell er nå et rent innholdslag som bare bærer sidenes egen
  // CSS-scope (.pk-page → paper-katalog.css / paper-side.css).
  // `aktiv`, `variant` og NAV-/FOOTER-listene er beholdt til sidene er portert
  // til det nye designet, så kallene ikke må endres i samme slurk. De skal
  // slettes sammen med denne komponenten når porten er ferdig.
  void NAV;
  void FOOTER;
  void aktiv;

  return (
    <div className="pk-page pk-innhold" data-paper-slug={dataSlug}>
      <div id="innhold">{children}</div>
    </div>
  );
}
