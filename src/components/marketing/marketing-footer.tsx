import Link from "next/link";
import { LeadForm } from "./lead-form";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 rounded-2xl bg-primary/5 p-8 text-center">
          <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Få</em> ukentlige tips
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Korte, konkrete artikler om trening, statistikk og metode.
          </p>
          <div className="mx-auto mt-5 max-w-md">
            <LeadForm
              source="newsletter"
              cta="Meld på"
              takkemelding="Du er påmeldt — første tips kommer denne uken."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight"
            >
              AK <em className="font-normal text-primary not-italic md:italic">Golf</em>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Coaching, plan og fremgang i én app.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Produkt
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/funksjoner" className="text-foreground hover:text-primary">
                  Funksjoner
                </Link>
              </li>
              <li>
                <Link href="/priser" className="text-foreground hover:text-primary">
                  Priser
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-foreground hover:text-primary">
                  Prøv gratis
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
              <li>
                <Link href="/blog" className="text-foreground hover:text-primary">
                  Blogg
                </Link>
              </li>
              <li>
                <Link href="/for-klubber" className="text-foreground hover:text-primary">
                  For klubber
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
                  href="mailto:hei@akgolf.no"
                  className="text-foreground hover:text-primary"
                >
                  hei@akgolf.no
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
          <span>© {new Date().getFullYear()} AK Golf Group AS</span>
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
