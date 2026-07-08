/**
 * Foreldreportal · /forelder/innstillinger — mobil-first (430px).
 *
 * Konto, varsler og personvern for forelder-rollen. Viser ekte bruker-info fra
 * Supabase Auth + Prisma User, antall koblede barn (samtykke-kontekst), og
 * varseltyper en forelder mottar. Varselbrytere kobles på senere — vist som
 * read-only status frem til da.
 *
 * Ekte data: requirePortalUser (User) + hentBarnForForelder. DS-tokens +
 * athletic-primitiver. Ingen hex, ingen emoji (kun lucide). Norsk bokmål.
 */

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Lock,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { ForelderHero } from "@/components/forelder/forelder-hero";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticBadge } from "@/components/athletic";

export const dynamic = "force-dynamic";

// Varseltyper en forelder mottar (per e-post inntil app-varsler kobles på).
const VARSEL_TYPER = [
  { tittel: "Ukerapport", beskrivelse: "Sammendrag av treningsuken hver fredag" },
  { tittel: "Booking", beskrivelse: "Når en time bookes, endres eller avlyses" },
  { tittel: "Faktura", beskrivelse: "Nye fakturaer og forfalte betalinger" },
  { tittel: "Samtykke", beskrivelse: "Når en godkjenning fra deg trengs" },
];

export default async function ForelderInnstillinger() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  const initials =
    user.name
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??";

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
      <ForelderHero
        eyebrow="Foreldreportal · Innstillinger"
        titleLead="Konto og"
        titleItalic="varsler"
        sub="Kontaktinfo, varslingsvalg og kontosikkerhet."
        avatarInitials={initials}
        avatarUrl={user.avatarUrl}
      />

      {/* Kontaktinfo — ekte data fra Prisma */}
      <section
        aria-labelledby="kontakt-overskrift"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="kontakt-overskrift"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground"
          >
            <UserIcon
              className="h-3.5 w-3.5 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
            Kontaktinformasjon
          </h2>
          <Link
            href="/portal/meg"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
          >
            Rediger
          </Link>
        </div>
        <dl className="divide-y divide-border">
          <InfoRad icon={UserIcon} label="Navn">
            <span className="font-medium text-foreground">{user.name}</span>
          </InfoRad>
          <InfoRad icon={Mail} label="E-post">
            <span className="font-medium text-foreground">{user.email}</span>
          </InfoRad>
          <InfoRad icon={Phone} label="Telefon">
            <span className={user.phone ? "font-medium text-foreground" : "text-muted-foreground"}>
              {user.phone ?? "Ikke registrert"}
            </span>
          </InfoRad>
        </dl>
      </section>

      {/* Koblede barn — samtykke-kontekst */}
      <section
        aria-labelledby="barn-overskrift"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="barn-overskrift"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground"
          >
            <Users
              className="h-3.5 w-3.5 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
            Koblede barn
          </h2>
          <Link
            href="/forelder/barn"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
          >
            Se alle
          </Link>
        </div>
        {barn.length === 0 ? (
          <p className="px-4 py-4 text-[13px] text-muted-foreground">
            Ingen barn koblet ennå. Be spilleren sende en invitasjon fra sin
            profil.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {barn.map((b) => (
              <li
                key={b.child.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold tracking-[-0.005em] text-foreground">
                    {b.child.name}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    {b.relationship}
                  </div>
                </div>
                <AthleticBadge variant="ok">Koblet</AthleticBadge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Varsler — typer du mottar (brytere kobles på senere) */}
      <section
        aria-labelledby="varsler-overskrift"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="varsler-overskrift"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground"
          >
            <Bell
              className="h-3.5 w-3.5 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
            Varsler
          </h2>
          <AthleticBadge variant="neutral">På e-post</AthleticBadge>
        </div>
        <ul className="divide-y divide-border">
          {VARSEL_TYPER.map((v) => (
            <li
              key={v.tittel}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-foreground">
                  {v.tittel}
                </div>
                <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                  {v.beskrivelse}
                </div>
              </div>
              <span className="mt-0.5 shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-success">
                På
              </span>
            </li>
          ))}
        </ul>
        <p className="border-t border-border px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
          Varslene sendes til e-posten din. Individuelle varselbrytere og
          push-varsler kommer i en senere versjon.
        </p>
      </section>

      {/* Konto-seksjon */}
      <section
        aria-labelledby="konto-overskrift"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <h2
          id="konto-overskrift"
          className="border-b border-border px-4 py-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground"
        >
          Konto
        </h2>
        <ul className="divide-y divide-border">
          <KontoLenke
            href="/portal/meg/innstillinger/sikkerhet"
            icon={Lock}
            tittel="Endre passord"
            undertekst="Via Supabase Auth"
          />
          <KontoLenke
            href="/portal/meg/innstillinger/sikkerhet"
            icon={ShieldCheck}
            tittel="To-faktor-autentisering"
            undertekst="Ikke aktivert"
          />
          <li>
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-[13px] text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex items-center gap-2.5">
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                <span className="font-semibold">Logg ut</span>
              </span>
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

// ── Info-rad (kontaktinfo) ────────────────────────────────────────
function InfoRad({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 text-[13px]">
      <dt className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

// ── Konto-lenke (passord, 2FA) ────────────────────────────────────
function KontoLenke({
  href,
  icon: Icon,
  tittel,
  undertekst,
}: {
  href: string;
  icon: typeof Lock;
  tittel: string;
  undertekst: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-[13px] transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="inline-flex items-center gap-2.5">
          <Icon
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <span>
            <span className="block font-semibold text-foreground">{tittel}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {undertekst}
            </span>
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
      </Link>
    </li>
  );
}
