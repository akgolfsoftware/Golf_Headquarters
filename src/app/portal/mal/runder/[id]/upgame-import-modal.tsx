"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, X, AlertTriangle, CheckCircle } from "lucide-react";
import { importUpGameShots } from "./actions";
import type { ShotInput } from "./actions";

// Kolonne-mapping: prøver kjente norske og engelske navn
const KOLONNE_MAP = {
  hullNr: ["hull", "hole", "hullnr", "nr", "hole_number", "hullnummer"],
  par: ["par"],
  score: ["score", "slag", "strokes", "total"],
  fir: ["fir", "fairway", "fairway_i_reg", "fairway i regulasjon"],
  gir: ["gir", "green", "green_i_reg", "green i regulasjon"],
  putts: ["putter", "putts", "putt"],
  forstePutt: ["første_putt", "forste_putt", "first_putt", "puttavstand", "avstand_til_hull"],
  straff: ["straff", "penalty", "penalties", "straffslag"],
  bunker: ["bunker", "sand"],
  sandSave: ["sand_save", "sandredd", "berget_fra_bunker"],
  scrambling: ["scrambling"],
  kjørelengde: ["kjørelengde", "kjøre", "driving_distance", "lengde", "drive_length"],
} as const;

type KolonneNøkkel = keyof typeof KOLONNE_MAP;

function detekterKolonne(headers: string[], nøkkel: KolonneNøkkel): string | null {
  const kandidater = KOLONNE_MAP[nøkkel] as readonly string[];
  const normaliser = (s: string) => s.toLowerCase().replace(/[^a-zæøå0-9]/g, "_");
  return (
    headers.find((h) => kandidater.includes(normaliser(h))) ?? null
  );
}

type ParsetRad = Record<string, string>;

function parseCSV(tekst: string): { headers: string[]; rader: ParsetRad[] } {
  const linjer = tekst
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim());

  if (linjer.length < 2) return { headers: [], rader: [] };

  const sep = linjer[0].includes(";") ? ";" : ",";
  const headers = linjer[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rader = linjer.slice(1).map((l) => {
    const verdier = l.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
    const rad: ParsetRad = {};
    headers.forEach((h, i) => { rad[h] = verdier[i] ?? ""; });
    return rad;
  });

  return { headers, rader };
}

function parseBool(v: string | undefined): boolean | null {
  if (!v) return null;
  const n = v.toLowerCase().trim();
  if (["ja", "j", "1", "yes", "y", "true", "x"].includes(n)) return true;
  if (["nei", "n", "0", "no", "false", "-", ""].includes(n)) return false;
  return null;
}

