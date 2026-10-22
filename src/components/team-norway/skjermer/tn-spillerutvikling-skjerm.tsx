import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnGruppetrening, hentTnSamlinger, hentTnSpillere } from "@/lib/domain/tn-arbeidsflate";
import { hentTnApneSpillere } from "@/lib/domain/tn-spillerliste";
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
 *   - «Ikke delt» viser navn og offentlig WAGR-plass (Anders 22.10.2026). Plan, trening, tester,
 *     klubb og HCP krever fortsatt deling (delingslåsen). Radene er ikke lenker før den låste
 *     IUP-en finnes (neste pakke).
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
  const apne = await hentTnApneSpillere(data.kontekst.gruppe.id, new Set(data.rader.map((r) => r.id)));
  const visDataGolf = await innloggetKanSeDataGolf();
  const q = (Array.isArray(sokeparametre.q) ? sokeparametre.q[0] : sokeparametre.q)?.trim() ?? "";
  return (
    <TnSpillerutviklingVisning
      brukerNavn={bruker.name}
      kontekst={data.kontekst}
      visDataGolf={visDataGolf}
      rader={data.rader}
      apne={apne}
      trening={trening?.rader ?? null}
      antallSpillere={samlingsdata?.antallSpillere ?? null}
      q={q}
      naa={naa}
    />
  );
}

