/**
 * MarketingFooter — mørk forest footer med 4-kolonners lenke-grid.
 * Portet fra design-fasit (ui_kits/marketing, footer).
 */

import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

const TJENESTER = [
  { href: "/coaching", label: "Performance" },
  { href: "/coaching", label: "Performance Pro" },
  { href: "/booking", label: "Drop-in Flex" },
  { href: "/playerhq", label: "PlayerHQ" },
];

const AK_GOLF = [
  { href: "/coacher", label: "Coachene" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/#partnere", label: "Partnere" },
  { href: "/jobb", label: "Karriere" },
];

const KONTAKT = [
  { href: "mailto:post@akgolf.no", label: "post@akgolf.no" },
  { href: "/kontakt", label: "Fredrikstad · Sarpsborg" },
];

export function MarketingFooter() {
  return (
    <footer className="dark bg-background pb-8 pt-16 text-foreground/70">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="AK Golf, hjem" className="inline-flex">
              <AkGolfLogo variant="white" width={41} />
            </Link>
            <p className="mt-4 max-w-[32ch] font-mono text-[11px] leading-[1.6] text-white/60">
              Bygd på data, drevet av relasjon. Personlig coaching for golfere
              som vil ha en plan, ikke bare et tips.
            </p>
          </div>

          <FooterColumn title="Tjenester" links={TJENESTER} />
          <FooterColumn title="AK Golf" links={AK_GOLF} />
          <FooterColumn title="Kontakt" links={KONTAKT} />
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} AK Golf Group AS · Org. 927 248 581
          </span>
          <span className="flex gap-2">
            <Link
              href="/personvern"
              className="transition hover:text-accent focus-visible:underline focus-visible:outline-none"
            >
              Personvern
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/vilkar"
              className="transition hover:text-accent focus-visible:underline focus-visible:outline-none"
            >
              Vilkår
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/cookies"
              className="transition hover:text-accent focus-visible:underline focus-visible:outline-none"
            >
              Cookies
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h5 className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
        {title}
      </h5>
      <div className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <Link
            key={`${l.href}-${l.label}`}
            href={l.href}
            className="text-sm text-white/85 transition hover:text-accent focus-visible:underline focus-visible:outline-none"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
