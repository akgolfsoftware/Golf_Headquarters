import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getCurrentUserRaw, type UserMedTilgang } from "@/lib/auth/getCurrentUser";
import { vurderTrenerflate } from "@/lib/auth/domene-sperre";
import { hentTnArbeidskontekst, type TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";

/**
 * Serverporten for hele Team Norway-flaten (/team-norway, unntatt
 * /team-norway/logg-inn). Kalles av `src/app/team-norway/(trener)/layout.tsx`
 * OG av hver skjerm (via `hentSkjermbruker()` i
 * `src/components/team-norway/skjermer/felles.tsx`), fordi en delt layout ikke
 * kjøres på nytt ved navigering mellom sider.
 *
 * Slipper inn:
 *   - plattform-ADMIN (Anders), uansett e-postdomene.
 *   - @golfforbundet.no med plattformrolle COACH og aktivt COACH- eller
 *     ASSISTANT-medlemskap i Team Norway-gruppen (eller demogruppen).
 * Alle andre sendes til /team-norway/logg-inn med `?avvist=domene|rolle`,
 * der innloggingsskjermen viser en tydelig norsk melding. Spillere bruker
 * PlayerHQ og ser aldri trenerflaten (Team Norway App delivery, 28.09).
 */

export type TnFlateTilgang = { bruker: UserMedTilgang; kontekst: TnArbeidskontekst };

export const TN_LOGG_INN = "/team-norway/logg-inn";

export const krevTnTrenerflate = cache(async (): Promise<TnFlateTilgang> => {
  const bruker = await getCurrentUserRaw();
  if (!bruker) redirect(TN_LOGG_INN);

  const kontekst = await hentTnArbeidskontekst({ id: bruker.id, role: bruker.role, name: bruker.name });
  const vurdering = vurderTrenerflate({
    flate: "team-norway",
    epost: bruker.email,
    plattformRolle: bruker.role,
    gruppeRolle: kontekst?.rolle ?? null,
  });
  if (!vurdering.ok) redirect(`${TN_LOGG_INN}?avvist=${vurdering.grunn}`);
  if (!kontekst) redirect(`${TN_LOGG_INN}?avvist=rolle`);
  return { bruker, kontekst };
});
