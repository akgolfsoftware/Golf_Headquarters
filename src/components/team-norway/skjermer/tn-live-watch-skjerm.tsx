import { notFound } from "next/navigation";

import { hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnDatoRad, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode, TnStatusmerke } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker, periode } from "./felles";

/**
 * TN-08 Live Watch.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-08.
 *
 * Avvik fra designet: det finnes ingen live-kilde for hull-for-hull-score.
 * Skjermen viser hvilke turneringer landslagsspillere er i akkurat nå, fra
 * registrerte datoer og påmeldinger, og sier rett ut at live-score mangler.
 * Ingen simulert resultatstrøm.
 */

export async function TnLiveWatchSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnTurneringer(bruker);
  if (!data) notFound();

  const naa = new Date().getTime();
  const pagar = data.turneringer
    .filter((t) => t.startDate.getTime() <= naa && (t.endDate ?? t.startDate).getTime() + 24 * 60 * 60 * 1000 > naa)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <SkjermRamme aktiv="live-watch" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/live-watch" tittel="Live Tournament Watch" ingress="Landslagsspillere i turnering akkurat nå." />

      <TnFlate>
        <TnFlatehode tittel="I turnering nå" merknad={`${pagar.length} ${pagar.length === 1 ? "turnering" : "turneringer"}`} />
        {pagar.map((t) => {
          const spillere = new Set([...t.entries.filter((e) => e.entryStatus !== "WITHDRAWN").map((e) => e.userId), ...t.results.map((r) => r.userId)]).size;
          return (
            <TnDatoRad
              key={t.id}
              dato={periode(t.startDate, t.endDate ?? t.startDate)}
              datoBredde={104}
              tittel={t.name}
              tekst={`${t.location ?? "Sted ikke registrert"} · ${spillere} ${spillere === 1 ? "spiller" : "spillere"}`}
              hoyre={<TnStatusmerke farge={TN.navy900}>Pågår</TnStatusmerke>}
            />
          );
        })}
        {pagar.length === 0 ? <TnMangler>Ingen landslagsspillere er i turnering i dag, etter datoene som er registrert.</TnMangler> : null}
      </TnFlate>

      <TnFlate>
        <TnFlatehode tittel="Live-score" merknad="Ikke koblet til" />
        <TnMangler>Score hull for hull, stilling og cut-estimat krever en live-kilde fra turneringsarrangøren. Den er ikke koblet til AK Golf HQ ennå, så her vises ingen tall før de er ekte.</TnMangler>
        <TnFotnote>Resultater legges inn etter runden og vises under Turneringer og reise.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
