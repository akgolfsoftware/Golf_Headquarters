import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSkoler } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { ER_COLLEGE, SkjermRamme, hentSkjermbruker } from "./felles";

/**
 * TN-17 Skoleoversikt.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-17.
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
  const uregistrert = skoler.find((s) => s.skole === IKKE_REGISTRERT)?.spillere.length ?? 0;
  const tall = [...[...trinn.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb")), ...(uregistrert ? [[IKKE_REGISTRERT, uregistrert] as [string, number]] : [])];

  return (
    <SkjermRamme aktiv="skoler" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/skoler" tittel="Skoleoversikt" ingress="Skole og trinn slik spillerne har registrert det i profilen. Bruk den når samlinger skal legges utenom eksamen." />

      {tall.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 1, background: TN.navy100, border: `1px solid ${TN.navy100}` }}>
          {tall.map(([etikett, antall]) => (
            <div key={etikett} style={{ background: TN.white, padding: "14px 16px", minWidth: 0 }}>
              <div style={{ fontFamily: TN.font.mono, fontSize: 26, color: etikett === IKKE_REGISTRERT ? TN.textSecondary : TN.navy900 }}>{antall}</div>
              <TnEtikett style={{ marginTop: 4, overflowWrap: "anywhere" }}>{etikett}</TnEtikett>
            </div>
          ))}
        </div>
      ) : null}

      <TnFlate>
        <TnFlatehode tittel="Skoler og trinn" merknad="Fra spillerprofilene" />
        {skoler.map((s) => (
          <div key={s.skole} style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "baseline" }}>
            <div style={{ flex: "1 1 240px", minWidth: 0, fontSize: 15, fontWeight: 700, color: s.skole === IKKE_REGISTRERT ? TN.textSecondary : TN.textPrimary, overflowWrap: "anywhere" }}>{s.skole}</div>
            <div style={{ flex: "2 1 300px", minWidth: 0, display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 14 }}>
              {s.spillere.map((p) => (
                <Link key={p.id} href={`/team-norway/spiller/${p.id}`} style={{ color: TN.textPrimary, minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {p.navn}
                  {s.skole !== IKKE_REGISTRERT ? <span style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary }}>{p.skolear ?? "—"}</span> : null}
                </Link>
              ))}
            </div>
            <span style={{ fontFamily: TN.font.mono, fontSize: 14 }}>{s.spillere.length}</span>
          </div>
        ))}
        {skoler.length === 0 ? <TnMangler>Ingen spillere i gruppen ennå. Skolene vises her når spillerne er lagt inn.</TnMangler> : null}
        <TnFotnote>
          {college > 0 ? <>{college} {college === 1 ? "spiller" : "spillere"} på college i USA står under <Link href="/team-norway/college" style={{ color: TN.navy700 }}>College og USA</Link>. </> : null}
          «Ikke registrert» er spillere uten skole i profilen. Den raden skjules ikke, så hullene i profilene synes.
        </TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
