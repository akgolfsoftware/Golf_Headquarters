import { redirect } from "next/navigation";
import { innboksHref } from "@/lib/admin/innboks/filter";

/**
 * /admin/godkjenninger → /admin/innboks?filter=godkjenn
 *
 * Godkjenningene (Kø-fanen «Godkjenninger») er slått inn i Innboks › Godkjenn
 * (AG-04, «Én innboks», 28.09.2026). Adressen består som redirect — ingen
 * lenke noe sted skal brekke. Søkeparametrene følger med.
 */
export default async function GodkjenningerRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<never> {
  redirect(innboksHref("godkjenn", await searchParams));
}
