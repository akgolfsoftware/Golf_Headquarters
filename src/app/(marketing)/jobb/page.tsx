import type { Metadata } from "next";
import {
  ArrowRight,
  Briefcase,
  CircleDot,
  MapPin,
  Mail,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Jobb hos oss i AK Golf Academy",
  description:
    "Se ledige stillinger i AK Golf Academy og AK Golf Group. Send spontansøknad eller søk på aktive utlysninger.",
};

type Stilling = {
  tittel: string;
  sted: string;
  type: string;
  beskrivelse: string;
};

const STILLINGER: Stilling[] = [
  {
    tittel: "Golfcoach (deltid)",
    sted: "Fredrikstad",
    type: "50–80 %",
    beskrivelse:
      "Vi ser etter en engasjert coach med erfaring fra juniorutvikling og/eller voksne amatørspillere. Du vil jobbe tett med Anders Kristiansen, bruke PlayerHQ til å følge opp spillere og bidra til å bygge AK Golf Academy videre.",
  },
  {
    tittel: "Junior-trener (sesong)",
    sted: "Fredrikstad",
    type: "Mai–september",
    beskrivelse:
      "Sesongjobb for deg som brenner for å utvikle unge golfspillere. Du vil lede treningsgrupper for U10–U18, samarbeide med foreldrene og rapportere progresjon gjennom sesongen. PGA-utdanning er en fordel, men ikke et krav.",
  },
];

export default function JobbSide() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Karriere
          </span>
          <h1 className="mt-4 max-w-4xl font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Bli en del av{" "}
            <em className="font-display font-normal italic text-primary">
              teamet
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-[1.6] text-muted-foreground md:text-[20px]">
            Vi er et lite team med store ambisjoner. Hos oss jobber du med de
            beste verktøyene, tett på spillerne, og med rom til å vokse som
            coach og fagperson.
          </p>
        </div>
      </section>

      {/* Verdier */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <VerdiKort
              tittel="Data-drevet coaching"
              tekst="Vi bruker Trackman, PlayerHQ og Strokes Gained-analyse i alle coachingsesjoner. Du lærer å lese og bruke data som en proff."
            />
            <VerdiKort
              tittel="Tett samarbeid"
              tekst="Teamet er lite, så du jobber direkte med Academy-ledelsen og har reell innflytelse på metoder og opplegg."
            />
            <VerdiKort
              tittel="Faglig utvikling"
              tekst="Vi støtter videreutdanning, kursing og konferanse-deltakelse. Din faglige vekst er en del av teamets vekst."
            />
          </div>
        </div>
      </section>

      {/* Aktive stillinger */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <CircleDot className="h-3 w-3 text-primary" strokeWidth={2} />
          Aktive stillinger
        </div>

        <h2 className="mt-6 font-display text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Vi søker{" "}
          <em className="font-display font-normal italic text-primary">
            deg
          </em>
        </h2>

        <div className="mt-10 space-y-6">
          {STILLINGER.map((s) => (
            <StillingsKort key={s.tittel} stilling={s} />
          ))}
        </div>
      </section>

      {/* Spontansøknad */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                <Users className="h-3 w-3" strokeWidth={2} />
                Spontansøknad
              </div>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl">
                Finner du ikke din drømmestilling?
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-[1.6] text-muted-foreground">
                Send oss en spontansøknad. Fortell hvem du er, hva du brenner
                for og hva du kan bidra med. Vi leser alle henvendelser og svarer
                innen 3 virkedager.
              </p>
            </div>
            <a
              href="mailto:post@akgolf.no?subject=Spontansøknad"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              Send spontansøknad
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function VerdiKort({ tittel, tekst }: { tittel: string; tekst: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-8">
      <h3 className="font-display text-xl font-semibold tracking-tight">
        {tittel}
      </h3>
      <p className="mt-4 text-[14px] leading-[1.6] text-muted-foreground">
        {tekst}
      </p>
    </div>
  );
}

function StillingsKort({ stilling: s }: { stilling: Stilling }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-6 p-8 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground">
              <Briefcase className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {s.tittel}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  {s.sted}
                </span>
                <span className="rounded-full bg-secondary px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  {s.type}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.6] text-muted-foreground">
            {s.beskrivelse}
          </p>
        </div>
        <div className="shrink-0">
          <a
            href={`mailto:post@akgolf.no?subject=Søknad: ${encodeURIComponent(s.tittel)}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Søk stilling
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </a>
        </div>
      </div>
    </article>
  );
}
