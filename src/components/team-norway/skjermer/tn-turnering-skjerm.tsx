import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSpillere, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker, periode } from "./felles";

/**
 * TN-07 med valgt turnering: dato, sted og hver landslagsspillers påmelding og resultat.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-07.
 *
 * Avvik:
 *   - Designet har ingen egen turneringsside. Den er lagt til (Anders 27.09.2026)
 *     så turneringer i lister og kalendere kan åpnes.
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

  return (
    <SkjermRamme aktiv="turneringer" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        rute={`/team-norway/turneringer/${t.id}`}
        tittel={t.name}
        ingress={`${t.startDate ? periode(t.startDate, t.endDate ?? t.startDate, true) : "Dato ikke registrert"} · ${t.location ?? "Sted ikke registrert"}`}
        handling={<Link href="/team-norway/turneringer" style={{ color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center" }}>Alle turneringer</Link>}
      />

      <TnFlate>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 1, background: TN.navy100, border: `1px solid ${TN.navy100}` }}>
          {[
            ["Spillere", String(rader.length)],
            ["Med resultat", String(t.results.length)],
            ["Kilde", resultatKilde(t.sourceOrigin)],
          ].map(([etikett, verdi]) => (
            <div key={etikett} style={{ background: TN.white, padding: "12px 14px", minWidth: 0 }}>
              <div style={{ fontFamily: TN.font.mono, fontSize: 20, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{verdi}</div>
              <TnEtikett style={{ marginTop: 4 }}>{etikett}</TnEtikett>
            </div>
          ))}
        </div>
      </TnFlate>

      <TnFlate>
        <TnFlatehode tittel="Landslagsspillere" merknad="PLASS · SCORE" />
        {rader.map((r) => (
          <div key={r.uid} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: "6px 18px", alignItems: "baseline", padding: "8px 0", borderBottom: `1px solid ${TN.navy100}` }}>
            <div style={{ minWidth: 0 }}>
              {data.kontekst.erSpiller ? (
                <div style={{ fontSize: 14.5, fontWeight: 700, minHeight: 44, display: "flex", alignItems: "center" }}>{r.navn}</div>
              ) : (
                <Link href={`/team-norway/spiller/${r.uid}/oversikt`} style={{ fontSize: 14.5, fontWeight: 700, color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center", overflowWrap: "anywhere" }}>{r.navn}</Link>
              )}
              <div style={{ fontSize: 13, color: TN.textSecondary }}>{r.pamelding ? resultatStatus(r.pamelding.entryStatus) : "Resultat registrert"}</div>
            </div>
            <span style={{ fontFamily: TN.font.mono, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{r.resultat?.position ?? "—"}</span>
            <span style={{ fontFamily: TN.font.mono, fontSize: 14, color: TN.textSecondary, minWidth: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.resultat?.score ?? "—"}</span>
          </div>
        ))}
        {rader.length === 0 ? <TnMangler>Ingen spillere i gruppen er påmeldt eller har resultat i denne turneringen.</TnMangler> : null}
        <TnFotnote>Plass og score står slik de er registrert. Mangler et tall, står det en strek.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
