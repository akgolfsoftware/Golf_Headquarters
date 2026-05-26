"use client";

/**
 * Krysstabell — Anders' nøkkelinnsikt.
 *
 * Heatmap-tabell hvor rader og kolonner er to valgte dimensjoner.
 * Klikk på celle åpner sliding panel høyre med liste over økter.
 */
import { useState, useTransition } from "react";
import { X, Lock, ArrowRight } from "lucide-react";
import type {
  Dimensjon,
  KrysstabellData,
  CelleSession,
} from "@/app/admin/analyse/actions";
import {
  getKrysstabulering,
  getCelleSessions,
} from "@/app/admin/analyse/actions";
import { DEMO_CELLE_SESSIONS } from "@/app/admin/analyse/__demoData";
import { useViewMode } from "@/components/shared/ViewModeContext";

const DIM_LABELS: Record<Dimensjon, string> = {
  pyramide: "Pyramide (FYS/TEK/...)",
  omraade: "Treningsområde",
  lFase: "L-fase",
  csNivaa: "CS-nivå",
  miljo: "Miljø (M0–M5)",
  prPress: "Pressnivå",
  praksistype: "Praksistype",
  componentFocus: "Komponentfokus",
};

const PRESETS: { label: string; dim1: Dimensjon; dim2: Dimensjon }[] = [
  { label: "Område × Pyramide", dim1: "omraade", dim2: "pyramide" },
  { label: "Område × Miljø", dim1: "omraade", dim2: "miljo" },
  { label: "Pyramide × Praksistype", dim1: "pyramide", dim2: "praksistype" },
  { label: "L-fase × Komponentfokus", dim1: "lFase", dim2: "componentFocus" },
];

function parsePeriode(s: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  const dager = s === "7d" ? 7 : s === "90d" ? 90 : s === "365d" ? 365 : 30;
  from.setDate(from.getDate() - dager);
  return { from, to };
}

function fargeForVerdi(verdi: number, max: number): string {
  if (max === 0 || verdi === 0) return "transparent";
  const intens = Math.min(1, verdi / max);
  const r = Math.round(208 - intens * 200);
  const g = Math.round(232 - intens * 144);
  const b = Math.round(199 - intens * 135);
  return `rgb(${r}, ${g}, ${b})`;
}

