import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSpillere, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";
import { TN } from "@/lib/v2/team-norway";
import { TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnStortTall } from "../tn-grunnmur";
import { TnBildekort, TnBildekortKilde } from "../tn-stall";
import { SkjermRamme, hentSkjermbruker, periode } from "./felles";
import d from "./tn-daglig.module.css";

/**
 * TN-07 med valgt turnering: dato, sted og hver landslagsspillers påmelding og resultat.
 * Utkast 2, retning B (godkjent 16.10.2026): bildekort med beste landslagsspiller øverst.
 * Fasit: docs/design-system/utkast-tn/daglig.html, skjerm Én turnering (pakke 2).
 *
 * Avvik:
 *   - Score per runde og til par finnes ikke i turneringsdataene her. Raden viser
 *     plass og total brutto slik de er registrert.
 *   - Reise (avreise, overnatting, ansvarlig) har ingen felt i koden og vises ikke
 *     (README utkast-tn, spørsmål 2). Knappene «Før resultat», «Endre» og «Slett»
 *     fra tegningen er ikke med: turneringen kommer fra katalogen eller spillerens plan.
 *   - Turneringsdata kommer fra katalogen og resultatkildene, og endres ikke
 *     her. Spilleren endrer sin egen manuelle oppføring i PlayerHQ.
 */
export async function TnTurneringSkjerm({ id }: { id: string }) {
  const bruker = await hentSkjermbruker();
  const [data, spillerside] = await Promise.all([hentTnTurneringer(bruker), hentTnSpillere(bruker)]);
  if (!data) notFound();
  const t = data.turneringer.find((x) => x.id === id);
  if (!t) notFound();

  const navn = new Map((spillerside?.rader ?? []).map((r) => [r.id, r.navn]));
  const spillerIder = [...new Set([...t.entries.map((e) => e.userId), ...t.results.map((r) => r.userId)])];
  const rader = spillerIder
    .map((uid) => ({ uid, navn: navn.get(uid) ?? "Ukjent spiller", pamelding: t.entries.find((e) => e.userId === uid), resultat: t.results.find((r) => r.userId === uid) }))
    .sort((a, b) => (a.resultat?.position ?? Infinity) - (b.resultat?.position ?? Infinity) || a.navn.localeCompare(b.navn, "nb"));

  const beste = rader.find((r) => r.resultat?.position != null) ?? null;
  const naa = new Date().getTime();
  const pagar = t.startDate !== null && t.startDate.getTime() <= naa && (t.endDate ?? t.startDate).getTime() + 864e5 >= naa;
  const flertall = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

  return (
    <SkjermRamme aktiv="turneringer" brukerNavn={bruker.name} kontekst={data.kontekst} tilbake={{ href: "/team-norway/turneringer", label: "Turneringer" }}>
      <TnSkjermhode
        overlinje={`${t.startDate ? periode(t.startDate, t.endDate ?? t.startDate, true) : "Dato ikke registrert"} · ${t.location ?? "Sted ikke registrert"}`}
        tittel={t.name}
        ingress={`Kilde: ${resultatKilde(t.sourceOrigin)}. Resultater er brutto.`}
      />

      <TnBildekort bilde="/team-norway/bilder/tee-hand.jpg" alt="Ballen legges på tee før utslag" side>
        <TnBildekortKilde>Beste landslagsspiller</TnBildekortKilde>
        <TnStortTall verdi={beste?.resultat?.position ?? "—"}>
          <span style={{ fontSize: 14.5, color: TN.ink700, overflowWrap: "anywhere" }}>{beste ? `plass · ${beste.navn}${beste.resultat?.score != null ? `, ${beste.resultat.score} slag` : ""}` : "Ingen plassering er registrert ennå"}</span>
        </TnStortTall>
        <span style={{ fontSize: 14.5, lineHeight: 1.55, color: TN.ink700 }}>{pagar ? `${flertall(rader.length, "landslagsspiller er", "landslagsspillere er")} med. Turneringen pågår.` : `${flertall(rader.length, "landslagsspiller", "landslagsspillere")} fra gruppen, ${t.results.length} med resultat.`}</span>
      </TnBildekort>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Landslagsspillere" merknad="Plass · brutto" />
        <TnFlate>
          <div className={d.res}>
            {rader.map((r) => (
              <div key={r.uid} className={d.resRad}>
                <span className={d.plass}>{r.resultat?.position ?? "—"}</span>
                {data.kontekst.erSpiller ? (
                  <span className={d.navn}>{r.navn}</span>
                ) : (
                  <Link href={`/team-norway/spiller/${r.uid}/oversikt`} className={d.navn} style={{ color: TN.ink900, minHeight: 44, display: "inline-flex", alignItems: "center", textUnderlineOffset: 4 }}>{r.navn}</Link>
                )}
                <span className={d.tot}>{r.resultat?.score ?? "—"}</span>
                <span className={d.status}>{r.pamelding ? resultatStatus(r.pamelding.entryStatus) : "Resultat registrert"}</span>
              </div>
            ))}
          </div>
          {rader.length === 0 ? <TnMangler>Ingen spillere i gruppen er påmeldt eller har resultat i denne turneringen.</TnMangler> : null}
          <TnFotnote>Plass og score står slik de er registrert. Mangler et tall, står det en strek.</TnFotnote>
        </TnFlate>
      </section>

      <TnTekstlenke href="/team-norway/turneringer">Alle turneringer</TnTekstlenke>
    </SkjermRamme>
  );
}
