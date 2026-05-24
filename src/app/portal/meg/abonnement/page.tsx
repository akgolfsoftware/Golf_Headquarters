import { Check, AlertTriangle, ExternalLink, Receipt } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { ProKampanjeBanner } from "@/components/shared/pro-kampanje-banner";
import { PRO_KAMPANJE_INFO } from "@/lib/feature-flags";
import { UpgradeButton, ManageButton, CancelButton } from "./upgrade-button";

type Search = { ok?: string; cancelled?: string };

const NOK = new Intl.NumberFormat("nb-NO");

function fakturaTypeLabel(t: "BOOKING" | "SUBSCRIPTION" | "INVOICE" | "OTHER") {
  switch (t) {
    case "SUBSCRIPTION":
      return "Abonnement";
    case "BOOKING":
      return "Booking";
    case "INVOICE":
      return "Faktura";
    default:
      return "Annet";
  }
}

function formatDato(d: Date | null | undefined) {
  if (!d) return null;
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;

  // Hent FAKTISK tier direkte fra DB — `user.tier` er overstyrt mens
  // PRO-kampanjen er aktiv (se lib/feature-flags.ts).
  const faktisk = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tier: true },
  });
  const faktiskTier = faktisk?.tier ?? "GRATIS";

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  // Faktura-historikk: siste 12 vellykkede betalinger
  const fakturaer = await prisma.payment.findMany({
    where: { userId: user.id, status: "SUCCEEDED" },
    orderBy: { paidAt: "desc" },
    take: 12,
    select: {
      id: true,
      paidAt: true,
      amountOre: true,
      type: true,
      stripeInvoiceId: true,
      description: true,
    },
  });

  const erPro = faktiskTier === "PRO";
  const periodEnd = subscription?.currentPeriodEnd;
  const aktivSiden = subscription?.createdAt;

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Abonnement"
        titleLead="Din plan, betaling og"
        titleItalic="faktura"
        sub={
          erPro
            ? "Du er på Pro. Du ser planen din, neste belastning og fakturahistorikken her."
            : "Du står på Gratis-planen. Oppgrader til Pro for AI-coach, egendefinerte økter og direkte kontakt med coach."
        }
      />

      {params.ok === "1" && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-foreground">
          Velkommen til Pro. Endringen kan ta noen sekunder før den synes overalt.
        </div>
      )}
      {params.cancelled === "1" && (
        <div className="rounded-md border border-border bg-muted px-4 py-4 text-sm text-muted-foreground">
          Oppgraderingen ble avbrutt. Du står fortsatt på {faktiskTier}.
        </div>
      )}

      {PRO_KAMPANJE_INFO.aktiv && <ProKampanjeBanner />}

      {/* Hero plan-kort */}
      <div className="relative grid gap-8 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm lg:grid-cols-[1fr_300px]">
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[300px] lg:block bg-gradient-to-br from-primary/5 to-accent/10" />
        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary-foreground">
              {erPro ? "Pro" : "Gratis"}
            </span>
            {erPro && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {subscription?.status ?? "Aktiv"}
                {aktivSiden && <> · siden {formatDato(aktivSiden)}</>}
              </span>
            )}
          </div>
          <h2 className="mb-2 font-display text-3xl font-medium italic leading-none tracking-tight text-foreground">
            {erPro ? "Pro" : "Gratis"}
          </h2>
          <div className="mb-6 font-mono text-base text-foreground">
            <span className="text-2xl font-medium">{erPro ? "300" : "0"}</span>{" "}
            <span className="text-sm text-muted-foreground">
              {erPro ? "kr/mnd · faktureres månedlig" : "kr · gratis-tier"}
            </span>
          </div>
          <div className="mb-6 flex flex-col gap-2">
            {(erPro
              ? [
                  "Ubegrenset bruk av AI-coach (Claude)",
                  "Lag egendefinerte økter med Live Session",
                  "Direkte kontakt med tilknyttet coach",
                  "Full SG-analyse og pyramide-progresjon",
                  "Coach-laget treningsplaner",
                ]
              : [
                  "Basis treningsplan",
                  "Begrenset coaching-historikk",
                  "Bookinger og kvitteringer",
                ]
            ).map((t) => (
              <Feature key={t}>{t}</Feature>
            ))}
          </div>
          {erPro ? <ManageButton /> : <UpgradeButton />}
        </div>

        <div className="relative z-10 flex flex-col justify-center gap-4 border-border lg:border-l lg:pl-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Neste belastning
            </span>
            <div className="mt-2 font-mono text-sm font-medium text-foreground">
              {erPro && periodEnd ? (
                <>
                  {formatDato(periodEnd)}
                  <span className="mt-1 block text-xl font-semibold text-primary">
                    {NOK.format(30000 / 100)} kr
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Årspris ved årlig
            </span>
            <div className="mt-2 font-mono text-sm text-muted-foreground">
              {erPro ? "3 000 kr/år · spar 600 kr" : "Tilgjengelig som Pro"}
            </div>
          </div>
        </div>
      </div>

      {/* Sammenligning */}
      <Section title="Sammenlign planer" aux={erPro ? "Pro er din nåværende" : "Gratis er din nåværende"}>
        {/* Desktop: tabell */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[34%] bg-secondary/60 px-6 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Funksjon
                </th>
                <th className="px-4 py-4">
                  <ColHead name="Gratis" price="0" unit="kr" current={!erPro} />
                </th>
                <th className="px-4 py-4">
                  <ColHead
                    name="Pro"
                    price="300"
                    unit="kr/mnd"
                    badge={erPro ? "Din plan" : "Anbefalt"}
                    current={erPro}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <CompareRow
                feature="Aktive treningsplaner"
                desc="Hvor mange planer du kan jobbe på parallelt"
                free={<Num>1</Num>}
                pro={<Num>3</Num>}
                erPro={erPro}
              />
              <CompareRow
                feature="Coaching-historikk"
                desc="Hvor langt tilbake du kan se notater og runder"
                free={<Num>30 dager</Num>}
                pro={<Num>Ubegrenset</Num>}
                erPro={erPro}
              />
              <CompareRow
                feature="AI-anbefalinger"
                desc="Foreslåtte øvelser fra coach-agenten"
                free={<Dash />}
                pro={<CheckMark />}
                erPro={erPro}
              />
              <CompareRow
                feature="TrackMan-import"
                desc="Sync data fra dine økter automatisk"
                free={<Dash />}
                pro={<CheckMark />}
                erPro={erPro}
              />
              <CompareRow
                feature="Helse + restitusjon"
                desc="Søvn, skader, daglig logg"
                free={<Dash />}
                pro={<CheckMark />}
                erPro={erPro}
              />
              <CompareRow
                feature="1:1 coach-melding"
                desc="Direktemeldinger til coach"
                free={<Num>5 / mnd</Num>}
                pro={<Num>50 / mnd</Num>}
                erPro={erPro}
              />
            </tbody>
          </table>
        </div>

        {/* Mobil: stack av planer */}
        <div className="space-y-4 p-4 sm:hidden">
          <PlanKort
            navn="Gratis"
            pris="0 kr"
            current={!erPro}
            features={[
              "1 aktiv treningsplan",
              "30 dagers coaching-historikk",
              "5 coach-meldinger / mnd",
            ]}
          />
          <PlanKort
            navn="Pro"
            pris="300 kr/mnd"
            current={erPro}
            badge={erPro ? "Din plan" : "Anbefalt"}
            features={[
              "3 aktive treningsplaner",
              "Ubegrenset coaching-historikk",
              "AI-anbefalinger fra coach-agenten",
              "TrackMan-import",
              "Helse + restitusjon",
              "50 coach-meldinger / mnd",
            ]}
          />
        </div>
      </Section>

      {/* Faktura-historikk */}
      <Section
        title="Faktura-historikk"
        aux={fakturaer.length > 0 ? `Siste ${fakturaer.length}` : "Ingen betalinger"}
      >
        {fakturaer.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Receipt className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <p className="font-display text-base font-semibold text-foreground">
              Ingen betalinger registrert
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Når du har gjort en betaling — abonnement, booking eller faktura —
              vises kvitteringer her.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Dato
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Beløp
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Kvittering
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {fakturaer.map((f) => (
                  <tr key={f.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-6 py-4 font-mono text-xs tabular-nums text-foreground">
                      {formatDato(f.paidAt) ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {fakturaTypeLabel(f.type)}
                      {f.description && (
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {f.description}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-foreground">
                      {NOK.format(f.amountOre / 100)} kr
                    </td>
                    <td className="px-6 py-4 text-right">
                      {f.stripeInvoiceId ? (
                        <a
                          href={`https://invoice.stripe.com/i/${f.stripeInvoiceId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Vis
                          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Farlig sone */}
      {erPro && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle
              className="h-4 w-4 text-destructive"
              strokeWidth={1.5}
            />
            <h3 className="font-display text-base font-semibold text-foreground">
              Farlig sone
            </h3>
          </div>
          <DangerRow
            title="Kanseller abonnement"
            desc={
              periodEnd
                ? `Du beholder Pro ut perioden (til ${formatDato(periodEnd)}). Deretter går du tilbake til Gratis.`
                : "Du beholder Pro ut perioden. Deretter går du tilbake til Gratis."
            }
            action={<CancelButton />}
          />
        </section>
      )}
    </div>
  );
}

function Section({
  title,
  aux,
  children,
}: {
  title: string;
  aux?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <Check className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.5} />
      {children}
    </div>
  );
}

function PlanKort({
  navn,
  pris,
  features,
  current = false,
  badge,
}: {
  navn: string;
  pris: string;
  features: string[];
  current?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        current ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <div className="font-display text-base font-semibold text-foreground">
          {navn}
        </div>
        {badge && (
          <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
        {pris}
      </div>
      <div className="mt-4 space-y-2">
        {features.map((f) => (
          <Feature key={f}>{f}</Feature>
        ))}
      </div>
    </div>
  );
}

function ColHead({
  name,
  price,
  unit,
  badge,
  current = false,
}: {
  name: string;
  price: string;
  unit: string;
  badge?: string;
  current?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-md px-4 py-4 ${
        current ? "border-b-2 border-primary bg-primary/10" : "border-b border-border bg-card"
      }`}
    >
      {badge && (
        <span
          className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${
            current ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
          }`}
        >
          {badge}
        </span>
      )}
      <span className="font-display text-xl font-semibold italic leading-none tracking-tight text-foreground">
        {name}
      </span>
      <span className="font-mono text-sm text-muted-foreground">
        <span className="text-xl font-medium text-foreground">{price}</span>{" "}
        {unit}
      </span>
    </div>
  );
}

function CompareRow({
  feature,
  desc,
  free,
  pro,
  erPro,
}: {
  feature: string;
  desc: string;
  free: React.ReactNode;
  pro: React.ReactNode;
  erPro: boolean;
}) {
  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="bg-secondary/60 px-6 py-4 align-middle font-medium text-foreground">
        {feature}
        <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
          {desc}
        </span>
      </td>
      <td className={`px-4 py-4 text-center ${!erPro ? "bg-primary/10" : ""}`}>{free}</td>
      <td className={`px-4 py-4 text-center ${erPro ? "bg-primary/10" : ""}`}>{pro}</td>
    </tr>
  );
}

function Num({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-sm text-foreground">{children}</span>;
}

function Dash() {
  return <span className="font-mono text-muted-foreground/60">—</span>;
}

function CheckMark() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
      <Check className="h-3 w-3" strokeWidth={1.5} />
    </span>
  );
}

function DangerRow({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-destructive/20 py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
      {action}
    </div>
  );
}
