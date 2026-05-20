import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleDot,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Junior — AK Golf Academy",
  description:
    "Golf for unge talenter. AK Golf Academy tilbyr strukturert juniortrening for U10, U14, U18 og Talent-gruppen.",
};

type Aldersgruppe = {
  gruppe: string;
  alder: string;
  krav: string;
  frekvens: string;
  sesong: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const GRUPPER: Aldersgruppe[] = [
  {
    gruppe: "U10",
    alder: "Under 10 år",
    krav: "Ingen krav — nybegynnere hjertelig velkomne",
    frekvens: "1 gang per uke",
    sesong: "Mai–september (utendørs)",
    Icon: Star,
  },
  {
    gruppe: "U14",
    alder: "Under 14 år",
    krav: "Grunnleggende golferfaring, eget sett med køller",
    frekvens: "2 ganger per uke",
    sesong: "Helårs — innendørs Mulligan om vinteren",
    Icon: Users,
  },
  {
    gruppe: "U18",
    alder: "Under 18 år",
    krav: "Handicap under 36, minimum 1 sesong med erfaring",
    frekvens: "2–3 ganger per uke",
    sesong: "Helårs med periodisert treningsplan",
    Icon: Trophy,
  },
  {
    gruppe: "Talent",
    alder: "14–18 år · Elitesatsing",
    krav: "Handicap under 10 og anbefaling fra coach",
    frekvens: "3–5 ganger per uke + turneringer",
    sesong: "Helårs med WANG Toppidrett Fredrikstad",
    Icon: Zap,
  },
];

export default function JuniorSide() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Junior
          </span>
          <h1 className="mt-4 max-w-4xl font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Golf for{" "}
            <em className="font-display font-normal italic text-primary">
              unge talenter
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Vi tror på systematisk utvikling fra tidlig alder. AK Golf Academy
            tilbyr strukturert juniortrening tilpasset hvert utviklingstrinn —
            fra de aller yngste til elitesatsing med WANG Toppidrett Fredrikstad.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <a
              href="#pamelding"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Meld på junior
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
            <Link
              href="/kontakt"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Spør oss
            </Link>
          </div>
        </div>
      </section>

      {/* Aldersgrupper */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
          Aldersgrupper
        </div>
        <h2 className="mt-6 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Fire veier inn i{" "}
          <em className="font-display font-normal italic text-primary">
            programmet
          </em>
        </h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-muted-foreground">
          Alle grupper trener etter AK Golf-pyramiden og følges opp gjennom
          PlayerHQ slik at foreldre alltid har oversikt over progresjon.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {GRUPPER.map((g) => (
            <GruppeKort key={g.gruppe} gruppe={g} />
          ))}
        </div>
      </section>

      {/* Sesongoversikt */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Sesongplan
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Hele{" "}
              <em className="font-display font-normal italic text-primary">
                året
              </em>{" "}
              i gang
            </h2>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Periode
                  </th>
                  <th className="px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Fokus
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Sted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <Sesongrad periode="Januar–april" fokus="Innendørs teknikk og fysikk" sted="Mulligan Borre" />
                <Sesongrad periode="Mai–juni" fokus="Overgang utendørs, kortspill" sted="GFGK Bossum" />
                <Sesongrad periode="Juli–august" fokus="Turneringer og runde-spilling" sted="Baner i regionen" />
                <Sesongrad periode="September–oktober" fokus="Avslutning sesong, evaluering" sted="GFGK Bossum" />
                <Sesongrad periode="November–desember" fokus="Styrke, kondisjon, individuelle mål" sted="Mulligan Borre" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Påmelding */}
      <section id="pamelding" className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Påmelding
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Klar for å{" "}
              <em className="font-display font-normal italic text-primary">
                starte?
              </em>
            </h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-muted-foreground">
              Fyll ut skjemaet så tar vi kontakt innen 1 virkedag. Vi finner
              riktig gruppe basert på alder og erfaring, og informerer om
              oppstart og pris.
            </p>
            <div className="mt-8 space-y-4 text-[14px] text-muted-foreground">
              <InfoRad label="Sesongstart" verdi="1. mai (utendørs)" />
              <InfoRad label="Vinterstudio" verdi="1. november (innendørs)" />
              <InfoRad label="Påmeldingsfrist" verdi="Løpende — plass til det er fullt" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 md:p-10">
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              Interessen-skjema
            </h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
              Vi tar kontakt innen 1 virkedag.
            </p>
            <PameldingForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function GruppeKort({ gruppe: g }: { gruppe: Aldersgruppe }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            {g.alder}
          </span>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {g.gruppe}
          </h3>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
          <g.Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
      </div>

      <div className="mt-8 space-y-4 border-t border-border pt-6">
        <GruppeRad label="Krav" verdi={g.krav} />
        <GruppeRad label="Treningsfrekvens" verdi={g.frekvens} />
        <GruppeRad label="Sesong" verdi={g.sesong} />
      </div>

      <div className="mt-8">
        <a
          href="#pamelding"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:gap-4"
        >
          Meld på til {g.gruppe}
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </a>
      </div>
    </article>
  );
}

function GruppeRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="text-[14px] text-foreground">{verdi}</span>
    </div>
  );
}

function Sesongrad({
  periode,
  fokus,
  sted,
}: {
  periode: string;
  fokus: string;
  sted: string;
}) {
  return (
    <tr>
      <td className="px-6 py-4 font-mono text-[13px] font-medium tabular-nums text-foreground">
        {periode}
      </td>
      <td className="px-6 py-4 text-[14px] text-muted-foreground">{fokus}</td>
      <td className="px-6 py-4 text-right text-[13px] text-muted-foreground">
        {sted}
      </td>
    </tr>
  );
}

function InfoRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="text-[14px] text-foreground">{verdi}</span>
    </div>
  );
}

async function sendPamelding(formData: FormData) {
  "use server";
  const navn = formData.get("navn");
  const alder = formData.get("alder");
  const epost = formData.get("epost");
  console.log("[Junior påmelding]", { navn, alder, epost });
}

function PameldingForm() {
  return (
    <form action={sendPamelding} className="mt-8 space-y-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="navn"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Navn på junior
        </label>
        <input
          id="navn"
          name="navn"
          type="text"
          required
          placeholder="Fornavn Etternavn"
          className="rounded-md border border-input bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="alder"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Alder
        </label>
        <input
          id="alder"
          name="alder"
          type="number"
          required
          min={5}
          max={18}
          placeholder="F.eks. 12"
          className="rounded-md border border-input bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="epost"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          E-post (foresatte)
        </label>
        <input
          id="epost"
          name="epost"
          type="email"
          required
          placeholder="din@epost.no"
          className="rounded-md border border-input bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Send påmelding
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </form>
  );
}
