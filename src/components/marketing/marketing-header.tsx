import Link from "next/link";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

const NAV = [
  { href: "/coaching", label: "Coaching" },
  { href: "/treningsfilosofi", label: "Slik trener vi" },
  { href: "/playerhq", label: "PlayerHQ" },
  { href: "/om-oss", label: "Om oss" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
          <AkGolfLogo width={56} />
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
          >
            Logg inn
          </Link>
          <Link
            href="/booking"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Book time
          </Link>
        </div>
      </div>
    </header>
  );
}
