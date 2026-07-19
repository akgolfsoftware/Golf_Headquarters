import Image from "next/image";
import Link from "next/link";

// Meny-rekkefølge er kanon fra design-prosjektets CLAUDE.md:
// Hjem · Starte med golf · Slik trener vi · Gruppene · Treningsplaner · Trenere ·
// Kunnskap · Kalender · Kontakt
const LENKER: { label: string; href: string; side?: AktivSide }[] = [
  { label: "Hjem", href: "/gfgk-junior", side: "hjem" },
  { label: "Starte med golf", href: "/gfgk-junior#slik-starter-du" },
  { label: "Slik trener vi", href: "/gfgk-junior#slik-trener-vi" },
  { label: "Gruppene", href: "/gfgk-junior#gruppene" },
  { label: "Treningsplaner", href: "/gfgk-junior/treningsplaner", side: "treningsplaner" },
  { label: "Trenere", href: "/gfgk-junior#trenere" },
  { label: "Kunnskap", href: "/gfgk-junior/veileder", side: "kunnskap" },
  { label: "Kalender", href: "/gfgk-junior#kalender" },
  { label: "Kontakt", href: "/gfgk-junior#kontakt" },
];

export type AktivSide = "hjem" | "treningsplaner" | "kunnskap" | "gruppe" | "kalender";

export function GfgkHeader({ aktiv }: { aktiv?: AktivSide }) {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.92)", borderColor: "var(--hairline)" }}
    >
      <div className="mx-auto flex min-h-12 max-w-[1200px] flex-wrap items-center gap-4 px-5 py-3 sm:px-7">
        <Link href="/gfgk-junior" className="flex items-center gap-3 no-underline">
          <Image
            src="/gfgk-junior/logo-mark.png"
            alt="GFGK"
            width={42}
            height={42}
            className="h-[42px] w-auto"
          />
          <span className="leading-none">
            <span className="block text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
              GFGK
            </span>
            <span
              className="block text-[17px] font-bold uppercase tracking-[0.02em]"
              style={{ color: "var(--ink)" }}
            >
              Junior & Elite
            </span>
          </span>
        </Link>
        <div className="flex-1" />
        <nav className="flex flex-wrap items-center justify-end gap-0.5 text-[14.5px] font-semibold">
          {LENKER.map((l) => {
            const erAktiv = l.side != null && l.side === aktiv;
            return (
              <Link
                key={l.label}
                href={l.href}
                className="whitespace-nowrap rounded-lg px-2.5 py-2 no-underline transition-colors"
                style={
                  erAktiv
                    ? { color: "var(--teal-700)", background: "var(--teal-100)" }
                    : { color: "var(--ink)" }
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/portal"
          className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-bold no-underline sm:inline-flex"
          style={{ color: "var(--teal-700)", background: "var(--teal-100)" }}
        >
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: "var(--gfgk-teal)" }}
          />
          Spillerportal
        </Link>
      </div>
    </header>
  );
}
