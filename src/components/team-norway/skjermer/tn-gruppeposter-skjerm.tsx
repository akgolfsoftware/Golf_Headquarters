import { notFound } from "next/navigation";

import { hentSkjermbruker } from "./felles";
import { hentGruppepostSide, hentPaaminnelser } from "@/lib/domain/tn-post";
import { opprettGruppepostAction } from "@/app/team-norway/tn-post-actions";
import type { TnInnlegg } from "../tn-gruppe-klient";
import { TnGruppeposterVisning } from "./tn-gruppe-visning";

/**
 * TN-13 Gruppeposter. Beskjeder fra trenerteamet til gruppen, med lesekvittering.
 * Visningen (retning «Skrå», tavle D1) ligger i tn-gruppe-visning.tsx.
 * Fasit: docs/design-system/utkast-tn/gruppe.html, skjerm Gruppeposter (pakke 6).
 *
 * Avvik:
 *   - Mottaker er alltid hele gruppen. Herrer, Damer og U18 finnes ikke som
 *     mottakergrupper, fordi posten ikke har mottakerfelt og profilen ikke har kjønn.
 *   - «Send påminnelse» er et varsel i appen (Anders 27.09), én gang per innlegg,
 *     bare til spillere som ikke har lest. Varselet har ikke innleggets tekst.
 *   - Stillingstittel (Landslagssjef, Fysioterapeut) finnes ikke. Avsender står
 *     med rollen i gruppen: Trener eller Assist Coach.
 *   - Maks lengde er 2000 tegn, som serveren håndhever for alle poster, ikke 600.
 *   - Frittstående opplastinger vises under Dokumenter, ikke som innlegg.
 *   - Spillere og foresatte ser andelen som har lest, ikke navnene.
 *   - Forfatteren kan endre innlegget. Forfatteren og trener kan slette det
 *     (Anders 27.09.2026). Endret innlegg merkes «endret».
 */
export async function TnGruppeposterSkjerm({ groupId }: { groupId: string }) {
  const bruker = await hentSkjermbruker();
  const side = await hentGruppepostSide(groupId, bruker.id);
  if (!side) notFound();

  const erTrener = side.rolle === "TRENER";
  const harTrenertilgang = erTrener || bruker.role === "ADMIN";
  const rolleEtikett = erTrener ? "Trener" : side.rolle === "SPILLER" ? "Spiller" : "Foresatt";

  const synlige = side.tidslinje.filter((p) => p.kind !== "DOKUMENT");
  const paaminnelser = erTrener ? await hentPaaminnelser(synlige.map((p) => p.id)) : new Map();
  const innlegg: TnInnlegg[] = synlige
    .map((p) => ({
      id: p.id,
      forfatter: p.authorNavn,
      rolle: side.forfatterRoller[p.authorUserId] ?? "Trener",
      tidIso: p.createdAt.toISOString(),
      tekst: p.tekst,
      vedlegg: p.vedlegg.map((v) => ({ id: v.id, fileName: v.fileName })),
      totalt: p.kvittering?.totalt ?? 0,
      lest: p.kvittering?.apnet ?? 0,
      endret: p.editedAt !== null,
      kanEndre: p.authorUserId === bruker.id,
      kanSlette: p.authorUserId === bruker.id || harTrenertilgang,
      paaminnelse: paaminnelser.has(p.id) ? { sendtAtIso: paaminnelser.get(p.id)!.sendtAt.toISOString(), antall: paaminnelser.get(p.id)!.antall } : null,
    }));

  return (
    <TnGruppeposterVisning
      brukerNavn={bruker.name ?? "Ukjent"}
      rolleEtikett={rolleEtikett}
      groupId={groupId}
      harTrenertilgang={harTrenertilgang}
      erTrener={erTrener}
      gruppeNavn={side.gruppeNavn}
      utovere={side.utovere}
      under18={side.under18}
      innlegg={innlegg}
      send={opprettGruppepostAction.bind(null, groupId)}
    />
  );
}
