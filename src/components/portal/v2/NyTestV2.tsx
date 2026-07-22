"use client";

/**
 * PlayerHQ · Ny test — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PyramidArea } from "@/generated/prisma/client";
import { useToast } from "@/components/shared/toast-provider";
import { logTest } from "@/app/portal/tren/tester/ny/actions";
import {
  T,
  Caps,
  Kort,
  Knapp,
  Inndata,
  Velger,
  TekstOmraade,
  Bryter,
  ProgresjonsBar,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";

type TestDef = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  description: string | null;
};

type Props = {
  tests: TestDef[];
  sistePerTest: Record<string, { score: number; takenAt: string }>;
  spillerNavn: string;
};

// Test-katalog som styrer hvilke metrikker hvert valg krever. Kobles til
// TestDefinition via fuzzy navn-match (case-insensitive contains).
type MetricDef = {
  key: string;
  label: string;
  unit: string;
  step?: number;
  primary?: boolean; // brukes som score-verdi
};

type Katalog = {
  slug: string;
  navn: string;
  beskrivelse: string;
  matchTokens: string[];
  /** Ikon-navn i v2-kartet (Icon fra @/components/v2/icon). */
  ikon: string;
  metrics: MetricDef[];
};

const KATALOG: Katalog[] = [
  {
    slug: "cmj",
    navn: "CMJ (Countermovement Jump)",
    beskrivelse: "Eksplosiv kraft i underkropp — standard fys-test.",
    matchTokens: ["cmj", "countermovement"],
    ikon: "chevron-up",
    metrics: [
      { key: "hoydeCm", label: "Hopp-høyde", unit: "cm", step: 0.1, primary: true },
      { key: "kraftN", label: "Kraft-toppunkt", unit: "N", step: 1 },
      { key: "reaksjonMs", label: "Kontakt-tid", unit: "ms", step: 1 },
    ],
  },
  {
    slug: "vertikalt-hopp",
    navn: "Vertikalt hopp",
    beskrivelse: "Maks hopp uten armsving.",
    matchTokens: ["vertikalt", "vertical"],
    ikon: "arrow-up",
    metrics: [
      { key: "hoydeCm", label: "Max hopp", unit: "cm", step: 0.1, primary: true },
    ],
  },
  {
    slug: "60m-sprint",
    navn: "60m sprint",
    beskrivelse: "Akselerasjon og toppfart over 60 meter.",
    matchTokens: ["sprint", "60m"],
    ikon: "activity",
    metrics: [
      { key: "tidSek", label: "Total tid", unit: "s", step: 0.01, primary: true },
      { key: "split30", label: "Split 30m", unit: "s", step: 0.01 },
    ],
  },
  {
    slug: "putting-konsistens",
    navn: "Putting-konsistens",
    beskrivelse: "10 putts à 3 meter — registrer distanse-feil i cm.",
    matchTokens: ["putt", "putting"],
    ikon: "target",
    metrics: Array.from({ length: 10 }, (_, i) => ({
      key: `putt${i + 1}`,
      label: `Putt ${i + 1}`,
      unit: "cm",
      step: 1,
    })),
  },
  {
    slug: "putting-prosent",
    navn: "Putting-prosent (1–5 m)",
    beskrivelse: "Andel innslag fra fem forskjellige distanser.",
    matchTokens: ["putt-prosent", "innslag"],
    ikon: "activity",
    metrics: [
      { key: "p1m", label: "1 meter", unit: "%", step: 1, primary: true },
      { key: "p2m", label: "2 meter", unit: "%", step: 1 },
      { key: "p3m", label: "3 meter", unit: "%", step: 1 },
      { key: "p4m", label: "4 meter", unit: "%", step: 1 },
      { key: "p5m", label: "5 meter", unit: "%", step: 1 },
    ],
  },
  {
    slug: "sg-putt",
    navn: "SG Putt-test",
    beskrivelse: "10 putts — oppgi oppdrag- og resultat-distanse.",
    matchTokens: ["sg putt", "sg-putt", "strokes gained"],
    ikon: "activity",
    metrics: Array.from({ length: 10 }, (_, i) => ({
      key: `putt${i + 1}Dist`,
      label: `Putt ${i + 1} resultat`,
      unit: "cm",
      step: 1,
    })),
  },
  {
    slug: "wedge-matrix",
    navn: "Wedge Matrix",
    beskrivelse: "Snitt-treff fra 30/50/70/90 m.",
    matchTokens: ["wedge", "matrix"],
    ikon: "circle-dot",
    metrics: [
      { key: "w30", label: "30m snitt-feil", unit: "m", step: 0.1, primary: true },
      { key: "w50", label: "50m snitt-feil", unit: "m", step: 0.1 },
      { key: "w70", label: "70m snitt-feil", unit: "m", step: 0.1 },
      { key: "w90", label: "90m snitt-feil", unit: "m", step: 0.1 },
    ],
  },
  {
    slug: "trackman-combine",
    navn: "TrackMan Combine",
    beskrivelse: "Standard 60-slag combine-score.",
    matchTokens: ["combine", "trackman"],
    ikon: "activity",
    metrics: [
      { key: "score", label: "Combine-score", unit: "/100", step: 0.1, primary: true },
    ],
  },
  {
    slug: "t-test",
    navn: "T-test (agility)",
    beskrivelse: "Klassisk agility-test i T-bane.",
    matchTokens: ["t-test", "agility"],
    ikon: "activity",
    metrics: [
      { key: "tidSek", label: "Tid", unit: "s", step: 0.01, primary: true },
    ],
  },
  {
    slug: "y-balance",
    navn: "Y-balance",
    beskrivelse: "Balanse-rekkevidde i tre retninger.",
    matchTokens: ["y-balance", "y balance"],
    ikon: "circle-dot",
    metrics: [
      { key: "anterior", label: "Anterior", unit: "cm", step: 0.1, primary: true },
      { key: "posteromedial", label: "Posteromedial", unit: "cm", step: 0.1 },
      { key: "posterolateral", label: "Posterolateral", unit: "cm", step: 0.1 },
    ],
  },
  {
    slug: "egen",
    navn: "Egen test",
    beskrivelse: "Custom test med ett enkelt resultat-felt.",
    matchTokens: [],
    ikon: "plus",
    metrics: [
      { key: "verdi", label: "Resultat", unit: "verdi", step: 0.1, primary: true },
    ],
  },
];

