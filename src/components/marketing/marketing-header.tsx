import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import { MobileMenu } from "./mobile-menu";

const NAV = [
  { href: "/coaching", label: "Coaching" },
  { href: "/treningsfilosofi", label: "Slik trener vi" },
  { href: "/playerhq", label: "PlayerHQ" },
  { href: "/turneringer", label: "Turneringer" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/om-oss", label: "Om oss" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
            <AkGolfLogo width={56} />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground active:text-foreground/80 focus-visible:underline focus-visible:outline-none"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground active:text-foreground/80 focus-visible:underline focus-visible:outline-none"
          >
            Logg inn
          </Link>
          <Link
            href="/booking"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Book tid
          </Link>
        </div>
      </div>
    </header>
  );
}