function konverterRaderTilShots(
  rader: ParsetRad[],
  headers: string[],
  kolMapping: Record<KolonneNøkkel, string | null>,
): { shots: ShotInput[]; advarsel: string | null } {
  const shots: ShotInput[] = [];
  const advarsel: string[] = [];

  for (const rad of rader) {
    const hullNrKol = kolMapping.hullNr;
    const parKol = kolMapping.par;
    const scoreKol = kolMapping.score;
    const puttsKol = kolMapping.putts;

    if (!hullNrKol) { advarsel.push("Mangler hull-nummer kolonne"); break; }

    const hullNr = parseInt(rad[hullNrKol] ?? "");
    if (isNaN(hullNr) || hullNr < 1 || hullNr > 18) continue;

    const par = parKol ? parseInt(rad[parKol] ?? "") : 4;
    const score = scoreKol ? parseInt(rad[scoreKol] ?? "") : NaN;
    const putts = puttsKol ? parseInt(rad[puttsKol] ?? "") : 2;
    const fir = kolMapping.fir ? parseBool(rad[kolMapping.fir]) : null;
    const straff = kolMapping.straff ? parseInt(rad[kolMapping.straff] ?? "0") || 0 : 0;
    const kjørelengde = kolMapping.kjørelengde ? parseFloat(rad[kolMapping.kjørelengde] ?? "") : null;

    if (isNaN(score)) { advarsel.push(`Hull ${hullNr}: mangler score`); continue; }

    const effektivPar = isNaN(par) ? 4 : par;
    const effektivPutts = isNaN(putts) ? 2 : putts;

    // Rekonstruer slag fra aggregatdata:
    // 1. Tee-slag (DRIVE for par 4/5, APPROACH for par 3)
    // 2. Approach-slag (score - putts - 1 approach-slag)
    // 3. Putt-slag

    let slagNr = 1;

    // Tee-slag
    if (effektivPar >= 4) {
      shots.push({
        holeNumber: hullNr,
        holePar: effektivPar,
        shotNumber: slagNr++,
        club: "Driver",
        lie: "TEE",
        distanceToPin: kjørelengde && !isNaN(kjørelengde) ? Math.round(kjørelengde) : undefined,
        distanceHit: kjørelengde && !isNaN(kjørelengde) ? Math.round(kjørelengde) : undefined,
        shotType: "DRIVE",
        lie_etter: fir === true ? "FAIRWAY" : fir === false ? "ROUGH" : "FAIRWAY",
      } as ShotInput & { lie_etter: string });
    } else {
      shots.push({
        holeNumber: hullNr,
        holePar: effektivPar,
        shotNumber: slagNr++,
        lie: "TEE",
        shotType: "APPROACH",
      });
    }

    // Mellom-slag (approach/chip)
    const mellomSlag = score - effektivPutts - (effektivPar >= 4 ? 1 : 1);
    for (let i = 0; i < Math.max(0, mellomSlag); i++) {
      shots.push({
        holeNumber: hullNr,
        holePar: effektivPar,
        shotNumber: slagNr++,
        lie: i === mellomSlag - 1 ? "FAIRWAY" : "FAIRWAY",
        shotType: mellomSlag > 1 && i < mellomSlag - 1 ? "APPROACH" : "CHIP",
      });
    }

    // Putter
    for (let i = 0; i < Math.max(0, effektivPutts); i++) {
      shots.push({
        holeNumber: hullNr,
        holePar: effektivPar,
        shotNumber: slagNr++,
        lie: "GREEN",
        shotType: "PUTT",
      });
    }

    // Straffslag
    if (straff > 0) {
      shots.push({
        holeNumber: hullNr,
        holePar: effektivPar,
        shotNumber: slagNr++,
        lie: "FAIRWAY",
        shotType: "DROP",
        isPenalty: true,
        notes: `${straff} straffslag fra UpGame`,
      });
    }
  }

  return { shots, advarsel: advarsel.length > 0 ? advarsel.join("; ") : null };
}

