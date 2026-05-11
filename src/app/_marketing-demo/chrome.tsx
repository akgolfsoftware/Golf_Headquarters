/**
 * Felles navbar + footer for /akgolf-*-demo marketing-pages.
 * Server component. Bruker semantiske tokens + Lucide.
 */
import Link from "next/link";
import {
  AtSign,
  Briefcase,
  Camera,
  Flag,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";

// lucide-react har ikke Instagram/Facebook/Linkedin som dedikerte brand-ikoner
// i denne versjonen — vi bruker semantisk like alternativer (Camera = Instagram,
// AtSign = social/Facebook, Briefcase = LinkedIn/profesjonell).
const Instagram = Camera;
const Facebook = AtSign;
const Linkedin = Briefcase;

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Forside", href: "/akgolf-forside-demo" },
  { label: "Tjenester", href: "/akgolf-tjenester-demo" },
  { label: "Priser", href: "/akgolf-priser-demo" },
  { label: "Om", href: "/akgolf-om-demo" },
  { label: "Kontakt", href: "/akgolf-kontakt-demo" },
];

export function MarketingNav({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/akgolf-forside-demo"
          className="group inline-flex items-center gap-2"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Flag className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="font-display text-[18px] font-semibold tracking-tight">
            AK Golf
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
          >
            Logg inn
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book økt
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <Flag className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="font-display text-[18px] font-semibold tracking-tight">
                AK Golf
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-[1.6] text-muted-foreground">
              Personlig coaching, treningsplaner og fremgang for golfere i alle
              aldre. Drevet av Anders Kristiansen, PGA Class A Pro.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <SocialIcon Icon={Instagram} />
              <SocialIcon Icon={Facebook} />
              <SocialIcon Icon={Linkedin} />
            </div>
          </div>

          <FooterCol
            title="Tjenester"
            links={[
              { label: "1:1 Coaching", href: "/akgolf-tjenester-demo" },
              { label: "Trackman-sesjon", href: "/akgolf-tjenester-demo" },
              { label: "Junior-program", href: "/akgolf-tjenester-demo" },
              { label: "Gruppetrening", href: "/akgolf-tjenester-demo" },
              { label: "Bedriftsevent", href: "/akgolf-tjenester-demo" },
            ]}
          />
          <FooterCol
            title="Selskap"
            links={[
              { label: "Om oss", href: "/akgolf-om-demo" },
              { label: "Anlegg", href: "/akgolf-om-demo" },
              { label: "Partnere", href: "/akgolf-om-demo" },
              { label: "Karriere", href: "/akgolf-om-demo" },
            ]}
          />
          <FooterCol
            title="Ressurser"
            links={[
              { label: "Priser", href: "/akgolf-priser-demo" },
              { label: "Vilkår", href: "#" },
              { label: "Personvern", href: "#" },
              { label: "Kontakt", href: "/akgolf-kontakt-demo" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-[13px] text-muted-foreground md:flex-row md:items-center">
          <p>© 2026 AK Golf Group AS · Org.nr 932 145 678 · Fredrikstad</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.10em]">
            akgolf.no
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-[14px] text-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  Icon,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <Link
      href="#"
      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </Link>
  );
}

export function MarketingContactBlocks() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <ContactCard
        Icon={Phone}
        label="Telefon"
        primary="+47 482 16 540"
        secondary="Hverdager 09–17"
      />
      <ContactCard
        Icon={Mail}
        label="E-post"
        primary="hei@akgolf.no"
        secondary="Svar innen 24 timer"
      />
      <ContactCard
        Icon={MapPin}
        label="Besøk oss"
        primary="Mulligan Indoor, Borre"
        secondary="GFGK Bossum, Fredrikstad"
      />
    </div>
  );
}

function ContactCard({
  Icon,
  label,
  primary,
  secondary,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-foreground">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h4 className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </h4>
      <p className="mt-2 font-display text-[20px] font-semibold tracking-tight">
        {primary}
      </p>
      <p className="mt-1 text-[14px] text-muted-foreground">{secondary}</p>
    </div>
  );
}
