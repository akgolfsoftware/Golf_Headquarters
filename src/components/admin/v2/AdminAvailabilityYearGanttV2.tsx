import { T } from "@/components/v2";

/**
 * År-Gantt for tilgjengelighet, v2-port 16. juli 2026. Viser hvert ukentlige
 * tidsvindu som en bjelke over de 12 månedene i valgt år. Ren presentasjon —
 * ingen actions. Samme utledningslogikk (aarsAndel) uendret.
 */

const MND_KORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const TONER = [T.up, T.info, T.warn, T.lime];

export type YearWindow = {
  id: string;
  locationName: string | null;
  label: string;
  validFrom: Date | null;
  validTo: Date | null;
};

function aarsAndel(d: Date | null, kant: 0 | 1, year: number): number {
  if (!d) return kant;
  if (d.getFullYear() < year) return 0;
  if (d.getFullYear() > year) return 1;
  const start = new Date(year, 0, 1).getTime();
  const slutt = new Date(year + 1, 0, 1).getTime();
  return Math.min(1, Math.max(0, (d.getTime() - start) / (slutt - start)));
}

export function AvailabilityYearGanttV2({ year, windows }: { year: number; windows: YearWindow[] }) {
  const grupper = new Map<string, YearWindow[]>();
  for (const w of windows) {
    const navn = w.locationName ?? "Alle steder";
    if (!grupper.has(navn)) grupper.set(navn, []);
    grupper.get(navn)!.push(w);
  }
  const anleggsNavn = Array.from(grupper.keys());
  const toneFor = (navn: string) => TONER[anleggsNavn.indexOf(navn) % TONER.length];

  return (
    <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, background: T.panel, padding: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{year}</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)" }}>
          {MND_KORT.map((mnd, i) => (
            <span key={i} style={{ textAlign: "center", fontFamily: T.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: T.mut }}>{mnd}</span>
          ))}
        </div>
      </div>

      {windows.length === 0 ? (
        <p style={{ fontSize: 13, color: T.mut, margin: 0 }}>
          Ingen ukentlige tidsvinduer satt. Legg til vinduer med periode for å se dem fordelt over året.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {anleggsNavn.map((navn) => (
            <div key={navn}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: toneFor(navn) }} />
                <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{navn}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {grupper.get(navn)!.map((w) => {
                  const fra = aarsAndel(w.validFrom, 0, year);
                  const til = aarsAndel(w.validTo, 1, year);
                  const bredde = Math.max(0.02, til - fra);
                  return (
                    <div key={w.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center", gap: 12 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.mono, fontSize: 11, color: T.mut }}>{w.label}</span>
                      <div style={{ position: "relative", height: 20, borderRadius: 6, background: T.panel2 }}>
                        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(12, 1fr)" }}>
                          {MND_KORT.map((_, i) => (
                            <span key={i} style={{ borderLeft: i === 0 ? "none" : `1px solid color-mix(in srgb, ${T.border} 60%, transparent)` }} />
                          ))}
                        </div>
                        <div
                          title={w.label}
                          style={{ position: "absolute", top: 3, bottom: 3, borderRadius: 4, background: toneFor(navn), left: `${fra * 100}%`, width: `${bredde * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontFamily: T.mono, fontSize: 9, letterSpacing: "0.06em", color: T.mut }}>
        Bjelker uten satt periode spenner hele året. Sett «Begrens til periode» i et tidsvindu for å avgrense det til en sesong.
      </div>
    </div>
  );
}
