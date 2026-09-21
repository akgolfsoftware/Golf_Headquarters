/**
 * Kvitteringslinja i spillerens abonnementsliste.
 *
 * Ren modul uten Prisma, så regelen kan testes for seg.
 *
 * Fram til 21.09.2026 hentet lista bare `status: "SUCCEEDED"` og formaterte
 * beløpet som «299 kr» uansett. To ting ble da feil:
 *
 *   1. En refundert betaling (REFUNDED / PARTIALLY_REFUNDED) forsvant HELT
 *      fra lista. Spilleren så ingen spor av en transaksjon som faktisk har
 *      skjedd på kortet deres. Forelderportalen har hele tiden vist
 *      «Refundert {dato}» — spillerens egen liste gjorde det ikke.
 *   2. `currency` ble ignorert. En betaling i en annen valuta ble vist som
 *      kroner, altså et beløp som ikke stemmer.
 *
 * Regelen nå: vis transaksjonen slik den står, med status og valuta, og «—»
 * for felt som mangler. Ingenting utelates, ingenting antas.
 */

/** Statusene en kvittering kan ha. Speiler Prisma-enumen `PaymentStatus`. */
export type KvitteringStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

/** Statusene som hører hjemme i spillerens kvitteringsliste. */
export const KVITTERING_STATUSER: readonly KvitteringStatus[] = [
  "SUCCEEDED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

export type KvitteringRad = {
  paidAt: Date | null;
  amountOre: number;
  amountRefundedOre: number;
  currency: string | null;
  status: string | null;
  description: string | null;
};

export type KvitteringLinje = {
  tittel: string;
  /** «18. september 2026 · 299 kr» — eller med «—» der noe mangler. */
  meta: string;
};

/**
 * Beløp med den valutaen betalingen faktisk ble gjort i.
 * Ukjent valuta skrives som koden selv, aldri oversatt til kroner.
 */
export function formaterBelop(ore: number, currency: string | null): string {
  const tall = (ore / 100).toLocaleString("nb-NO", {
    minimumFractionDigits: ore % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const kode = (currency ?? "").trim().toLowerCase();
  if (!kode) return `${tall} —`;
  return kode === "nok" ? `${tall} kr` : `${tall} ${kode.toUpperCase()}`;
}

function statusOrd(status: string | null): string | null {
  switch (status) {
    case "SUCCEEDED":
      return "Betalt";
    case "REFUNDED":
      return "Refundert";
    case "PARTIALLY_REFUNDED":
      return "Delvis refundert";
    case "PENDING":
      return "Ubetalt";
    case "FAILED":
      return "Betaling feilet";
    default:
      // Ukjent status skal ikke presenteres som om den var betalt.
      return null;
  }
}

/** Bygger én kvitteringslinje. Felt som mangler blir «—», aldri utelatt. */
export function byggKvitteringLinje(rad: KvitteringRad): KvitteringLinje {
  const dato = rad.paidAt
    ? rad.paidAt.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const deler = [dato, formaterBelop(rad.amountOre, rad.currency)];

  const ord = statusOrd(rad.status);
  deler.push(ord ?? "Status ukjent");

  // Refundert beløp er en egen opplysning: «299 kr · Delvis refundert ·
  // 150 kr tilbakeført» sier noe annet enn bare «Delvis refundert».
  if (rad.amountRefundedOre > 0) {
    deler.push(`${formaterBelop(rad.amountRefundedOre, rad.currency)} tilbakeført`);
  }

  return {
    tittel: rad.description?.trim() || "Betaling",
    meta: deler.join(" · "),
  };
}
