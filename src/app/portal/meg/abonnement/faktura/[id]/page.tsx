import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  Mail,
  Printer,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const NOK = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatDato(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatLang(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function FakturaDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  // Forsøk å hente faktisk Payment fra DB. Hvis ikke finnes, fall tilbake til eksempel-data.
  const payment = await prisma.payment.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      amountOre: true,
      paidAt: true,
      createdAt: true,
      type: true,
      description: true,
      stripeChargeId: true,
      stripeInvoiceId: true,
    },
  });

  // Hvis id er "demo" eller payment mangler — render eksempel basert på batch3-HTML.
  const erDemo = id === "demo" || !payment;
  if (!erDemo && !payment) notFound();

  const fakturaNr = erDemo ? "2026-0247" : (payment!.stripeInvoiceId ?? payment!.id.slice(-7));
  const fakturadato = erDemo ? new Date("2026-05-19") : (payment!.paidAt ?? payment!.createdAt);
  const forfallsdato = new Date(fakturadato.getTime() + 14 * 24 * 60 * 60 * 1000);
  const beloepOre = erDemo ? 30000 : payment!.amountOre;
  const netto = Math.round(beloepOre * 0.8);
  const mva = beloepOre - netto;

  return (
    <div className="mx-auto w-full max-w-[820px] space-y-8 px-4 sm:px-6">
      <Link
        href="/portal/meg/abonnement"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Tilbake til abonnement
      </Link>

      {/* Hero */}
      <header className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            AK Golf · Faktura
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            Faktura <em className="font-normal italic text-primary">#{fakturaNr}</em>
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Fakturadato <strong className="text-foreground">{formatLang(fakturadato)}</strong> · Forfaller {formatLang(forfallsdato)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:rgb(44_125_82)]/15 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-[color:rgb(44_125_82)]">
            <Check className="h-3 w-3" strokeWidth={2.5} />
            Betalt
          </span>
          <ActionBtn Icon={Printer}>Skriv ut</ActionBtn>
          <ActionBtn Icon={Mail}>Send på e-post</ActionBtn>
          <ActionBtn Icon={Download} primary>
            Last ned PDF
          </ActionBtn>
        </div>
      </header>

      {/* Meta grid */}
      <section className="grid gap-4 sm:grid-cols-2">
        <MetaBlock label="Fakturert til">
          <div className="font-display text-base font-semibold text-foreground">
            {user.name ?? "Markus Røinås Pedersen"}
          </div>
          <div className="text-sm text-muted-foreground">
            Storgata 14<br />
            1606 Fredrikstad<br />
            Norge
          </div>
        </MetaBlock>
        <MetaBlock label="Fakturert fra">
          <div className="font-display text-base font-semibold text-foreground">
            AK Golf Academy AS
          </div>
          <div className="text-sm text-muted-foreground">
            Skedsmovollen 2<br />
            2007 Kjeller<br />
            Org.nr 999 888 777 MVA
          </div>
        </MetaBlock>
        <div className="grid grid-cols-3 gap-4 sm:col-span-2">
          <MetaMini label="Fakturadato" value={formatDato(fakturadato)} />
          <MetaMini label="Forfallsdato" value={formatDato(forfallsdato)} />
          <MetaMini label="KID-nummer" value="1234 5678 90123" />
        </div>
      </section>

      {/* Lines */}
      <section className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px]">
          <caption className="sr-only">Fakturalinjer</caption>
          <thead className="bg-muted/60">
            <tr>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Beskrivelse
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Antall
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Stk-pris
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                MVA
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                Sum
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-6 py-4">
                <div className="font-display text-sm font-semibold text-foreground">
                  {payment?.description ?? `Pro-abonnement — ${fakturadato.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}`}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  PlayerHQ Pro · Månedlig fakturering
                </div>
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm tabular-nums">1</td>
              <td className="px-6 py-4 text-right font-mono text-sm tabular-nums">
                {NOK.format(netto / 100)} kr
              </td>
              <td className="px-6 py-4 text-right">
                <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                  25 %
                </span>
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm tabular-nums">
                {NOK.format(netto / 100)} kr
              </td>
            </tr>
          </tbody>
        </table>

        <div className="space-y-1 border-t border-border px-6 py-5">
          <TotalRow label="Netto" value={`${NOK.format(netto / 100)} kr`} />
          <TotalRow label="MVA (25 %)" value={`${NOK.format(mva / 100)} kr`} />
          <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-display text-sm font-semibold text-foreground">Total</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
              {NOK.format(beloepOre / 100)} kr
            </span>
          </div>
        </div>
      </section>

      {/* Betalingsinfo */}
      <section className="flex items-center gap-4 rounded-xl border border-[color:rgb(44_125_82)]/20 bg-[color:rgb(44_125_82)]/[0.04] border-l-4 border-l-[color:rgb(44_125_82)] p-5">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md bg-[color:rgb(44_125_82)]/15 text-[color:rgb(44_125_82)]">
          <CreditCard className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="text-sm">
          <strong>Betalt {formatLang(fakturadato)} kl. 11:42</strong> via{" "}
          <span className="font-mono">Visa ···· 4242</span>. Transaksjons-ID{" "}
          <span className="font-mono">{payment?.stripeChargeId ?? "stripe_3O6sLk"}</span>.
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-border pt-5">
        <span className="font-mono text-[11px] text-muted-foreground">
          Spørsmål om fakturaen?{" "}
          <Link href="/portal/meg/help/kontakt" className="font-semibold text-primary hover:underline">
            Kontakt support
          </Link>
        </span>
        <div className="flex gap-2">
          <ActionBtn Icon={Mail}>Send på e-post</ActionBtn>
          <ActionBtn Icon={Download} primary>
            Last ned PDF
          </ActionBtn>
        </div>
      </footer>
    </div>
  );
}

function ActionBtn({
  Icon,
  children,
  primary = false,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        primary
          ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      {children}
    </button>
  );
}

function MetaBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-3 space-y-1">{children}</div>
    </div>
  );
}

function MetaMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-1 font-mono text-sm font-bold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between font-mono text-sm tabular-nums">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
