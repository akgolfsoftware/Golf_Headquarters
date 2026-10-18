import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { tryggTeamNorwayRetursti } from "@/lib/auth/team-norway-sperre";
import { TnInnlogging } from "./tn-innlogging";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logg inn — Team Norway Golf",
  description: "Innlogging for Team Norway Golf med AK Golf-kontoen din.",
  robots: { index: false, follow: false },
};

/** /teamnorway — Team Norways inngang. Samme konto og samme innlogging som resten av AK Golf HQ. */
export default async function TeamNorwayInngangPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const retursti = tryggTeamNorwayRetursti((await searchParams).next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(retursti);
  return <TnInnlogging retursti={retursti} />;
}
