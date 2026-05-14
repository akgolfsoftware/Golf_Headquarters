import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SubscribeButton } from "@/components/marketing/subscribe-button";

export const metadata: Metadata = {
  title: "Coaching — AK Golf Academy",
  description:
    "Performance og Performance Pro: personlig golf-coaching med Anders Kristiansen. PlayerHQ inkludert. Fra 1 200 kr/mnd.",
};

type Plan = "performance" | "performance_pro";

const PAKKER: Array<{
  plan: Plan;
  navn: string;
  pris: string;
  enhet: string;
  okter: string;
  beskrivelse: string;
  egnet: string;
  inkludert: string[];
  cta: string;
  fremhevet: boolean;
}> = [
  {
    plan: "performance",
    navn: "Performance",
    pris: "1 200 kr",
    enhet: "/ mnd",
    okter: "2 × 20 min per måned",
    beskrivelse:
      "For deg som vil ha jevn oppfølging og en plan å trene etter mellom øktene.",
    egnet: "Klubbspillere som vil bli bedre over tid",
    inkludert: [
      "2 personlige treningsøkter à 20 min",
      "Skreddersydd treningsplan i PlayerHQ",
      "Oppfølging mellom øktene",
      "Full tilgang til PlayerHQ — gratis",
      "Trackman-data der relevant",
    ],
    cta: "Bli Performance-kunde",
    fremhevet: false,
  },
  {
    plan: "performance_pro",
    navn: "Performance Pro",
    pris: "2 220 kr",
    enhet: "/ mnd",
    okter: "4 × 20 min per måned",
    beskrivelse:
      "For deg med høye mål — klubblag, elite, eller turneringsspill. Tett oppfølging hver uke.",
    egnet: "Konkurransespillere og spillere med klare mål",
    inkludert: [
      "4 personlige treningsøkter à 20 min",
      "Periodisert plan tilpasset turneringskalender",
      "Tett oppfølging mellom øktene",
      "Full tilgang til PlayerHQ — gratis",
      "Trackman-data + video-analyse der relevant",
      "Direkte kontakt på melding mellom økter",
    ],
    cta: "Bli Performance Pro-kunde",
    fremhevet: true,
  },
];

export default function Coaching() {
  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Coaching
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal italic text-primary">Coaching</em> som
            gir fremgang
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">
            Som abonnent får du 2 eller 4 coaching-timer hver måned. Du booker
            dem selv fra PlayerHQ når det passer deg — og får en plan,
            statistikk og oppfølging mellom øktene.
          </p>
        </header>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/akademy/coaching-tripod.jpg"
            alt="Coaching utendørs med kamera og data-tripod på driving range"
            width={1920}
            height={1280}
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PAKKER.map((p) => (
            <article
              key={p.navn}
              className={`relative rounded-2xl border p-8 ${
                p.fremhevet
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {p.fremhevet && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-primary-foreground">
                  Mest valgt
                </span>
              )}
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {p.navn}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.okter}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold tabular-nums">
                  {p.pris}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {p.enhet}
                </span>
              </div>
              <p className="mt-6 text-sm text-foreground">{p.beskrivelse}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-[0.10em]">
                  Egnet for:
                </span>{" "}
                {p.egnet}
              </p>

              <ul className="mt-6 space-y-4 text-sm text-foreground">
                {p.inkludert.map((i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <SubscribeButton
                  plan={p.plan}
                  className={`w-full rounded-md px-6 py-4 text-center text-sm font-semibold transition-opacity disabled:opacity-60 ${
                    p.fremhevet
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-input bg-background text-foreground hover:border-border"
                  }`}
                >
                  {p.cta}
                </SubscribeButton>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-20 rounded-2xl border border-border bg-card p-8 sm:p-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Hva inkluderer en økt?
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Hver økt er strukturert rundt det du jobber med akkurat nå. Anders
            bygger neste steg basert på data fra forrige økt og målene dine.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-4 text-sm text-foreground sm:grid-cols-2">
            <li className="flex items-start gap-4">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>20 min fokusert trening med Anders</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Klare fokuspunkter og drills å øve på</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Trackman-data lagret automatisk</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Plan oppdateres i PlayerHQ</span>
            </li>
          </ul>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-background p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Ikke klar for abonnement?
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Du kan også booke enkelt-timer uten binding. Pro-time 30 min eller
            60 min, Trackman-økt eller gruppeøkt — se hva som er ledig.
          </p>
          <Link
            href="/booking"
            className="mt-6 inline-block rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-foreground hover:border-border"
          >
            Se ledige tider →
          </Link>
        </section>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Spørsmål om hvilken pakke som passer for deg?{" "}
            <a
              href="mailto:post@akgolf.no"
              className="text-primary hover:underline"
            >
              post@akgolf.no
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
