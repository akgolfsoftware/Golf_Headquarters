import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
              <AkGolfLogo width={48} />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Personlig coaching og fremgang i én pakke.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Academy
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/coaching" className="text-foreground hover:text-primary">
                  Coaching
                </Link>
              </li>
              <li>
                <Link href="/treningsfilosofi" className="text-foreground hover:text-primary">
                  Slik trener vi
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-foreground hover:text-primary">
                  Book time
                </Link>
              </li>
              <li>
                <Link href="/playerhq" className="text-foreground hover:text-primary">
                  PlayerHQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Selskap
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/om-oss" className="text-foreground hover:text-primary">
                  Om oss
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Kontakt
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="mailto:post@akgolf.no"
                  className="text-foreground hover:text-primary"
                >
                  post@akgolf.no
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@akgolf.no"
                  className="text-foreground hover:text-primary"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} AK Golf Group AS · Org.nr 927 248 581</span>
          <div className="flex gap-4">
            <Link href="/personvern" className="hover:text-foreground">
              Personvern
            </Link>
            <Link href="/vilkar" className="hover:text-foreground">
              Vilkår
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
