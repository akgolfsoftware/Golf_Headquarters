"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, X, AlertTriangle, CheckCircle } from "lucide-react";
import { importUpGameHoleScores } from "./actions";
import {
  KOLONNE_MAP,
  type KolonneNøkkel,
  type ParsetRad,
  detekterKolonne,
  parseCSV,
  konverterRaderTilHoleScores,
} from "@/lib/runde-logg/upgame-parse";

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
    const { hull, advarsel: a } = konverterRaderTilHoleScores(rader, kolMapping);
    if (hull.length === 0) {
      setAdvarsel("Ingen gyldige hull funnet i CSV-filen. Sjekk at hull-nummer-kolonnen er riktig kartlagt.");
      return;
    }
    setAdvarsel(a);

    startTransition(async () => {
      try {
        const res = await importUpGameHoleScores(roundId, hull);
        if (res.ok) setSteg("ferdig");
        else setAdvarsel(res.error ?? "Import feilet. Prøv igjen.");
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
                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-secondary/40 px-4 py-2">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Filen inneholder <strong className="text-foreground">{rader.length} rader</strong> og{" "}
                      <strong className="text-foreground">{headers.length} kolonner</strong>.
                      Felter med * er obligatoriske.
                    </p>
                  </div>

                  <div className="space-y-2">
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
                          className="flex-1 rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
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
                    <div className="flex items-start gap-2 rounded-lg border border-[rgba(184,133,42,0.4)] bg-[rgba(184,133,42,0.08)] px-4 py-2">
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
                      Score, putter og FIR/GIR per hull er lagt inn. Strokes Gained krever
                      slag-for-slag-kjede — fullfør kjeden fra rundesiden når du vil ha SG.
                    </p>
                  </div>
                  {advarsel && (
                    <p className="font-mono text-[11px] text-warning">{advarsel}</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
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
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
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