const LS_KEY = "akgolf:nytest:draft:v1";

type State = {
  steg: 1 | 2 | 3 | 4;
  valgtSlug: string | null;
  matchedTestId: string | null;
  takenAt: string;
  location: string;
  equipment: string[];
  preNotes: string;
  postNotes: string;
  shareWithCoach: boolean;
  results: Record<string, string>;
};

const LOKASJONER = ["Performance Studio", "Bossum", "Annet"] as const;

const STEG_LABELS = ["Type", "Detaljer", "Resultat", "Bekreft"] as const;

function todayIso(): string {
  const d = new Date();
  // Lokal dato uten tidssone-drift.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDato(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nb(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", ",");
}

function matchTestId(slug: string, tests: TestDef[]): string | null {
  const valg = KATALOG.find((k) => k.slug === slug);
  if (!valg) return null;
  for (const tok of valg.matchTokens) {
    const found = tests.find((t) => t.name.toLowerCase().includes(tok));
    if (found) return found.id;
  }
  return tests[0]?.id ?? null;
}

export function NyTestV2({ tests, sistePerTest, spillerNavn }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [state, setState] = useState<State>(() => {
    const initial: State = {
      steg: 1,
      valgtSlug: null,
      matchedTestId: null,
      takenAt: todayIso(),
      location: LOKASJONER[0],
      equipment: [],
      preNotes: "",
      postNotes: "",
      shareWithCoach: true,
      results: {},
    };
    // SSR-safe: les draft kun på klient. useState initializer kjører én gang
    // per komponent-mount; på server returnerer den `initial`.
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as Partial<State>;
      return {
        ...initial,
        ...parsed,
        steg: 1, // alltid start på steg 1 — ikke hopp inn midt i flyten
      };
    } catch {
      return initial;
    }
  });

  // Auto-save draft hvert 10. sek.
  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(state));
      } catch {
        /* quota — ignore */
      }
    }, 10000);
    return () => window.clearInterval(timer);
  }, [state]);

  const valgtKatalog = useMemo(
    () => KATALOG.find((k) => k.slug === state.valgtSlug) ?? null,
    [state.valgtSlug],
  );

  const kanGaTilNeste = useMemo(() => {
    if (state.steg === 1) return state.valgtSlug !== null;
    if (state.steg === 2) {
      if (!state.takenAt) return false;
      if (new Date(state.takenAt) > new Date()) return false;
      return state.location.trim().length > 0;
    }
    if (state.steg === 3) {
      if (!valgtKatalog) return false;
      // Krev minst primary-metrikk fylt ut (eller første metrikk).
      const primary = valgtKatalog.metrics.find((m) => m.primary) ?? valgtKatalog.metrics[0];
      const v = state.results[primary.key];
      if (!v) return false;
      const n = Number(v.replace(",", "."));
      return !isNaN(n) && n >= 0;
    }
    return true;
  }, [state, valgtKatalog]);

  const velgType = useCallback(
    (slug: string) => {
      setState((prev) => ({
        ...prev,
        valgtSlug: slug,
        matchedTestId: matchTestId(slug, tests),
        results: {},
      }));
    },
    [tests],
  );

  const setResultat = (key: string, value: string) => {
    setState((prev) => ({
      ...prev,
      results: { ...prev.results, [key]: value },
    }));
  };

  const leggTilUtstyr = (tag: string) => {
    const ren = tag.trim();
    if (!ren) return;
    if (state.equipment.includes(ren)) return;
    if (state.equipment.length >= 20) return;
    setState((prev) => ({ ...prev, equipment: [...prev.equipment, ren] }));
  };

  const fjernUtstyr = (tag: string) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((t) => t !== tag),
    }));
  };

  const neste = () => {
    if (!kanGaTilNeste) return;
    setFeil(null);
    setState((prev) => ({
      ...prev,
      steg: Math.min(4, prev.steg + 1) as State["steg"],
    }));
  };

  const tilbake = () => {
    setFeil(null);
    setState((prev) => ({
      ...prev,
      steg: Math.max(1, prev.steg - 1) as State["steg"],
    }));
  };

  const lagre = () => {
    if (!valgtKatalog || !state.matchedTestId) {
      setFeil("Velg en testtype før du lagrer.");
      return;
    }

    const numerics: Record<string, number> = {};
    for (const m of valgtKatalog.metrics) {
      const raw = state.results[m.key];
      if (!raw) continue;
      const n = Number(raw.replace(",", "."));
      if (!isNaN(n) && n >= 0) numerics[m.key] = n;
    }

    const primary = valgtKatalog.metrics.find((m) => m.primary) ?? valgtKatalog.metrics[0];
    if (numerics[primary.key] === undefined) {
      setFeil(`Fyll ut ${primary.label} før du kan lagre.`);
      return;
    }
    numerics._score = numerics[primary.key];

    startTransition(async () => {
      try {
        const res = await logTest({
          testId: state.matchedTestId,
          takenAt: state.takenAt,
          location: state.location,
          equipment: state.equipment,
          preNotes: state.preNotes,
          postNotes: state.postNotes,
          shareWithCoach: state.shareWithCoach,
          results: numerics,
        });
        try {
          window.localStorage.removeItem(LS_KEY);
        } catch {
          /* ignore */
        }
        toast.success("Test lagret");
        router.push(`/portal/tren/tester/${res.testId}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Kunne ikke lagre test";
        setFeil(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      <ProgresjonsBar
        variant="segment"
        total={4}
        filled={state.steg}
        label={STEG_LABELS[state.steg - 1]}
      />

      <Kort>
        {state.steg === 1 && (
          <Steg1 valgtSlug={state.valgtSlug} onVelg={velgType} />
        )}

        {state.steg === 2 && (
          <Steg2
            takenAt={state.takenAt}
            location={state.location}
            equipment={state.equipment}
            preNotes={state.preNotes}
            onTakenAt={(v) => setState((p) => ({ ...p, takenAt: v }))}
            onLocation={(v) => setState((p) => ({ ...p, location: v }))}
            onLeggTilUtstyr={leggTilUtstyr}
            onFjernUtstyr={fjernUtstyr}
            onPreNotes={(v) => setState((p) => ({ ...p, preNotes: v }))}
          />
        )}

        {state.steg === 3 && valgtKatalog && (
          <Steg3
            katalog={valgtKatalog}
            results={state.results}
            onResultat={setResultat}
          />
        )}

        {state.steg === 4 && valgtKatalog && (
          <Steg4
            katalog={valgtKatalog}
            state={state}
            spillerNavn={spillerNavn}
            siste={
              state.matchedTestId
                ? sistePerTest[state.matchedTestId] ?? null
                : null
            }
            onPostNotes={(v) => setState((p) => ({ ...p, postNotes: v }))}
            onShareToggle={(v) => setState((p) => ({ ...p, shareWithCoach: v }))}
          />
        )}

        {feil && (
          <div
            role="alert"
            style={{ marginTop: 18, borderRadius: 11, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}
          >
            {feil}
          </div>
        )}
      </Kort>

      {/* Footer-navigasjon */}
      <div style={{ position: "sticky", bottom: 12, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 16, border: `1px solid ${T.border}`, background: T.panel, padding: "12px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}>
        <Knapp ghost icon="chevron-left" onClick={tilbake} disabled={state.steg === 1 || pending}>
          Tilbake
        </Knapp>
        <Caps size={9}>Steg {state.steg} av 4</Caps>
        {state.steg < 4 ? (
          <Knapp icon="chevron-right" onClick={neste} disabled={!kanGaTilNeste || pending}>
            Neste
          </Knapp>
        ) : (
          <Knapp icon="check" onClick={lagre} disabled={pending}>
            {pending ? "Lagrer…" : "Lagre test"}
          </Knapp>
        )}
      </div>
    </div>
  );
}

function StegTittel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em", color: T.fg, lineHeight: 1.2, margin: 0 }}>
      {children}
    </h2>
  );
}

function StegIngress({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "8px 0 0" }}>
      {children}
    </p>
  );
}

function Steg1({
  valgtSlug,
  onVelg,
}: {
  valgtSlug: string | null;
  onVelg: (slug: string) => void;
}) {
  return (
    <div>
      <StegTittel>
        Hvilken <em style={{ fontStyle: "italic", color: T.lime }}>test</em> skal du logge?
      </StegTittel>
      <StegIngress>
        Velg én av de elleve testtypene under. Resultat-felter tilpasser seg valget.
      </StegIngress>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
        {KATALOG.map((k) => {
          const aktiv = valgtSlug === k.slug;
          return (
            <button
              key={k.slug}
              type="button"
              onClick={() => onVelg(k.slug)}
              aria-pressed={aktiv}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                minHeight: 128,
                gap: 12,
                textAlign: "left",
                borderRadius: 13,
                padding: 14,
                background: aktiv ? T.panel3 : T.panel2,
                border: `1px solid ${aktiv ? T.lime : T.border}`,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: aktiv ? T.lime : T.panel3,
                  border: aktiv ? "none" : `1px solid ${T.borderS}`,
                }}
              >
                <Icon name={k.ikon} size={16} style={{ color: aktiv ? T.onLime : T.fg2 }} />
              </span>
              <span>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.3 }}>
                  {k.navn}
                </span>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.45, marginTop: 4 }}>
                  {k.beskrivelse}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Steg2({
  takenAt,
  location,
  equipment,
  preNotes,
  onTakenAt,
  onLocation,
  onLeggTilUtstyr,
  onFjernUtstyr,
  onPreNotes,
}: {
  takenAt: string;
  location: string;
  equipment: string[];
  preNotes: string;
  onTakenAt: (v: string) => void;
  onLocation: (v: string) => void;
  onLeggTilUtstyr: (v: string) => void;
  onFjernUtstyr: (v: string) => void;
  onPreNotes: (v: string) => void;
}) {
  const [utstyrInput, setUtstyrInput] = useState("");
  const today = todayIso();

  const handleUtstyrKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onLeggTilUtstyr(utstyrInput);
      setUtstyrInput("");
    }
  };

  return (
    <div>
      <StegTittel>
        <em style={{ fontStyle: "italic", color: T.lime }}>Detaljer</em> om gjennomføringen
      </StegTittel>
      <StegIngress>Dato, sted og utstyr — slik at coachen kan tolke resultatet riktig.</StegIngress>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Inndata
          label="Dato"
          type="date"
          mono
          value={takenAt}
          onChange={(v) => onTakenAt(v > today ? today : v)}
        />
        <Velger
          label="Lokasjon"
          options={[...LOKASJONER]}
          value={location}
          onChange={onLocation}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, display: "block", marginBottom: 7 }}>
          Utstyr brukt (tags)
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, borderRadius: 11, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "8px 12px" }}>
          {equipment.map((tag) => (
            <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.borderS}`, padding: "4px 11px", fontFamily: T.ui, fontSize: 12, fontWeight: 500, color: T.fg }}>
              {tag}
              <button
                type="button"
                onClick={() => onFjernUtstyr(tag)}
                aria-label={`Fjern ${tag}`}
                className="v2-focus"
                style={{ appearance: "none", background: "transparent", border: 0, padding: 0, cursor: "pointer", color: T.mut, display: "inline-flex" }}
              >
                <Icon name="x" size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={utstyrInput}
            onChange={(e) => setUtstyrInput(e.target.value)}
            onKeyDown={handleUtstyrKey}
            onBlur={() => {
              if (utstyrInput.trim()) {
                onLeggTilUtstyr(utstyrInput);
                setUtstyrInput("");
              }
            }}
            placeholder="Trykk Enter for å legge til…"
            className="v2-focus"
            style={{ minWidth: 140, flex: 1, background: "transparent", border: 0, outline: "none", fontFamily: T.ui, fontSize: 13, color: T.fg, padding: "4px 0" }}
          />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <TekstOmraade
          label="Notater før test (valgfritt)"
          value={preNotes}
          rows={3}
          placeholder="Hvordan føltes oppvarmingen? Skader å være obs på?"
          onChange={(v) => onPreNotes(v.slice(0, 1000))}
        />
      </div>
    </div>
  );
}

function Steg3({
  katalog,
  results,
  onResultat,
}: {
  katalog: Katalog;
  results: Record<string, string>;
  onResultat: (key: string, v: string) => void;
}) {
  const erPutting = katalog.metrics.length >= 10;

  // Auto-snitt for putting-tester.
  const snitt = useMemo(() => {
    if (!erPutting) return null;
    const verdier = katalog.metrics
      .map((m) => Number((results[m.key] ?? "").replace(",", ".")))
      .filter((n) => !isNaN(n) && n >= 0);
    if (verdier.length === 0) return null;
    return verdier.reduce((s, n) => s + n, 0) / verdier.length;
  }, [erPutting, katalog.metrics, results]);

  return (
    <div>
      <StegTittel>
        <em style={{ fontStyle: "italic", color: T.lime }}>Resultater</em> for {katalog.navn.toLowerCase()}
      </StegTittel>
      <StegIngress>Fyll inn det du har målt. Påkrevd: minst hovedmetrikken under.</StegIngress>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: erPutting
            ? "repeat(auto-fill, minmax(120px, 1fr))"
            : "repeat(auto-fit, minmax(220px, 1fr))",
          gap: erPutting ? 8 : 14,
        }}
      >
        {katalog.metrics.map((m) => (
          <Inndata
            key={m.key}
            label={`${m.label}${m.primary ? " *" : ""}`}
            type="number"
            mono
            suffix={m.unit}
            value={results[m.key] ?? ""}
            onChange={(v) => onResultat(m.key, v)}
          />
        ))}
      </div>

      {erPutting && snitt != null && (
        <div style={{ marginTop: 18, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: "12px 14px" }}>
          <Caps size={9}>Auto-snitt</Caps>
          <div style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg, marginTop: 6 }}>
            {nb(snitt)} cm
          </div>
        </div>
      )}
    </div>
  );
}