export function UpGameImportModal({ roundId }: { roundId: string }) {
  const [åpen, setÅpen] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rader, setRader] = useState<ParsetRad[]>([]);
  const [kolMapping, setKolMapping] = useState<Record<KolonneNøkkel, string | null>>({
    hullNr: null, par: null, score: null, fir: null, gir: null, putts: null,
    forstePutt: null, straff: null, bunker: null, sandSave: null,
    scrambling: null, kjørelengde: null,
  });
  const [steg, setSteg] = useState<"last-opp" | "kartlegg" | "ferdig">("last-opp");
  const [advarsel, setAdvarsel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const filRef = useRef<HTMLInputElement>(null);

  function lukkModal() {
    setÅpen(false);
    setHeaders([]);
    setRader([]);
    setSteg("last-opp");
    setAdvarsel(null);
  }

  function lastOppFil(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const tekst = ev.target?.result as string;
      const { headers: h, rader: r } = parseCSV(tekst);
      setHeaders(h);
      setRader(r);

      // Auto-deteksjon av kolonner
      const auto: Record<KolonneNøkkel, string | null> = {} as Record<KolonneNøkkel, string | null>;
      for (const nøkkel of Object.keys(KOLONNE_MAP) as KolonneNøkkel[]) {
        const detektert = detekterKolonne(h, nøkkel);
        auto[nøkkel] = detektert;
      }
      setKolMapping(auto);
      setSteg("kartlegg");
    };
    reader.readAsText(f, "utf-8");
  }

  function importer() {
    const { shots, advarsel: a } = konverterRaderTilShots(rader, headers, kolMapping);
    if (shots.length === 0) {
      setAdvarsel("Ingen gyldige hull funnet i CSV-filen. Sjekk at hull-nummer-kolonnen er riktig kartlagt.");
      return;
    }
    setAdvarsel(a);

    startTransition(async () => {
      try {
        await importUpGameShots(roundId, shots);
        setSteg("ferdig");
      } catch {
        setAdvarsel("Import feilet. Prøv igjen.");
      }
    });
  }

  const nøkkelLabels: Record<KolonneNøkkel, string> = {
    hullNr: "Hull-nummer *",
    par: "Par",
    score: "Score (totalt slag) *",
    fir: "FIR (fairway hit)",
    gir: "GIR (green i reg.)",
    putts: "Antall putter",
    forstePutt: "Første putt-avstand",
    straff: "Straffslag",
    bunker: "Bunker (ja/nei)",
    sandSave: "Sand save",
    scrambling: "Scrambling",
    kjørelengde: "Kjørelengde (m)",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setÅpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary"
      >
        <Upload className="h-3.5 w-3.5" />
        Importer fra UpGame
      </button>

      {åpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  UpGame CSV-import
                </div>
                <div className="mt-0.5 font-display text-lg font-semibold text-foreground">
                  Importer runde fra UpGame
                </div>
              </div>
              <button type="button" onClick={lukkModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {steg === "last-opp" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Eksporter runden fra UpGame som CSV og last den opp her. Systemet prøver å
                    detektere kolonner automatisk — du kan justere kartleggingen manuelt om nødvendig.
                  </p>
                  <input
                    ref={filRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={lastOppFil}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => filRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    <Upload className="h-5 w-5" />
                    Velg CSV-fil fra UpGame
                  </button>
                </div>
              )}

              {steg === "kartlegg" && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Filen inneholder <strong className="text-foreground">{rader.length} rader</strong> og{" "}
                      <strong className="text-foreground">{headers.length} kolonner</strong>.
                      Felter med * er obligatoriske.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(Object.keys(nøkkelLabels) as KolonneNøkkel[]).map((nøkkel) => (
                      <div key={nøkkel} className="flex items-center gap-4">
                        <div className="w-44 shrink-0 font-mono text-[11px] text-foreground">
                          {nøkkelLabels[nøkkel]}
                        </div>
                        <select
                          value={kolMapping[nøkkel] ?? ""}
                          onChange={(e) =>
                            setKolMapping((prev) => ({
                              ...prev,
                              [nøkkel]: e.target.value || null,
                            }))
                          }
                          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
                        >
                          <option value="">— ikke tilgjengelig —</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        {kolMapping[nøkkel] && (
                          <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>

                  {advarsel && (
                    <div className="flex items-start gap-2 rounded-lg border border-[rgba(184,133,42,0.4)] bg-[rgba(184,133,42,0.08)] px-4 py-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <p className="font-mono text-[11px] text-warning">{advarsel}</p>
                    </div>
                  )}

                  {/* Forhåndsvisning */}
                  {rader.length > 0 && (
                    <div className="overflow-x-auto">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        Forhåndsvisning (3 første rader)
                      </p>
                      <table className="min-w-full border-collapse text-xs">
                        <thead>
                          <tr>
                            {headers.map((h) => (
                              <th key={h} className="border border-border px-2 py-1 text-left font-mono text-[10px] text-muted-foreground">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rader.slice(0, 3).map((r, i) => (
                            <tr key={i}>
                              {headers.map((h) => (
                                <td key={h} className="border border-border px-2 py-1 font-mono text-[11px]">
                                  {r[h]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {steg === "ferdig" && (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-primary" />
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">Import fullført</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Slagene er lagt inn. Lukk for å se statistikken.
                    </p>
                  </div>
                  {advarsel && (
                    <p className="font-mono text-[11px] text-warning">{advarsel}</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={lukkModal}
                className="h-9 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
              >
                {steg === "ferdig" ? "Lukk" : "Avbryt"}
              </button>
              {steg === "kartlegg" && (
                <button
                  type="button"
                  onClick={importer}
                  disabled={isPending || !kolMapping.hullNr || !kolMapping.score}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {isPending ? "Importerer…" : `Importer ${rader.length} hull`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
