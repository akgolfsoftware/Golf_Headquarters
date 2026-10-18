import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { WangLogin } from "../team-wang/logg-inn/wang-login";
import { tryggWangRetursti } from "../team-wang/_data/wang-retur-sti";

// Samme krav som den gamle WANG-innloggingen: skript med nonce fra forespørselens CSP.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logg inn — WANG Toppidrett Fredrikstad Golf",
  description: "Innlogging for WANG Toppidrett Fredrikstad Golf med AK Golf-kontoen din.",
  robots: { index: false, follow: false },
};

/** /wang — WANGs inngang. Samme konto og samme innlogging som resten av AK Golf HQ. */
export default async function WangInngangPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const retursti = tryggWangRetursti((await searchParams).next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(retursti);
  return <WangLogin retursti={retursti} />;
}
