import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnGruppetrening, hentTnSamlinger, hentTnSpillere } from "@/lib/domain/tn-arbeidsflate";
import { hentSkjermbruker } from "./felles";
import { TnSpillerutviklingVisning } from "./tn-spillerutvikling-visning";

export { TnSpillerutviklingVisning };

/**
 * TN-12 Spillerutvikling. Retning «Skrå» (godkjent 20.10.2026, canvaset «Team Norway
 * nøkkelskjermer», tavle 2 Spillere): bildetopp med skrått kutt, hovedtall og tellere i toppen,
 * og båndene som kort over kanten. Tidligere fasit: docs/design-system/utkast-tn/spillere.html.
 * Hovedtallet er hvor mye av planen gruppa gjør, med tre bånd under:
 * Trenger deg · Følger planen · Ikke delt.
 *
 * Avvik:
 *   - Kategori A–K og klasse finnes ikke i spillerprofilen; raden viser skole (ellers klubb) og HCP.
 *   - Formkurve, snittscore og prioriterte tester per rad (tegningen) er ikke med ennå: radene
 *     leses fra treningen spilleren har delt, ikke fra turneringsrunder og tester.
 *   - «Ikke delt» viser bare antallet. Spillere som ikke har delt treningen, kan ikke
 *     leses av treneren, heller ikke nummer og klubb (delingslåsen).
 *   - Spillere som deler, men ikke har planlagt tid siste fire uker, står i et eget
 *     bånd «Uten plan» i stedet for å regnes som at de følger planen.
 *   - Søket ligger i adressen (?q=) og virker uten JavaScript.
 *   - «Mangler test» som grunn er ikke med: testdagene leses i Oversikt.
 */


export async function TnSpillerutviklingSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const naa = new Date();
  const [data, trening, samlingsdata] = await Promise.all([hentTnSpillere(bruker), hentTnGruppetrening(bruker, naa), hentTnSamlinger(bruker)]);
  if (!data || data.kontekst.erSpiller) notFound();
  const visDataGolf = await innloggetKanSeDataGolf();
  const q = (Array.isArray(sokeparametre.q) ? sokeparametre.q[0] : sokeparametre.q)?.trim() ?? "";
  return (
    <TnSpillerutviklingVisning
      brukerNavn={bruker.name}
      kontekst={data.kontekst}
      visDataGolf={visDataGolf}
      rader={data.rader}
      trening={trening?.rader ?? null}
      antallSpillere={samlingsdata?.antallSpillere ?? null}
      q={q}
      naa={naa}
    />
  );
}

