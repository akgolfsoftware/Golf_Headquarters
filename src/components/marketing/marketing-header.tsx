import Link from "next/link";

const NAV = [
  { href: "/funksjoner", label: "Funksjoner" },
  { href: "/forsta", label: "Slik fungerer det" },
  { href: "/priser", label: "Priser" },
  { href: "/blog", label: "Blogg" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight"
        >
          AK <em className="font-normal text-primary not-italic md:italic">Golf</em>
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
            href="/auth/signup"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Prøv gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
