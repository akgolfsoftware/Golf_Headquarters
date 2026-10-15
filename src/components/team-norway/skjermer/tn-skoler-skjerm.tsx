import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSkoler } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler, TnSkjermhode } from "../tn-flate";
import { ER_COLLEGE, SkjermRamme, hentSkjermbruker } from "./felles";

/**
 * TN-17 Skoleoversikt.
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm Skoler (pakke 3).
 * Skoler med færre enn tre spillere slås sammen til én rad uten navn, så ingen
 * mindreårig kan pekes ut av skolen alene. Spillerne finnes i Spillerutvikling.
 *
 * Avvik:
 *   - Skoletype (videregående / høyere utdanning) er ikke eget felt. Filtrene
 *     er tatt bort; tallene øverst er trinnene slik de står i profilene.
 */

const IKKE_REGISTRERT = "Ikke registrert";

export async function TnSkolerSkjerm() {
  const bruker = await hentSkjermbruker();
  const data = await hentTnSkoler(bruker);
  if (!data || data.kontekst.erSpiller) notFound();

  const skoler = data.skoler
    .map((s) => ({ ...s, spillere: s.spillere.filter((p) => !ER_COLLEGE.test(p.skole ?? "")) }))
    .filter((s) => s.spillere.length > 0)
    .sort((a, b) => (a.skole === IKKE_REGISTRERT ? 1 : b.skole === IKKE_REGISTRERT ? -1 : a.skole.localeCompare(b.skole, "nb")));
  const college = data.skoler.flatMap((s) => s.spillere).filter((p) => ER_COLLEGE.test(p.skole ?? "")).length;

  const trinn = new Map<string, number>();
  for (const s of skoler) {
    if (s.skole === IKKE_REGISTRERT) continue;
    for (const p of s.spillere) {
      const t = p.skolear?.trim() || "Trinn ikke registrert";
      trinn.set(t, (trinn.get(t) ?? 0) + 1);
    }
  }
  // Små skoler (under tre spillere) vises samlet og uten navn. «Ikke registrert» vises alltid, så hullene i profilene synes.
  const store = skoler.filter((s) => s.skole === IKKE_REGISTRERT || s.spillere.length >= 3);
  const sma = skoler.filter((s) => s.skole !== IKKE_REGISTRERT && s.spillere.length < 3);
  const trinnTekst = (spillere: { skolear: string | null }[]) => {
    const m = new Map<string, number>();
    for (const p of spillere) m.set(p.skolear?.trim() || "trinn —", (m.get(p.skolear?.trim() || "trinn —") ?? 0) + 1);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb")).map(([t, n]) => `${t} ${n}`).join(" · ");
  };
  const uregistrert = skoler.find((s) => s.skole === IKKE_REGISTRERT)?.spillere.length ?? 0;
  const tall = [...[...trinn.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb")), ...(uregistrert ? [[IKKE_REGISTRERT, uregistrert] as [string, number]] : [])];

  return (
    <SkjermRamme aktiv="skoler" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode overlinje="Fra spillerprofilene" tittel="Skoleoversikt" ingress="Skole og trinn slik spillerne har registrert det i profilen. Bruk den når samlinger skal legges utenom eksamen." />

      {tall.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 1, background: TN.ink200, border: `1px solid ${TN.ink200}` }}>
          {tall.map(([etikett, antall]) => (
            <div key={etikett} style={{ background: TN.white, padding: "14px 16px", minWidth: 0 }}>
              <div style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 30, lineHeight: 1.05, color: etikett === IKKE_REGISTRERT ? TN.ink500 : TN.navy900 }}>{antall}</div>
              <TnEtikett style={{ marginTop: 4, overflowWrap: "anywhere" }}>{etikett}</TnEtikett>
            </div>
          ))}
        </div>
      ) : null}

      <TnFlate>
        <TnFlatehode tittel="Skoler og trinn" merknad={`${skoler.reduce((n, s) => n + s.spillere.length, 0)} spillere, ${skoler.filter((s) => s.skole !== IKKE_REGISTRERT).length} skoler`} />
        {store.map((s) => (
          <TnListerad
            key={s.skole}
            tittel={<span style={{ color: s.skole === IKKE_REGISTRERT ? TN.ink500 : TN.ink900 }}>{s.skole}</span>}
            tekst={<>
              {trinnTekst(s.spillere)}
              <span style={{ display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
                {s.spillere.map((p) => <Link key={p.id} href={`/team-norway/spiller/${p.id}/oversikt`} style={{ color: TN.navy600, fontWeight: 700, minHeight: 44, display: "inline-flex", alignItems: "center", textUnderlineOffset: 4 }}>{p.navn}</Link>)}
              </span>
            </>}
            hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 15 }}>{s.spillere.length}</span>}
          />
        ))}
        {sma.length > 0 ? (
          <TnListerad
            tittel={`${sma.length} ${sma.length === 1 ? "annen skole" : "andre skoler"}`}
            tekst="Færre enn tre spillere per skole, vises ikke enkeltvis."
            hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 15 }}>{sma.reduce((n, s) => n + s.spillere.length, 0)}</span>}
          />
        ) : null}
        {skoler.length === 0 ? <TnMangler>Ingen spillere i gruppen ennå. Skolene vises her når spillerne er lagt inn.</TnMangler> : null}
        <TnFotnote>
          {college > 0 ? <>{college} {college === 1 ? "spiller" : "spillere"} på college i USA står under <Link href="/team-norway/college" style={{ color: TN.navy600, fontWeight: 700 }}>College og USA</Link>. </> : null}
          «Ikke registrert» er spillere uten skole i profilen. Den raden skjules ikke, så hullene i profilene synes.
        </TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
