import Link from "next/link";

export default function OmOss() {
  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Om oss
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <em className="font-normal text-primary md:italic">Bygget</em> av en coach for coacher
          </h1>
        </header>

        <div className="mt-12 space-y-6 text-base leading-relaxed text-foreground">
          <p>
            AK Golf er bygget av Anders Kristiansen — golfcoach, gründer og
            CEO i AK Golf Group AS. Etter å ha jobbet med både elite-spillere
            og klubb-amatører i over et tiår, så han et tomrom: ingen
            plattform kombinerte planlegging, AI, SG-tracking og direkte coach-kontakt
            i én sømløs opplevelse.
          </p>

          <p>
            <em className="text-primary not-italic md:italic">
              «Spillere har ikke tid til å hoppe mellom fem ulike apper.
              Coacher har ikke tid til å bygge planer i Excel.
              Vi bygde løsningen vi selv ønsket vi hadde.»
            </em>
          </p>

          <p>
            Plattformen drives av AK Golf-pyramiden — et balansert system som
            sørger for at treningstiden fordeles riktig mellom fysikk, teknikk,
            slag, spill og turneringserfaring. Hver plan, hver økt og hver
            agent-anbefaling refererer tilbake til pyramiden.
          </p>
        </div>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Tallene
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Modeller
              </dt>
              <dd className="mt-1 font-display text-3xl font-semibold tabular-nums">
                34
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Ruter
              </dt>
              <dd className="mt-1 font-display text-3xl font-semibold tabular-nums">
                70+
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Agenter
              </dt>
              <dd className="mt-1 font-display text-3xl font-semibold tabular-nums">
                8
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                AI-modeller
              </dt>
              <dd className="mt-1 font-display text-3xl font-semibold tabular-nums">
                3
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Selskapet
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <Rad label="Org.nummer" value="924 567 890" />
            <Rad label="Adresse" value="AK Golf Group AS, Fredrikstad, Norge" />
            <Rad label="E-post" value="hei@akgolf.no" />
            <Rad label="Holding" value="Skarpnord Invest AS" />
          </dl>
        </section>

        <div className="mt-16 text-center">
          <Link
            href="/auth/signup"
            className="inline-block rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground"
          >
            Prøv plattformen gratis →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Rad({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
