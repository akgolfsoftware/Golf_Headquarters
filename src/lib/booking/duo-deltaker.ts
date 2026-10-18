import { email } from "@/lib/validation/schemas";
import { erDuoTjeneste } from "@/lib/booking/tjeneste-kategori";

/**
 * Duo (bookingplanen steg 6): en duo-tjeneste krever navn og en annen gyldig
 * e-post for deltaker 2. Andre tjenester lagrer aldri deltaker 2, selv om
 * feltene er sendt med.
 */
export function vurderDuoDeltaker(
  service: { kategori: string | null; name: string },
  data: { email: string; partnerName?: string; partnerEmail?: string },
): { ok: true; partner: { name: string; email: string } | null } | { ok: false; error: string } {
  if (!erDuoTjeneste(service)) return { ok: true, partner: null };
  const name = data.partnerName?.trim() ?? "";
  const epost = data.partnerEmail?.trim().toLowerCase() ?? "";
  if (!name) return { ok: false, error: "Skriv fullt navn på deltaker 2." };
  if (!email.safeParse(epost).success) return { ok: false, error: "Skriv en gyldig e-postadresse for deltaker 2." };
  if (epost === data.email.trim().toLowerCase()) {
    return { ok: false, error: "Deltaker 2 trenger en annen e-postadresse enn din." };
  }
  return { ok: true, partner: { name, email: epost } };
}
