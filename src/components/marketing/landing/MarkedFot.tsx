import Image from "next/image";
import Link from "next/link";

/**
 * MarkedFot — ENESTE footer på landingssidene.
 *
 * Fasit: `Footer` i ak-golf-website `app/layout.tsx`. Fasiten har tre
 * kolonner og tre utforsk-lenker fordi den bare har tre sider. HQ har over
 * tjue, og de lovpålagte (vilkår, personvern, cookies) MÅ være nåbare — så
 * kolonne to er delt i «Utforsk» og «Mer», og en juridisk rad ligger nederst.
 * Ingenting annet er endret fra fasiten.
 */

const UTFORSK = [
  { href: "/coaching", label: "Coaching" },
  { href: "/playerhq", label: "AK Golf HQ" },
  { href: "/mulligan", label: "Mulligan Indoor Golf" },
  { href: "/junior", label: "Junior" },
  { href: "/priser", label: "Priser" },
];

const MER = [
  { href: "/coacher", label: "Coacher" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/treningsfilosofi", label: "Slik trener vi" },
  { href: "/cases", label: "Resultater" },
  { href: "/turneringer", label: "Turneringer" },
  { href: "/blogg", label: "Blogg" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/faq", label: "Spørsmål og svar" },
  { href: "/jobb", label: "Jobb hos oss" },
];

const JURIDISK = [
  { href: "/vilkar", label: "Vilkår" },
  { href: "/personvern", label: "Personvern" },
  { href: "/cookies", label: "Informasjonskapsler" },
  { href: "/kontakt", label: "Kontakt" },
];

export function MarkedFot() {
  return (
    <footer className="border-t border-mk-border bg-mk-soft">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/brand/logo/ak-golf-logo-on-paper.svg"
                alt="AK Golf"
                width={28}
                height={24}
              />
              <span className="text-sm font-semibold">AK Golf Academy</span>
            </div>
            <p className="mt-4 max-w-xs font-mk-serif text-sm leading-relaxed text-mk-muted">
              Coaching, plattform og fasiliteter under samme tak — bygget på
              måling, ikke synsing.
            </p>
          </div>

          <div className="text-sm">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-mk-muted">
              Utforsk
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {UTFORSK.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-mk-muted transition-colors hover:text-mk-fg"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-sm">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-mk-muted">
              Mer
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {MER.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-mk-muted transition-colors hover:text-mk-fg"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-sm">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-mk-muted">
              Kontakt
            </p>
            <div className="mt-4 flex flex-col gap-3 text-mk-muted">
              <a
                href="mailto:akgolfgroup@gmail.com"
                className="transition-colors hover:text-mk-fg"
              >
                akgolfgroup@gmail.com
              </a>
              <span>Fredrikstad, Norge</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-mk-hairline pt-6 text-xs text-mk-muted sm:flex-row sm:items-center sm:justify-between">
          <p>AK Golf Group AS</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {JURIDISK.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-mk-fg"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
