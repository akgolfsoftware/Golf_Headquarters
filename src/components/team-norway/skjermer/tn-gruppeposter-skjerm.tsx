import { notFound } from "next/navigation";

import { hentSkjermbruker } from "./felles";
import { hentGruppepostSide } from "@/lib/domain/tn-post";
import { opprettGruppepostAction } from "@/app/team-norway/tn-post-actions";
import { TN } from "@/lib/v2/team-norway";
import { TnShell } from "../tn-shell";
import { TnSkjermhode } from "../tn-flate";
import { TnInnleggKort, TnInnleggSkjema, type TnInnlegg } from "../tn-gruppe-klient";

/**
 * TN-13 Gruppeposter. Beskjeder fra trenerteamet til gruppen, med lesekvittering.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-13.
 *
 * Avvik:
 *   - Mottaker er alltid hele gruppen. Herrer, Damer og U18 finnes ikke som
 *     mottakergrupper, fordi posten ikke har mottakerfelt og profilen ikke har kjønn.
 *   - «Send påminnelse» er ikke bygget. Kanalen for påminnelser er ikke bestemt.
 *   - Stillingstittel (Landslagssjef, Fysioterapeut) finnes ikke. Avsender står
 *     med rollen i gruppen: Trener eller Assist Coach.
 *   - Maks lengde er 2000 tegn, som serveren håndhever for alle poster, ikke 600.
 *   - Frittstående opplastinger vises under Dokumenter, ikke som innlegg.
 *   - Spillere og foresatte ser andelen som har lest, ikke navnene.
 */
export async function TnGruppeposterSkjerm({ groupId }: { groupId: string }) {
  const bruker = await hentSkjermbruker();
  const side = await hentGruppepostSide(groupId, bruker.id);
  if (!side) notFound();

  async function publiser(input: { tekst: string; kind: string }) {
    "use server";
    return opprettGruppepostAction(groupId, input);
  }

  const erTrener = side.rolle === "TRENER";
  const harTrenertilgang = erTrener || bruker.role === "ADMIN";
  const rolleEtikett = erTrener ? "Trener" : side.rolle === "SPILLER" ? "Spiller" : "Foresatt";

  const innlegg: TnInnlegg[] = side.tidslinje
    .filter((p) => p.kind !== "DOKUMENT")
    .map((p) => ({
      id: p.id,
      forfatter: p.authorNavn,
      rolle: side.forfatterRoller[p.authorUserId] ?? "Trener",
      tidIso: p.createdAt.toISOString(),
      tekst: p.tekst,
      vedlegg: p.vedlegg.map((v) => ({ id: v.id, fileName: v.fileName })),
      totalt: p.kvittering?.totalt ?? 0,
      lest: p.kvittering?.apnet ?? 0,
    }));

  const mottakere = side.under18 > 0 ? `Hele gruppen · ${side.utovere} spillere + foresatte` : `Hele gruppen · ${side.utovere} spillere`;

  return (
    <TnShell aktiv="gruppeposter" brukerNavn={bruker.name ?? "Ukjent"} rolle={rolleEtikett} groupId={groupId} visTrenerflater={harTrenertilgang} kanAdministrere={harTrenertilgang}>
      <TnSkjermhode rute={`/team-norway/${groupId}`} tittel="Gruppeposter" ingress={`Beskjeder fra trenerteamet til ${side.gruppeNavn}. ${erTrener ? "Du ser hvem som har lest hva." : "Alle i gruppen ser de samme innleggene."}`} />

      <div style={{ maxWidth: 860, width: "100%", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        {erTrener ? <TnInnleggSkjema send={publiser} forfatterNavn={bruker.name ?? "Ukjent"} mottakere={mottakere} /> : null}

        {innlegg.map((p) => (
          <TnInnleggKort key={p.id} innlegg={p} visHvem={erTrener} kvitter={!erTrener} />
        ))}

        {innlegg.length === 0 ? (
          <section style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)" }}>
            <div style={{ fontFamily: TN.font.display, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900 }}>Ingen innlegg ennå</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: TN.textSecondary, margin: "10px 0 0", maxWidth: "60ch" }}>
              {erTrener ? "Skriv det første innlegget til gruppen i feltet over. Du ser hvem som har lest det her." : "Trenerteamet har ikke skrevet noe til gruppen ennå."}
            </p>
          </section>
        ) : null}

        {side.under18 > 0 ? (
          <p style={{ fontSize: 13, lineHeight: 1.6, color: TN.textSecondary, margin: 0, maxWidth: "70ch" }}>
            Mindreårige står med fornavn og forbokstav i lesekvitteringen. Fullt navn finnes bare i spillerprofilen.
          </p>
        ) : null}
      </div>
    </TnShell>
  );
}
