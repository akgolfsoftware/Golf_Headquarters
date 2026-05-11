/**
 * Cookie-policy — AK Golf Group AS.
 * URL: /akgolf-cookies-demo
 *
 * 4 kategorier med on/off-toggle-mockup, "Aksepter alle" og "Bare nødvendige",
 * og full liste over spesifikke cookies i tabell.
 */
import Link from "next/link";
import { Check, Cookie, Settings2 } from "lucide-react";
import {
  MarketingFooter,
  MarketingNav,
} from "@/app/_marketing-demo/chrome";

type Category = {
  id: string;
  name: string;
  desc: string;
  required: boolean;
  on: boolean;
};

const CATEGORIES: Category[] = [
  {
    id: "necessary",
    name: "Nødvendige",
    desc: "Kreves for at nettstedet skal fungere — innlogging, handlekurv og sikkerhet. Kan ikke slås av.",
    required: true,
    on: true,
  },
  {
    id: "functional",
    name: "Funksjonelle",
    desc: "Husker dine valg som språk, tema og favoritt-coach. Forbedrer brukeropplevelsen.",
    required: false,
    on: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    desc: "Anonymisert statistikk via Plausible Analytics. Vi ser hvilke sider som er populære — aldri hvem du er.",
    required: false,
    on: false,
  },
  {
    id: "marketing",
    name: "Markedsføring",
    desc: "Personlig tilpasset markedsføring og remarketing via Meta og LinkedIn. Krever eksplisitt samtykke.",
    required: false,
    on: false,
  },
];

type CookieRow = {
  name: string;
  purpose: string;
  lifetime: string;
  provider: string;
  category: string;
};

const COOKIES: CookieRow[] = [
  {
    name: "sb-access-token",
    purpose: "Sesjonshåndtering og autentisering",
    lifetime: "1 time",
    provider: "Supabase",
    category: "Nødvendig",
  },
  {
    name: "sb-refresh-token",
    purpose: "Fornyer påloggingssesjonen",
    lifetime: "7 dager",
    provider: "Supabase",
    category: "Nødvendig",
  },
  {
    name: "cookie-consent",
    purpose: "Lagrer ditt samtykke-valg",
    lifetime: "12 måneder",
    provider: "akgolf.no",
    category: "Nødvendig",
  },
  {
    name: "theme",
    purpose: "Husker lys/mørk modus",
    lifetime: "12 måneder",
    provider: "akgolf.no",
    category: "Funksjonell",
  },
  {
    name: "preferred-coach",
    purpose: "Foreslår din vanlige coach i booking",
    lifetime: "6 måneder",
    provider: "akgolf.no",
    category: "Funksjonell",
  },
  {
    name: "_plausible_id",
    purpose: "Anonym besøksidentifikator",
    lifetime: "24 timer",
    provider: "Plausible",
    category: "Analytics",
  },
  {
    name: "_fbp",
    purpose: "Identifiserer enhet for remarketing",
    lifetime: "3 måneder",
    provider: "Meta",
    category: "Markedsføring",
  },
  {
    name: "li_at",
    purpose: "LinkedIn Insight Tag",
    lifetime: "2 år",
    provider: "LinkedIn",
    category: "Markedsføring",
  },
];

const CATEGORY_STYLE: Record<string, string> = {
  Nødvendig: "bg-primary/10 text-primary",
  Funksjonell: "bg-secondary text-foreground",
  Analytics: "bg-accent/30 text-foreground",
  Markedsføring: "bg-secondary text-muted-foreground",
};

export default function AkgolfCookiesDemo() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <Cookie className="h-3.5 w-3.5" strokeWidth={1.5} />
            Juridisk · Cookies
          </span>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.1] tracking-tight md:text-[56px]">
            <em className="font-medium italic">Cookie</em>-policy
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-muted-foreground">
            Vi bruker informasjonskapsler (cookies) for å levere tjenester og
            forbedre opplevelsen. Du har full kontroll over hvilke som lagres.
            Sist oppdatert <b className="text-foreground">5. mai 2026</b>.
          </p>
        </div>
      </section>

      {/* Innstillinger */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-4 border-b border-border p-6">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary">
              <Settings2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="font-display text-[22px] font-semibold leading-tight tracking-tight">
                Dine cookie-innstillinger
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Velg hvilke kategorier vi får bruke. Du kan oppdatere når som
                helst.
              </p>
            </div>
          </div>

          <ul className="divide-y divide-border">
            {CATEGORIES.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-[1fr_auto] items-start gap-6 p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-[16px] font-semibold tracking-tight">
                      {c.name}
                    </h3>
                    {c.required && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                        Alltid på
                      </span>
                    )}
                  </div>
                  <p className="mt-2 max-w-xl text-[14px] leading-[1.6] text-muted-foreground">
                    {c.desc}
                  </p>
                </div>

                {/* Toggle mockup */}
                <ToggleMock on={c.on} disabled={c.required} />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Bare nødvendige
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Check className="h-4 w-4" strokeWidth={1.75} />
              Aksepter alle
            </button>
          </div>
        </div>
      </section>

      {/* Tabell — spesifikke cookies */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Detaljert oversikt
        </span>
        <h2 className="mt-3 font-display text-[32px] font-semibold leading-tight tracking-tight md:text-[40px]">
          <em className="font-medium italic">Alle</em> cookies vi bruker
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-muted-foreground">
          Komplett liste over hver cookie, hva den gjør, hvor lenge den lever
          og hvilken leverandør som setter den.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Navn
                  </th>
                  <th className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Formål
                  </th>
                  <th className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Levetid
                  </th>
                  <th className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Leverandør
                  </th>
                  <th className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Kategori
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COOKIES.map((c) => (
                  <tr key={c.name}>
                    <td className="px-6 py-4 font-mono text-[13px] tabular-nums text-foreground">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-foreground/85">
                      {c.purpose}
                    </td>
                    <td className="px-6 py-4 font-mono tabular-nums text-foreground/85">
                      {c.lifetime}
                    </td>
                    <td className="px-6 py-4 text-foreground/85">
                      {c.provider}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          CATEGORY_STYLE[c.category] ??
                          "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {c.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-8">
          <h3 className="font-display text-[18px] font-semibold tracking-tight">
            Vil du vite mer?
          </h3>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-muted-foreground">
            Les vår fullstendige{" "}
            <Link
              href="/akgolf-personvern-demo"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              personvernerklæring
            </Link>{" "}
            for hvordan vi behandler personopplysninger, eller send oss en
            e-post på{" "}
            <a
              href="mailto:akgolfgroup@gmail.com"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              akgolfgroup@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function ToggleMock({
  on,
  disabled,
}: {
  on: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-primary" : "bg-secondary"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-card shadow-sm transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
}
