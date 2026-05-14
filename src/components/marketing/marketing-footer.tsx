import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex justify-center">
          <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
            <AkGolfLogo width={72} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Academy
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/coaching" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Coaching
                </Link>
              </li>
              <li>
                <Link href="/treningsfilosofi" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Slik trener vi
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Book time
                </Link>
              </li>
              <li>
                <Link href="/playerhq" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  PlayerHQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Selskap
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/om-oss" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/anlegg" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Anlegg
                </Link>
              </li>
              <li>
                <Link href="/coacher" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Coacher
                </Link>
              </li>
              <li>
                <Link href="/blogg" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Blogg
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Kontakt
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="mailto:post@akgolf.no"
                  className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none"
                >
                  post@akgolf.no
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@akgolf.no"
                  className="text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} AK Golf Group AS · Org.nr 927 248 581</span>
          <div className="flex gap-4">
            <Link href="/personvern" className="hover:text-foreground active:text-foreground/80 focus-visible:underline focus-visible:outline-none">
              Personvern
            </Link>
            <Link href="/vilkar" className="hover:text-foreground active:text-foreground/80 focus-visible:underline focus-visible:outline-none">
              Vilkår
            </Link>
            <Link href="/cookies" className="hover:text-foreground active:text-foreground/80 focus-visible:underline focus-visible:outline-none">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
