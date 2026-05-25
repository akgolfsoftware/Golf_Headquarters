"use client";

/**
 * EgenTestWizard — fem-stegs wizard for å opprette en custom TestDefinition.
 *   1. Navn + Kategori (PyramidArea)
 *   2. Protokoll (rich textarea + estimert tid + utstyr)
 *   3. Måleenhet + Mål-verdier per NGF-nivå (D-G)
 *   4. Synlighet (PRIVATE / COACH / GROUP / ACADEMY)
 *   5. Forhåndsvisning + Lagre
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Dumbbell,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  Send,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import { opprettCustomTest } from "./actions";

type Kategori = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type Enhet = "sett" | "tid_sek" | "distanse_m" | "score" | "prosent" | "antall";
type Synlighet = "PRIVATE" | "COACH" | "GROUP" | "ACADEMY";

const KATEGORIER: Array<{
  verdi: Kategori;
  navn: string;
  beskrivelse: string;
  Icon: typeof Target;
  fargeKlasse: string;
}> = [
  {
    verdi: "FYS",
    navn: "Fysisk",
    beskrivelse: "Styrke, fart, eksplosivitet, kondisjon",
    Icon: Dumbbell,
    fargeKlasse: "border-red-500/30 bg-red-500/5",
  },
  {
    verdi: "TEK",
    navn: "Teknisk",
    beskrivelse: "Sving, posisjon, kontakt",
    Icon: Zap,
    fargeKlasse: "border-orange-500/30 bg-orange-500/5",
  },
  {
    verdi: "SLAG",
    navn: "Slag",
    beskrivelse: "Trackman-tall, ball-flight",
    Icon: Target,
    fargeKlasse: "border-amber-500/30 bg-amber-500/5",
  },
  {
    verdi: "SPILL",
    navn: "Spill",
    beskrivelse: "Putting, chip, scrambling",
    Icon: GraduationCap,
    fargeKlasse: "border-emerald-500/30 bg-emerald-500/5",
  },
  {
    verdi: "TURN",
    navn: "Turnering",
    beskrivelse: "Konkurranse-prestasjon, mental",
    Icon: Trophy,
    fargeKlasse: "border-primary/30 bg-primary/5",
  },
];

const ENHETER: Array<{ verdi: Enhet; navn: string; eksempel: string }> = [
  { verdi: "sett", navn: "Sett (reps × vekt)", eksempel: "3 × 5 reps" },
  { verdi: "tid_sek", navn: "Tid (sekunder)", eksempel: "10.45 s" },
  { verdi: "distanse_m", navn: "Distanse (meter)", eksempel: "175 m" },
  { verdi: "score", navn: "Score (poeng)", eksempel: "82" },
  { verdi: "prosent", navn: "Prosent (%)", eksempel: "65 %" },
  { verdi: "antall", navn: "Antall (telling)", eksempel: "12 stk" },
];

const NGF_NIVAAER = ["D", "E", "F", "G"] as const;

const SYNLIGHET_VALG: Array<{
  verdi: Synlighet;
  navn: string;
  beskrivelse: string;
  Icon: typeof Eye;
}> = [
  {
    verdi: "PRIVATE",
    navn: "Privat",
    beskrivelse: "Kun jeg ser denne testen.",
    Icon: EyeOff,
  },
  {
    verdi: "COACH",
    navn: "Min coach",
    beskrivelse: "Foreslå til min coach for godkjenning.",
    Icon: Users,
  },
  {
    verdi: "GROUP",
    navn: "Min gruppe",
    beskrivelse: "Del med min treningsgruppe.",
    Icon: Users,
  },
  {
    verdi: "ACADEMY",
    navn: "Akademi",
    beskrivelse: "Tilgjengelig for alle i AK Golf Academy.",
    Icon: Eye,
  },
];

type State = {
  navn: string;
  kategori: Kategori | null;
  beskrivelse: string;
  protokollSteg: string[];
  estMinutter: string;
  utstyr: string[];
  enhet: Enhet | null;
  scoringRule: string;
  malverdier: Record<string, string>;
  synlighet: Synlighet;
};

const initialState: State = {
  navn: "",
  kategori: null,
  beskrivelse: "",
  protokollSteg: [""],
  estMinutter: "",
  utstyr: [],
  enhet: null,
  scoringRule: "",
  malverdier: {},
  synlighet: "PRIVATE",
};

type Props = {
  rolle: "ADMIN" | "COACH" | "PLAYER" | "PARENT" | "GUEST";
  spillerNavn: string;
};

export function EgenTestWizard({ rolle, spillerNavn: _spillerNavn }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [steg, setSteg] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [state, setState] = useState<State>(initialState);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  const kanGåVidere = useMemo(() => {
    switch (steg) {
      case 1:
        return state.navn.trim().length >= 2 && state.kategori !== null;
      case 2:
        return state.protokollSteg.some((s) => s.trim().length > 0);
      case 3:
        return state.enhet !== null && state.scoringRule.trim().length >= 2;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }, [steg, state]);

  function oppdater<K extends keyof State>(felt: K, verdi: State[K]) {
    setState((s) => ({ ...s, [felt]: verdi }));
    setFeilmelding(null);
  }

  function lagre(opsjon: "vanlig" | "forslag-coach") {
    if (!state.kategori || !state.enhet) {
      setFeilmelding("Mangler kategori eller måleenhet.");
      return;
    }

    const synlighet: Synlighet =
      opsjon === "forslag-coach" ? "COACH" : state.synlighet;

    startTransition(async () => {
      try {
        const result = await opprettCustomTest({
          name: state.navn,
          description: state.beskrivelse || null,
          pyramidArea: state.kategori!,
          protocol: {
            steg: state.protokollSteg
              .map((s) => s.trim())
              .filter((s) => s.length > 0),
            estMinutter: state.estMinutter
              ? Number.parseInt(state.estMinutter, 10)
              : undefined,
            utstyr: state.utstyr,
          },
          malverdi: {
            enhet: state.enhet,
            nivaaSystem: "NGF_DG",
            nivaaer: state.malverdier,
          },
          scoringRule: state.scoringRule,
          visibility: synlighet,
        });

        if (result.ok) {
          toast.success(
            synlighet === "COACH"
              ? "Testen er sendt til coach for godkjenning."
              : "Egen test opprettet — klar til bruk.",
          );
          router.push("/portal/tren/tester");
          router.refresh();
        }
      } catch (err) {
        setFeilmelding(
          err instanceof Error ? err.message : "Kunne ikke lagre testen.",
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      <StegIndikator aktivt={steg} />

      {feilmelding && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {feilmelding}
        </div>
      )}

      {steg === 1 && (
        <Steg1
          state={state}
          oppdater={oppdater}
        />
      )}
      {steg === 2 && (
        <Steg2
          state={state}
          oppdater={oppdater}
        />
      )}
      {steg === 3 && (
        <Steg3
          state={state}
          oppdater={oppdater}
        />
      )}
      {steg === 4 && (
        <Steg4
          state={state}
          oppdater={oppdater}
          rolle={rolle}
        />
      )}
      {steg === 5 && (
        <Steg5
          state={state}
          pending={pending}
          onLagre={lagre}
        />
      )}

      {steg < 5 && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setSteg((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))}
            disabled={steg === 1}
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            Tilbake
          </button>
          <button
            type="button"
            onClick={() => setSteg((s) => (s < 5 ? ((s + 1) as 2 | 3 | 4 | 5) : s))}
            disabled={!kanGåVidere}
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Videre
            <ArrowRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}

function StegIndikator({ aktivt }: { aktivt: 1 | 2 | 3 | 4 | 5 }) {
  const titler = [
    "Navn & Kategori",
    "Protokoll",
    "Måleenhet",
    "Synlighet",
    "Forhåndsvisning",
  ];
  return (
    <ol className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {titler.map((tittel, i) => {
        const nr = (i + 1) as 1 | 2 | 3 | 4 | 5;
        const erAktiv = nr === aktivt;
        const erFerdig = nr < aktivt;
        return (
          <li key={tittel} className="flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                erFerdig
                  ? "border-primary bg-primary text-primary-foreground"
                  : erAktiv
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {erFerdig ? <Check size={12} strokeWidth={2} /> : nr}
            </span>
            <span className={erAktiv ? "text-foreground" : ""}>{tittel}</span>
            {i < titler.length - 1 && <ChevronRight size={12} strokeWidth={1.75} />}
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Steg 1: Navn + Kategori ----------

function Steg1({
  state,
  oppdater,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="test-navn" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Testnavn
          </span>
        </label>
        <input
          id="test-navn"
          type="text"
          value={state.navn}
          onChange={(e) => oppdater("navn", e.target.value)}
          placeholder="Eks. «Putt-konsistens 6 fot»"
          maxLength={100}
          className="w-full rounded-md border border-input bg-card px-4 py-3 font-display text-2xl outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <p className="text-xs text-muted-foreground">
          Minst 2 tegn. {state.navn.length}/100.
        </p>
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Kategori
        </span>
        <div
          role="radiogroup"
          aria-label="Velg pyramide-område"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          {KATEGORIER.map((k) => {
            const valgt = state.kategori === k.verdi;
            return (
              <button
                key={k.verdi}
                type="button"
                role="radio"
                aria-checked={valgt}
                onClick={() => oppdater("kategori", k.verdi)}
                className={`flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                  valgt
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : `${k.fargeKlasse} hover:border-primary/60`
                }`}
              >
                <span className="rounded-md border border-border bg-card p-2">
                  <k.Icon size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <div className="font-display text-base font-semibold tracking-tight">
                    {k.navn}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {k.beskrivelse}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Steg 2: Protokoll ----------

function Steg2({
  state,
  oppdater,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
}) {
  const [nyttUtstyr, setNyttUtstyr] = useState("");

  function leggTilSteg() {
    oppdater("protokollSteg", [...state.protokollSteg, ""]);
  }

  function endreSteg(i: number, verdi: string) {
    const nye = [...state.protokollSteg];
    nye[i] = verdi;
    oppdater("protokollSteg", nye);
  }

  function fjernSteg(i: number) {
    if (state.protokollSteg.length <= 1) return;
    oppdater(
      "protokollSteg",
      state.protokollSteg.filter((_, idx) => idx !== i),
    );
  }

  function leggTilUtstyr() {
    const trimmet = nyttUtstyr.trim();
    if (!trimmet || state.utstyr.includes(trimmet)) return;
    oppdater("utstyr", [...state.utstyr, trimmet]);
    setNyttUtstyr("");
  }

  function fjernUtstyr(verdi: string) {
    oppdater(
      "utstyr",
      state.utstyr.filter((u) => u !== verdi),
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="test-beskrivelse" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Beskrivelse (valgfri)
          </span>
        </label>
        <textarea
          id="test-beskrivelse"
          value={state.beskrivelse}
          onChange={(e) => oppdater("beskrivelse", e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Hva måler denne testen og hvorfor er den verdifull?"
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Protokoll — steg for steg
        </span>
        <ol className="space-y-2">
          {state.protokollSteg.map((tekst, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-3 font-mono text-xs font-semibold text-primary">
                {i + 1}.
              </span>
              <textarea
                value={tekst}
                onChange={(e) => endreSteg(i, e.target.value)}
                rows={1}
                placeholder={
                  i === 0
                    ? "Eks. Varm opp 5 min med dynamiske bevegelser."
                    : `Steg ${i + 1}`
                }
                maxLength={300}
                className="min-h-11 flex-1 rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              {state.protokollSteg.length > 1 && (
                <button
                  type="button"
                  onClick={() => fjernSteg(i)}
                  aria-label={`Fjern steg ${i + 1}`}
                  className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              )}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={leggTilSteg}
          className="inline-flex h-11 items-center gap-1.5 rounded-md border border-dashed border-input px-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus size={14} strokeWidth={1.75} />
          Legg til steg
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="est-min" className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Estimert tid (minutter)
            </span>
          </label>
          <input
            id="est-min"
            type="number"
            min={0}
            max={180}
            value={state.estMinutter}
            onChange={(e) => oppdater("estMinutter", e.target.value)}
            placeholder="15"
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 font-mono text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Utstyr som trengs
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nyttUtstyr}
              onChange={(e) => setNyttUtstyr(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  leggTilUtstyr();
                }
              }}
              placeholder="Eks. Trackman, 10 baller"
              maxLength={60}
              className="min-h-11 flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="button"
              onClick={leggTilUtstyr}
              className="inline-flex h-11 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-sm font-medium hover:border-primary hover:text-primary"
            >
              <Plus size={14} strokeWidth={1.75} />
              Legg til
            </button>
          </div>
          {state.utstyr.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {state.utstyr.map((u) => (
                <li
                  key={u}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs"
                >
                  <span>{u}</span>
                  <button
                    type="button"
                    onClick={() => fjernUtstyr(u)}
                    aria-label={`Fjern ${u}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Steg 3: Måleenhet + Mål-verdi ----------

function Steg3({
  state,
  oppdater,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
}) {
  function endreNivaa(nivaa: string, verdi: string) {
    oppdater("malverdier", { ...state.malverdier, [nivaa]: verdi });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Måleenhet
        </span>
        <div
          role="radiogroup"
          aria-label="Velg måleenhet"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ENHETER.map((e) => {
            const valgt = state.enhet === e.verdi;
            return (
              <button
                key={e.verdi}
                type="button"
                role="radio"
                aria-checked={valgt}
                onClick={() => oppdater("enhet", e.verdi)}
                className={`flex items-start justify-between gap-3 rounded-md border p-3 text-left transition-all ${
                  valgt
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-input hover:border-primary/60"
                }`}
              >
                <div>
                  <div className="font-medium text-sm">{e.navn}</div>
                  <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {e.eksempel}
                  </div>
                </div>
                {valgt && (
                  <Check size={14} strokeWidth={2} className="text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="scoring-rule" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Scoring-regel
          </span>
        </label>
        <input
          id="scoring-rule"
          type="text"
          value={state.scoringRule}
          onChange={(e) => oppdater("scoringRule", e.target.value)}
          placeholder="Eks. «Antall puttede av 10» eller «Beste tid»"
          maxLength={200}
          className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <p className="text-xs text-muted-foreground">
          Beskriv hvordan score regnes — høyere bedre eller lavere bedre?
        </p>
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Mål-verdier per NGF-nivå (valgfritt)
        </span>
        <p className="text-xs text-muted-foreground">
          Definer hva som regnes som godkjent per nivå. La stå tomt hvis ikke
          aktuelt.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {NGF_NIVAAER.map((nivaa) => (
            <div key={nivaa} className="space-y-1.5">
              <label
                htmlFor={`nivaa-${nivaa}`}
                className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
              >
                Nivå {nivaa}
              </label>
              <input
                id={`nivaa-${nivaa}`}
                type="text"
                value={state.malverdier[nivaa] ?? ""}
                onChange={(e) => endreNivaa(nivaa, e.target.value)}
                placeholder="Verdi"
                maxLength={60}
                className="w-full rounded-md border border-input bg-card px-3 py-2 font-mono text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Steg 4: Synlighet ----------

function Steg4({
  state,
  oppdater,
  rolle,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
  rolle: "ADMIN" | "COACH" | "PLAYER" | "PARENT" | "GUEST";
}) {
  const erSpiller = rolle === "PLAYER";
  const synligheter = SYNLIGHET_VALG.filter((s) =>
    // Spillere kan ikke direkte velge ACADEMY — må gå via coach-godkjenning.
    erSpiller ? s.verdi !== "ACADEMY" : true,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Hvem skal kunne bruke testen?
        </span>
        <div
          role="radiogroup"
          aria-label="Velg synlighet"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {synligheter.map((s) => {
            const valgt = state.synlighet === s.verdi;
            return (
              <button
                key={s.verdi}
                type="button"
                role="radio"
                aria-checked={valgt}
                onClick={() => oppdater("synlighet", s.verdi)}
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                  valgt
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-input hover:border-primary/60"
                }`}
              >
                <span className="rounded-md border border-border bg-card p-2">
                  <s.Icon size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <div className="font-display text-base font-semibold tracking-tight">
                    {s.navn}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.beskrivelse}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {erSpiller && state.synlighet === "COACH" && (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <strong className="font-semibold">Tips:</strong> Når du foreslår en
          test til coach, vil hen kunne godkjenne den til hele akademi. Du
          beholder kreditten som skaper.
        </div>
      )}
    </div>
  );
}

// ---------- Steg 5: Forhåndsvisning + Lagre ----------

function Steg5({
  state,
  pending,
  onLagre,
}: {
  state: State;
  pending: boolean;
  onLagre: (opsjon: "vanlig" | "forslag-coach") => void;
}) {
  const kategori = state.kategori
    ? KATEGORIER.find((k) => k.verdi === state.kategori)!
    : null;
  const enhet = state.enhet
    ? ENHETER.find((e) => e.verdi === state.enhet)!
    : null;
  const synlighet = SYNLIGHET_VALG.find((s) => s.verdi === state.synlighet)!;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Forhåndsvisning
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight">
          {state.navn || <em className="text-muted-foreground">(uten navn)</em>}
        </h2>
        {kategori && (
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${kategori.fargeKlasse}`}
          >
            <kategori.Icon size={12} strokeWidth={1.75} />
            {kategori.navn}
          </span>
        )}

        {state.beskrivelse && (
          <p className="mt-4 text-sm text-muted-foreground">
            {state.beskrivelse}
          </p>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Måleenhet
            </dt>
            <dd className="mt-1 text-sm">{enhet?.navn ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Scoring
            </dt>
            <dd className="mt-1 text-sm">{state.scoringRule || "—"}</dd>
          </div>
          {state.estMinutter && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Estimert tid
              </dt>
              <dd className="mt-1 font-mono text-sm tabular-nums">
                {state.estMinutter} min
              </dd>
            </div>
          )}
          {state.utstyr.length > 0 && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Utstyr
              </dt>
              <dd className="mt-1 text-sm">{state.utstyr.join(", ")}</dd>
            </div>
          )}
        </dl>

        {state.protokollSteg.some((s) => s.trim().length > 0) && (
          <div className="mt-6 border-t border-border pt-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Protokoll
            </dt>
            <ol className="mt-2 space-y-1.5 text-sm">
              {state.protokollSteg
                .filter((s) => s.trim().length > 0)
                .map((steg, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {i + 1}.
                    </span>
                    <span>{steg}</span>
                  </li>
                ))}
            </ol>
          </div>
        )}

        {Object.keys(state.malverdier).some(
          (k) => state.malverdier[k]?.trim().length > 0,
        ) && (
          <div className="mt-6 border-t border-border pt-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Mål-verdier (NGF-nivå)
            </dt>
            <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {NGF_NIVAAER.map(
                (n) =>
                  state.malverdier[n] && (
                    <div key={n}>
                      <dt className="font-mono text-[10px] uppercase text-muted-foreground">
                        {n}
                      </dt>
                      <dd className="mt-0.5 font-mono text-sm tabular-nums">
                        {state.malverdier[n]}
                      </dd>
                    </div>
                  ),
              )}
            </dl>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
          <synlighet.Icon
            size={14}
            strokeWidth={1.75}
            className="text-muted-foreground"
          />
          <span className="text-sm">
            Synlighet:{" "}
            <strong className="font-semibold">{synlighet.navn}</strong> —{" "}
            <span className="text-muted-foreground">
              {synlighet.beskrivelse}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onLagre("vanlig")}
          disabled={pending}
          className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
          ) : (
            <Save size={14} strokeWidth={1.75} />
          )}
          Lagre {state.synlighet === "PRIVATE" ? "privat" : ""}
        </button>
        {state.synlighet !== "ACADEMY" && (
          <button
            type="button"
            onClick={() => onLagre("forslag-coach")}
            disabled={pending}
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-input bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Send size={14} strokeWidth={1.75} />
            Lagre og foreslå til coach
          </button>
        )}
      </div>
    </div>
  );
}