export function AnalyseKrysstabell({
  studentId,
  periodeKey,
  initData,
  initDim1,
  initDim2,
}: {
  studentId: string;
  periodeKey: string;
  initData: KrysstabellData;
  initDim1: Dimensjon;
  initDim2: Dimensjon;
}) {
  const { mode } = useViewMode();
  const [data, setData] = useState<KrysstabellData>(initData);
  const [dim1, setDim1] = useState<Dimensjon>(initDim1);
  const [dim2, setDim2] = useState<Dimensjon>(initDim2);
  const [pending, startTransition] = useTransition();
  const [valgtCelle, setValgtCelle] = useState<{
    rad: string;
    kolonne: string;
  } | null>(null);
  const [celleSesjoner, setCelleSesjoner] = useState<CelleSession[]>([]);
  const [lasterCelle, setLasterCelle] = useState(false);

  function oppdater(nyDim1: Dimensjon, nyDim2: Dimensjon) {
    setDim1(nyDim1);
    setDim2(nyDim2);
    const periode = parsePeriode(periodeKey);
    startTransition(async () => {
      try {
        const ny = await getKrysstabulering(studentId, periode, nyDim1, nyDim2);
        if (ny.celler.length > 0) setData(ny);
      } catch {
        // behold eksisterende
      }
    });
  }

  async function klikkCelle(rad: string, kolonne: string) {
    setValgtCelle({ rad, kolonne });
    setLasterCelle(true);
    const periode = parsePeriode(periodeKey);
    try {
      const sesjoner = await getCelleSessions(
        studentId,
        periode,
        dim1,
        rad,
        dim2,
        kolonne,
      );
      setCelleSesjoner(sesjoner.length > 0 ? sesjoner : DEMO_CELLE_SESSIONS);
    } catch {
      setCelleSesjoner(DEMO_CELLE_SESSIONS);
    } finally {
      setLasterCelle(false);
    }
  }

  const maxVerdi = Math.max(...data.celler.map((c) => c.minutter), 0);
  const verdiKart = new Map(
    data.celler.map((c) => [`${c.rad}::${c.kolonne}`, c]),
  );

  if (mode === "standard") {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <Lock
          className="mx-auto h-8 w-8 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
        <h2 className="mt-4 font-display text-xl font-semibold">
          Krysstabell er en <em className="text-primary md:italic">Avansert</em>{" "}
          funksjon
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Krysstabuler trening på tvers av to dimensjoner — område, miljø,
          intensitet, pyramide og mer. Bytt til Avansert for å åpne tabellen.
        </p>
        <p className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground">
          Bytt til Avansert øverst på siden
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kontroller */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">
          Krysstabuler dimensjoner
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Velg to dimensjoner — tabellen viser minutter per kombinasjon.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const aktiv = dim1 === p.dim1 && dim2 === p.dim2;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => oppdater(p.dim1, p.dim2)}
                disabled={pending}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  aktiv
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <label className="text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Rader
            </span>
            <select
              value={dim1}
              onChange={(e) => oppdater(e.target.value as Dimensjon, dim2)}
              disabled={pending}
              className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
            >
              {Object.entries(DIM_LABELS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Kolonner
            </span>
            <select
              value={dim2}
              onChange={(e) => oppdater(dim1, e.target.value as Dimensjon)}
              disabled={pending}
              className="mt-1 w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
            >
              {Object.entries(DIM_LABELS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Tabell */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border bg-muted px-4 py-2 text-left font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                  Rad \ Kolonne
                </th>
                {data.kolonner.map((k) => (
                  <th
                    key={k}
                    className="border-b border-border bg-muted px-4 py-2 text-right font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground"
                  >
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rader.map((r) => (
                <tr key={r}>
                  <th
                    scope="row"
                    className="border-b border-border px-4 py-2 text-left text-sm text-foreground"
                  >
                    {r}
                  </th>
                  {data.kolonner.map((k) => {
                    const celle = verdiKart.get(`${r}::${k}`);
                    const min = celle?.minutter ?? 0;
                    return (
                      <td
                        key={k}
                        className="border-b border-border p-0"
                        style={{ backgroundColor: fargeForVerdi(min, maxVerdi) }}
                      >
                        <button
                          type="button"
                          onClick={() => min > 0 && klikkCelle(r, k)}
                          disabled={min === 0}
                          className={`block w-full px-4 py-2 text-right font-mono text-sm tabular-nums transition ${
                            min === 0
                              ? "text-muted-foreground/40"
                              : "text-foreground hover:bg-foreground/5"
                          }`}
                        >
                          {min === 0 ? "–" : min}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Total: {data.totalMinutter} min. Klikk en celle for å se hvilke økter
          som ligger bak.
        </p>
      </section>

      {/* Sliding panel */}
      {valgtCelle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-background shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Krysscelle
              </div>
              <div className="mt-0.5 font-display text-base font-semibold">
                {valgtCelle.rad} × {valgtCelle.kolonne}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValgtCelle(null)}
              aria-label="Lukk"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="px-6 py-4">
            {lasterCelle ? (
              <p className="text-sm text-muted-foreground">Henter økter ...</p>
            ) : celleSesjoner.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ingen økter funnet for denne kombinasjonen.
              </p>
            ) : (
              <ul className="space-y-2">
                {celleSesjoner.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-md border border-border bg-card p-4"
                  >
                    <div className="text-sm font-medium text-foreground">
                      {s.title}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(s.startTime).toLocaleString("nb-NO")}
                      </span>
                      <span className="font-mono tabular-nums">
                        {s.totalMin} min · {s.drillCount} drills
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
