// Foreldreportal — Okonomi. Hub-oversikt med abonnement-status + fakturaer.
// Mock-data i versjon 1 — kobles til Prisma i neste sprint.

import Link from "next/link";
import {
  CreditCard,
  Receipt,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderHero } from "@/components/forelder/forelder-hero";

export const dynamic = "force-dynamic";

type MockFaktura = {
  id: string;
  beskrivelse: string;
  barn: string;
  belop: number;
  dato: string;
  status: "betalt" | "ubetalt" | "feilet";
};

const MOCK_FAKTURAER: MockFaktura[] = [
  {
    id: "f1",
    beskrivelse: "PRO-abonnement · juni 2026",
    barn: "Markus Kristiansen",
    belop: 30000,
    dato: "1. jun 2026",
    status: "ubetalt",
  },
  {
    id: "f2",
    beskrivelse: "PRO-abonnement · mai 2026",
    barn: "Markus Kristiansen",
    belop: 30000,
    dato: "1. mai 2026",
    status: "betalt",
  },
  {
    id: "f3",
    beskrivelse: "Performance-økt · enkelttime",
    barn: "Markus Kristiansen",
    belop: 80000,
    dato: "14. apr 2026",
    status: "betalt",
  },
];

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

const ubetalte = MOCK_FAKTURAER.filter((f) => f.status === "ubetalt");
const totalBetalt = MOCK_FAKTURAER.filter((f) => f.status === "betalt").reduce(
  (s, f) => s + f.belop,
  0,
);

export default async function ForelderOkonomi() {
  await requirePortalUser({ allow: ["PARENT"] });

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Okonomi"
        titleLead="Abonnement"
        titleItalic="og betaling"
        sub="Status for abonnement, fakturaer og kommende trekk."
      />

      {/* Krever handling */}
      {ubetalte.length > 0 && (
        <section
          aria-labelledby="krever-handling"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-5"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle
              className="h-5 w-5 flex-shrink-0 text-destructive"
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="flex-1 text-sm">
              <h2 id="krever-handling" className="font-semibold">
                {ubetalte.length} ubetalt{ubetalte.length > 1 ? "e" : ""}{" "}
                faktura{ubetalte.length > 1 ? "er" : ""}
              </h2>
              <p className="mt-1 text-muted-foreground">
                Betaling forfaller snart. Se{" "}
                <Link
                  href="/forelder/fakturaer"
                  className="font-semibold text-destructive underline-offset-4 hover:underline"
                >
                  Fakturaer
                </Link>{" "}
                for detaljer.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* KPI-strip */}
      <section
        aria-label="Okonomi-statistikk"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Abonnement
          </div>
          <div className="mt-2 font-display text-2xl font-bold tracking-tight">
            PRO
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            300 kr / mnd · Markus
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Neste trekk
          </div>
          <div className="mt-2 font-display text-2xl font-bold tracking-tight tabular-nums">
            kr 300
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            15. juni 2026
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Betalt totalt
          </div>
          <div className="mt-2 font-display text-2xl font-bold tracking-tight tabular-nums">
            {ore(totalBetalt)}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Siste 12 mnd
          </div>
        </div>
      </section>

      {/* Siste fakturaer */}
      <section aria-labelledby="fakturaer-overskrift" className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="fakturaer-overskrift"
            className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight"
          >
            <Receipt
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            Siste fakturaer
          </h2>
          <Link
            href="/forelder/fakturaer"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
          >
            Se alle
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {MOCK_FAKTURAER.slice(0, 4).map((f) => {
            const betalt = f.status === "betalt";
            const feilet = f.status === "feilet";
            return (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-sm"
              >
                <div className="space-y-1">
                  <div className="font-semibold">{f.beskrivelse}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {f.barn} · {f.dato}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {ore(f.belop)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      betalt
                        ? "bg-primary/10 text-primary"
                        : feilet
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/30 text-accent-foreground"
                    }`}
                  >
                    {betalt ? (
                      <>
                        <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                        Betalt
                      </>
                    ) : feilet ? (
                      "Feilet"
                    ) : (
                      "Ubetalt"
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Lenke-kort-rad */}
      <section
        aria-label="Hurtigtilgang"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Link
          href="/forelder/fakturaer"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary">
            <Receipt
              className="h-5 w-5 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-semibold">
              Alle fakturaer
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {MOCK_FAKTURAER.length} registrert
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 flex-shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
        </Link>
        <Link
          href="/forelder"
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary">
            <TrendingUp
              className="h-5 w-5 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-semibold">
              Tilbake til oversikt
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Hjem · Foreldreportal
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 flex-shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
        </Link>
      </section>
    </div>
  );
}
