import { notFound } from "next/navigation";

import { hentTnSpillere, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnInitialer, TnMangler, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker, periode, medDato } from "./felles";
import d from "./tn-daglig.module.css";

/**
 * TN-08 Live Watch.
 * Fasit: docs/design-system/utkast-tn/daglig.html, skjerm Live Watch (pakke 2).
 *
 * Avvik:
 *   - Ingen live-kilde for hull-for-hull-score finnes. Skjermen viser hvilke
 *     turneringer landslagsspillere er i nå, fra registrerte datoer og
 *     påmeldinger, med siste registrerte plass og score. Starttid og hull finnes
 *     ikke i dataene. Ingen simulert strøm.
 */

const langDag = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });

export async function TnLiveWatchSkjerm() {
  const bruker = await hentSkjermbruker();
  const [data, spillerside] = await Promise.all([hentTnTurneringer(bruker), hentTnSpillere(bruker)]);
  if (!data) notFound();

  const naa = new Date();
  const pagar = medDato(data.turneringer)
    .filter((t) => t.startDate.getTime() <= naa.getTime() && (t.endDate ?? t.startDate).getTime() + 24 * 60 * 60 * 1000 > naa.getTime())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const navn = new Map((spillerside?.rader ?? []).map((r) => [r.id, r.navn]));
  const antallSpillere = new Set(pagar.flatMap((t) => [...t.entries.filter((e) => e.entryStatus !== "WITHDRAWN").map((e) => e.userId), ...t.results.map((r) => r.userId)])).size;

  return (
    <SkjermRamme aktiv="live-watch" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode overlinje={langDag.format(naa)} tittel="Live Watch" ingress="Landslagsspillere i turnering akkurat nå." />

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="I turnering nå">
          {antallSpillere > 0 ? <span className={d.puls}><i />{antallSpillere} {antallSpillere === 1 ? "spiller" : "spillere"}</span> : null}
        </TnFlatehode>
        {pagar.map((t) => {
          const spillerIder = [...new Set([...t.entries.filter((e) => e.entryStatus !== "WITHDRAWN").map((e) => e.userId), ...t.results.map((r) => r.userId)])];
          return (
            <TnFlate key={t.id} style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "4px 12px" }}>
                <span style={{ fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{t.name} · {periode(t.startDate, t.endDate ?? t.startDate)}</span>
                <TnTekstlenke href={`/team-norway/turneringer/${t.id}`}>Turneringen</TnTekstlenke>
              </div>
              {spillerIder.map((uid) => {
                const r = t.results.find((x) => x.userId === uid);
                const spillernavn = navn.get(uid) ?? "Ukjent spiller";
                return (
                  <div key={uid} className={d.liveRad}>
                    <TnInitialer navn={spillernavn} />
                    <span style={{ minWidth: 0 }}>
                      <b style={{ display: "block", fontSize: 15, lineHeight: 1.3, overflowWrap: "anywhere" }}>{spillernavn}</b>
                      <span style={{ fontSize: 12.5, color: TN.ink500 }}>{t.location ?? "Sted ikke registrert"}</span>
                    </span>
                    <span className={d.verdi}>{r?.position ?? "—"}<small>{r?.score !== null && r?.score !== undefined ? `${r.score} slag` : "Ingen score ført"}</small></span>
                  </div>
                );
              })}
            </TnFlate>
          );
        })}
        {pagar.length === 0 ? <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen landslagsspillere er i turnering i dag, etter datoene som er registrert.</TnMangler></TnFlate> : null}
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Live-score"><TnPille>Ikke koblet til</TnPille></TnFlatehode>
        <TnFlate style={{ background: TN.ink50 }}>
          <TnMangler>Hull for hull fra turneringen hentes ikke ennå. Plassering og score over er siste registrerte resultat. Resultater legges inn etter runden og vises under Turneringer og reise.</TnMangler>
        </TnFlate>
      </section>
    </SkjermRamme>
  );
}