function Steg4({
  katalog,
  state,
  spillerNavn,
  siste,
  onPostNotes,
  onShareToggle,
}: {
  katalog: Katalog;
  state: State;
  spillerNavn: string;
  siste: { score: number; takenAt: string } | null;
  onPostNotes: (v: string) => void;
  onShareToggle: (v: boolean) => void;
}) {
  const primary = katalog.metrics.find((m) => m.primary) ?? katalog.metrics[0];
  const nyVerdi = Number((state.results[primary.key] ?? "").replace(",", "."));
  const delta = siste ? nyVerdi - siste.score : null;
  const deltaSign = delta == null ? "" : delta > 0 ? "+" : delta < 0 ? "−" : "";
  const deltaTekst =
    delta == null
      ? null
      : `${deltaSign}${nb(Math.abs(delta), 1)} ${primary.unit}`;

  return (
    <div>
      <StegTittel>
        Klar til å <em style={{ fontStyle: "italic", color: T.lime }}>bekrefte</em>?
      </StegTittel>
      <StegIngress>Sjekk at sammendraget under stemmer før du lagrer.</StegIngress>

      <div style={{ marginTop: 18, borderRadius: 13, border: `1px solid ${T.border}`, background: T.panel2, padding: 18 }}>
        <Caps size={9}>Sammendrag · {spillerNavn}</Caps>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
          {[
            ["Type", katalog.navn],
            ["Dato", formatDato(state.takenAt)],
            ["Lokasjon", state.location],
            ["Utstyr", state.equipment.length > 0 ? state.equipment.join(", ") : "—"],
          ].map(([label, verdi]) => (
            <div key={label}>
              <Caps size={9}>{label}</Caps>
              <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg, marginTop: 4 }}>
                {verdi}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <Caps size={9}>Resultater</Caps>
          <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {katalog.metrics.map((m) => {
              const raw = state.results[m.key];
              if (!raw) return null;
              const n = Number(raw.replace(",", "."));
              if (isNaN(n)) return null;
              return (
                <li key={m.key} style={{ borderRadius: 11, border: `1px solid ${T.border}`, background: T.panel, padding: "10px 12px" }}>
                  <Caps size={8.5}>{m.label}</Caps>
                  <div style={{ fontFamily: T.mono, fontSize: 13.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg, marginTop: 3 }}>
                    {nb(n, m.step && m.step >= 1 ? 0 : 1)} {m.unit}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {siste && !isNaN(nyVerdi) && (
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 11, border: `1px solid color-mix(in srgb, ${T.lime} 25%, transparent)`, background: `color-mix(in srgb, ${T.lime} 6%, transparent)`, padding: "10px 14px" }}>
            <div>
              <Caps size={9}>Sammenlignet med forrige</Caps>
              <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, marginTop: 4 }}>
                Forrige: {nb(siste.score, primary.step && primary.step >= 1 ? 0 : 1)} {primary.unit} ·{" "}
                {formatDato(siste.takenAt)}
              </div>
            </div>
            {deltaTekst && delta != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: delta > 0 ? T.up : delta < 0 ? T.down : T.mut }}>
                <Icon name={delta < 0 ? "arrow-down" : "arrow-up"} size={13} />
                {deltaTekst}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <TekstOmraade
          label="Notater etter test (valgfritt)"
          value={state.postNotes}
          rows={3}
          placeholder="Hva fungerte? Hva ble du overrasket over?"
          onChange={(v) => onPostNotes(v.slice(0, 1000))}
        />

        <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: "12px 14px" }}>
          <Bryter
            label="Del med coach"
            sub="Coachen ser resultatet og kan følge opp"
            checked={state.shareWithCoach}
            onChange={onShareToggle}
          />
        </div>
      </div>
    </div>
  );
}
