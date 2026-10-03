/** PH25Faktura — fakturadetalj i PlayerHQSkall.
 * Auth, Prisma-oppslaget (kun brukerens egne Payments), status-mapping og
 * netto/mva-utregningen er uendret. PDF-ruten og e-post-actionen er urørt.
 */
import Link from "next/link";
import { FileText } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/shared/print-button";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TomTilstand } from "@/components/precision/pa";
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
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const { id } = await params;

  // Hent faktisk Payment fra DB (kun brukerens egne).
  const [payment, ulest] = await Promise.all([
    prisma.payment.findFirst({
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
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  // Ingen ekte faktura med denne id-en på brukeren — vis ærlig "ikke funnet".
  if (!payment) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
        <div className="pa-side">
          <div className="ph-flate">
            <Link href="/portal/meg/abonnement" className="ph-tilbake">Abonnement</Link>
            <TomTilstand
              icon={FileText}
              title="Faktura ikke funnet"
              text="Vi fant ingen faktura med denne ID-en på kontoen din."
            />
          </div>
        </div>
      </PlayerHQSkall>
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
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <MegFakturaV2
          data={data}
          handlinger={
            <>
              <PrintButton
                label="Skriv ut"
                className="pa-btn pa-btn--secondary pa-btn--full"
              />
              <SendEpostKnapp paymentId={payment.id} />
              <LastNedPdfKnapp paymentId={payment.id} />
            </>
          }
        />
      </div>
    </PlayerHQSkall>
  );
}
