import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSpillere, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { tnSpillerHref } from "../tn-ruter";
import { TomTilstand, etikett, mono } from "../tn-daglig-spillere/ui";
import { SkjermRamme, hentSkjermbruker, periode, medDato } from "./felles";

/**
 * TN-08 Live Watch. Fasit: «Team Norway App.dc.html», skjerm «live» (lTours,
 * scorekort og hendelser).
 *
 * Avvik:
 *   - Ingen live-kilde for hull-for-hull-score finnes. Hver pågående turnering
 *     får sitt kort med spillerne i gruppen og den plasseringen og totalen som
 *     faktisk er registrert. «I dag», «Thru», cut-estimat, scorekort og
 *     hendelser står tomme med forklaring. Ingen simulert strøm.
 *   - Filterknappene (per turnering) og pause-knappen står ikke: uten live-kilde
 *     er det ingenting å filtrere eller pause.
 */

const KOLONNER = "40px minmax(0, 1fr) 42px 48px 44px";

export async function TnLiveWatchSkjerm() {
  const bruker = await hentSkjermbruker();
  const [data, spillerside] = await Promise.all([hentTnTurneringer(bruker), hentTnSpillere(bruker)]);
  if (!data) notFound();
  const navn = new Map((spillerside?.rader ?? []).map((r) => [r.id, r.navn]));

  const naa = new Date().getTime();
  const pagar = medDato(data.turneringer)
    .filter((t) => t.startDate.getTime() <= naa && (t.endDate ?? t.startDate).getTime() + 24 * 60 * 60 * 1000 > naa)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <SkjermRamme aktiv="live-watch" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/live-watch" tittel="Live Tournament Watch" ingress="Alle landslagsspillere i turnering akkurat nå. Resultatene hentes fra registrerte turneringer; live-score er ikke koblet til ennå." />

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, ...mono(11.5, TN.textSecondary), whiteSpace: "nowrap" }}>
          <span aria-hidden style={{ width: 8, height: 8, background: TN.textSecondary }} />IKKE LIVE · KILDE MANGLER
        </span>
        <span style={{ ...mono(11, TN.textSecondary), whiteSpace: "nowrap" }}>AK GOLF PIPELINE</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: "999 1 540px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {pagar.map((t) => {
            const ider = [...new Set([...t.entries.filter((e) => e.entryStatus !== "WITHDRAWN").map((e) => e.userId), ...t.results.map((r) => r.userId)])];
            const resultat = new Map(t.results.map((r) => [r.userId, r]));
            const rader = ider
              .map((id) => ({ id, navn: navn.get(id) ?? "Ukjent spiller", pos: resultat.get(id)?.position ?? null, tot: resultat.get(id)?.score ?? null }))
              .sort((a, b) => (a.pos ?? Infinity) - (b.pos ?? Infinity) || a.navn.localeCompare(b.navn, "nb"));
            return (
              <TnFlate key={t.id}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline", paddingBottom: 12, borderBottom: `2px solid ${TN.navy900}` }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900, margin: 0, overflowWrap: "anywhere" }}>
                      <Link href={`/team-norway/turneringer/${t.id}`} style={{ color: TN.navy900, textDecoration: "none" }}>{t.name}</Link>
                    </h2>
                    <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 6, overflowWrap: "anywhere" }}>{t.location ?? "Sted ikke registrert"} · {periode(t.startDate, t.endDate ?? t.startDate)} · {rader.length} {rader.length === 1 ? "spiller" : "spillere"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...mono(11.5, TN.textSecondary), letterSpacing: "0.06em", whiteSpace: "nowrap" }}>CUT —</div>
                    <div style={{ fontSize: 12, color: TN.textSecondary, marginTop: 3 }}>Ingen live-kilde</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 8, padding: "10px 0 6px", ...etikett }}>
                  <span>Pos</span><span>Spiller</span><span style={{ textAlign: "right" }}>I dag</span><span style={{ textAlign: "right" }}>Tot</span><span style={{ textAlign: "right" }}>Thru</span>
                </div>
                {rader.map((r) => (
                  <Link key={r.id} href={tnSpillerHref(r.id)} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 8, alignItems: "center", padding: "11px 0", minHeight: 44, borderTop: `1px solid ${TN.navy100}`, color: TN.ink900, textDecoration: "none" }}>
                    <span style={{ ...mono(13, TN.textSecondary), paddingLeft: 8 }}>{r.pos ?? "—"}</span>
                    <span style={{ fontSize: 14.5, fontWeight: 700, minWidth: 0, overflowWrap: "anywhere" }}>{r.navn}</span>
                    <span style={{ ...mono(13.5, TN.textSecondary), textAlign: "right" }}>—</span>
                    <span style={{ ...mono(15), fontWeight: 600, textAlign: "right" }}>{r.tot ?? "—"}</span>
                    <span style={{ ...mono(12.5, TN.textSecondary), textAlign: "right", paddingRight: 4 }}>—</span>
                  </Link>
                ))}
                {rader.length === 0 ? <TnMangler>Ingen spillere fra gruppen er registrert i turneringen.</TnMangler> : null}
              </TnFlate>
            );
          })}
          {pagar.length === 0 ? (
            <TnFlate><TomTilstand tittel="Ingen spillere i turnering nå">Live Watch viser spillere som er i turnering akkurat nå, etter datoene som er registrert.</TomTilstand></TnFlate>
          ) : null}
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <TnFlate>
            <TnFlatehode tittel="Scorekort" merknad="IKKE KOBLET TIL" />
            <TnMangler>Score hull for hull krever en live-kilde fra turneringsarrangøren. Den er ikke koblet til AK Golf HQ ennå, så her vises ingen tall før de er ekte.</TnMangler>
          </TnFlate>
          <TnFlate>
            <TnFlatehode tittel="Hendelser" />
            <TnMangler>Birdies, bogeys og cut-endringer kommer når live-kilden er koblet til.</TnMangler>
            <TnFotnote>Resultater legges inn etter runden og vises under Turneringer og reise.</TnFotnote>
          </TnFlate>
        </div>
      </div>
    </SkjermRamme>
  );
}
