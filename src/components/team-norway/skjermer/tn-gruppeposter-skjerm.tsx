import { notFound } from "next/navigation";

import { hentSkjermbruker } from "./felles";
import { hentGruppepostSide, hentPaaminnelser } from "@/lib/domain/tn-post";
import { opprettGruppepostAction } from "@/app/team-norway/tn-post-actions";
import { TN } from "@/lib/v2/team-norway";
import { TnShell } from "../tn-shell";
import { TnSkjermhode } from "../tn-flate";
import { TnInnleggKort, TnInnleggSkjema, type TnInnlegg } from "../tn-gruppe-klient";

/**
 * TN-13 Gruppeposter. Beskjeder fra trenerteamet til gruppen, med lesekvittering.
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

  const mottakere = side.under18 > 0 ? `Hele gruppen · ${side.utovere} spillere + foresatte` : `Hele gruppen · ${side.utovere} spillere`;

  return (
    <TnShell aktiv="gruppeposter" brukerNavn={bruker.name ?? "Ukjent"} rolle={rolleEtikett} groupId={groupId} visTrenerflater={harTrenertilgang} kanAdministrere={harTrenertilgang}>
      <TnSkjermhode overlinje={`${side.gruppeNavn} · ${side.utovere} spillere`} tittel="Gruppeposter" ingress={`Beskjeder til hele gruppa. Spillerne og foresatte ser dem i PlayerHQ. ${erTrener ? "Du ser hvem som har lest hva." : ""}`} />

      <div style={{ maxWidth: 860, width: "100%", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        {erTrener ? <TnInnleggSkjema send={opprettGruppepostAction.bind(null, groupId)} forfatterNavn={bruker.name ?? "Ukjent"} mottakere={mottakere} /> : null}

        {innlegg.map((p) => (
          <TnInnleggKort key={p.id} innlegg={p} visHvem={erTrener} kvitter={!erTrener} />
        ))}

        {innlegg.length === 0 ? (
          <section style={{ background: TN.ink50, border: `1px solid ${TN.ink200}`, borderRadius: TN.radius.sm, padding: "16px 18px 18px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TN.ink900 }}>Ingen innlegg ennå</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: TN.ink700, margin: "8px 0 0", maxWidth: "60ch" }}>
              {erTrener ? "Skriv det første innlegget til gruppen i feltet over. Du ser hvem som har lest det her." : "Trenerteamet har ikke skrevet noe til gruppen ennå."}
            </p>
          </section>
        ) : null}

        {side.under18 > 0 ? (
          <p style={{ fontSize: 12.5, lineHeight: 1.45, color: TN.ink500, margin: 0, maxWidth: "70ch" }}>
            Mindreårige står med fornavn og forbokstav i lesekvitteringen. Fullt navn finnes bare i spillerprofilen.
          </p>
        ) : null}
      </div>
    </TnShell>
  );
}
