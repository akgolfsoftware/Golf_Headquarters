import { permanentRedirect } from "next/navigation";

import { tryggWangRetursti } from "../_data/wang-retur-sti";

/** Den gamle adressen virker fortsatt; innloggingen bor nå på /wang. */
export default async function WangLoggInnRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const retursti = tryggWangRetursti((await searchParams).next);
  permanentRedirect(retursti === "/team-wang" ? "/wang" : `/wang?next=${encodeURIComponent(retursti)}`);
}
