/**
 * PlayerHQ · Meg · Abonnement · Faktura-detalj — v2.
 * v2-port 17. juli 2026 (Team D4a): MegFakturaV2 erstatter Tailwind-siden.
 * Auth, Prisma-oppslaget (kun brukerens egne Payments), status-mapping og
 * netto/mva-utregningen er uendret — kun presentasjonslaget er nytt.
 * PDF-genereringen (faktura-document.tsx, actions.tsx, pdf/route.tsx) er
 * bevisst IKKE rørt; knappene (faktura-actions.tsx) sendes inn som slot.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/shared/print-button";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, TomTilstand, Kort } from "@/components/v2";
import { MegFakturaV2, type MegFakturaData } from "@/components/portal/v2/MegFakturaV2";
import { LastNedPdfKnapp, SendEpostKnapp } from "./faktura-actions";

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

  // Hent faktisk Payment fra DB (kun brukerens egne).
  const payment = await prisma.payment.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      amountOre: true,
      status: true,
      paidAt: true,
      createdAt: true,
      type: true,
      description: true,
      stripeChargeId: true,
      stripeInvoiceId: true,
    },
  });

  // Ingen ekte faktura med denne id-en på brukeren — vis ærlig "ikke funnet".
  if (!payment) {
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/meg/abonnement">Abonnement</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="file-text"
            title="Faktura ikke funnet"
            sub="Vi fant ingen faktura med denne ID-en på kontoen din."
          />
        </Kort>
      </V2Shell>
    );
  }

  const fakturaNr = payment.stripeInvoiceId ?? payment.id.slice(-7);
  const fakturadato = payment.paidAt ?? payment.createdAt;
  const forfallsdato = new Date(fakturadato.getTime() + 14 * 24 * 60 * 60 * 1000);
  const beloepOre = payment.amountOre;
  const netto = Math.round(beloepOre * 0.8);
  const mva = beloepOre - netto;

  const erBetalt =
    payment.status === "SUCCEEDED" || payment.status === "PARTIALLY_REFUNDED";
  const statusLabel =
    payment.status === "SUCCEEDED"
      ? "Betalt"
      : payment.status === "PARTIALLY_REFUNDED"
        ? "Delvis refundert"
        : payment.status === "REFUNDED"
          ? "Refundert"
          : payment.status === "FAILED"
            ? "Feilet"
            : "Venter";

  const data: MegFakturaData = {
    fakturaNr,
    fakturadato: formatLang(fakturadato),
    forfallsdato: formatLang(forfallsdato),
    fakturadatoKort: formatDato(fakturadato),
    forfallsdatoKort: formatDato(forfallsdato),
    fakturaId: payment.stripeInvoiceId ?? payment.id.slice(-12),
    beskrivelse:
      payment.description ??
      `Abonnement — ${fakturadato.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}`,
    nettoKr: `${NOK.format(netto / 100)} kr`,
    mvaKr: `${NOK.format(mva / 100)} kr`,
    totalKr: `${NOK.format(beloepOre / 100)} kr`,
    erBetalt,
    statusLabel,
    betaltDato: erBetalt && payment.paidAt ? formatLang(payment.paidAt) : null,
    transaksjonsId: payment.stripeChargeId ?? null,
    navn: user.name ?? null,
    epost: user.email ?? null,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/abonnement">Abonnement</TilbakeLenke>
      <MegFakturaV2
        data={data}
        handlinger={
          <>
            <PrintButton
              label="Skriv ut"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--v2-border-s)] bg-[var(--v2-panel3)] px-4 py-2 text-[12.5px] font-semibold text-[var(--v2-fg)]"
            />
            <SendEpostKnapp paymentId={payment.id} />
            <LastNedPdfKnapp paymentId={payment.id} />
          </>
        }
      />
    </V2Shell>
  );
}
