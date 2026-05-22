/**
 * MarketingFooter — forest-grønn footer med 4 kolonner.
 * Premium-feel matching Claude Design.
 */

import Link from "next/link";
import { Mail, MapPin, Send } from "lucide-react";
import { AkGolfLogo } from "@/components/shared/ak-golf-logo";

const ACADEMY = [
  { href: "/coaching", label: "Coaching" },
  { href: "/treningsfilosofi", label: "Slik trener vi" },
  { href: "/booking", label: "Book tid" },
  { href: "/playerhq", label: "PlayerHQ" },
  { href: "/junior", label: "Junior" },
  { href: "/priser", label: "Priser" },
];

const SELSKAP = [
  { href: "/om-oss", label: "Om oss" },
  { href: "/anlegg", label: "Anlegg" },
  { href: "/coacher", label: "Coacher" },
  { href: "/suksess", label: "Suksesshistorier" },
  { href: "/cases", label: "Cases" },
  { href: "/blogg", label: "Blogg" },
  { href: "/jobb", label: "Jobb hos oss" },
];

const SUPPORT = [
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "mailto:support@akgolf.no", label: "Support" },
];

export function MarketingFooter() {
  return (
    <footer
      className="text-white"
      style={{ background: "linear-gradient(165deg, #0F2A22 0%, #0A1F18 100%)" }}
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-32 h-80 w-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(209,248,67,0.12), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(209,248,67,0.08), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" aria-label="AK Golf — hjem" className="inline-flex">
                <AkGolfLogo width={80} variant="white" />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
                Prestasjonsgolf-coaching for ambisiøse spillere. Bygd på data,
                drevet av relasjon.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://instagram.com/akgolfacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#D1F843] hover:text-[#0A1F18]"
                >
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                </a>
                <a
                  href="mailto:post@akgolf.no"
                  aria-label="E-post"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#D1F843] hover:text-[#0A1F18]"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                </a>
              </div>
            </div>

            <FooterColumn title="Academy" links={ACADEMY} />
            <FooterColumn title="Selskap" links={SELSKAP} />
            <FooterColumn title="Support" links={SUPPORT} />
          </div>

          <div className="grid gap-6 border-b border-white/10 py-10 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Mail className="h-4 w-4 text-[#D1F843]" strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#D1F843]">
                  E-post
                </div>
                <a
                  href="mailto:post@akgolf.no"
                  className="font-display mt-1 block text-base font-medium text-white hover:text-[#D1F843]"
                >
                  post@akgolf.no
                </a>
                <div className="font-mono mt-1 text-[10px] tracking-[0.06em] text-white/50">
                  SVAR INNEN 1 VIRKEDAG
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <MapPin className="h-4 w-4 text-[#D1F843]" strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#D1F843]">
                  Anlegg
                </div>
                <Link
                  href="/anlegg"
                  className="font-display mt-1 block text-base font-medium text-white hover:text-[#D1F843]"
                >
                  Gamle Fredrikstad GK · Mulligan Indoor
                </Link>
                <div className="font-mono mt-1 text-[10px] tracking-[0.06em] text-white/50">
                  KLIKK FOR ÅPNINGSTIDER
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} AK Golf Group AS · Org.nr 927 248 581
            </span>
            <div className="flex gap-5">
              <Link
                href="/personvern"
                className="hover:text-[#D1F843] focus-visible:underline focus-visible:outline-none"
              >
                Personvern
              </Link>
              <Link
                href="/vilkar"
                className="hover:text-[#D1F843] focus-visible:underline focus-visible:outline-none"
              >
                Vilkår
              </Link>
              <Link
                href="/cookies"
                className="hover:text-[#D1F843] focus-visible:underline focus-visible:outline-none"
              >
                Cookies
              </Link>
            </div>
          </div>
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
      <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#D1F843]">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-white/80 transition hover:text-white focus-visible:underline focus-visible:outline-none"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
