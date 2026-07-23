"use client";

/**
 * PlayerHQ · Ny egen test — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { opprettCustomTest } from "@/app/portal/tren/tester/ny/egen/actions";
import {
  T,
  Caps,
  Kort,
  Knapp,
  Inndata,
  TekstOmraade,
  ValgKort,
  ProgresjonsBar,
  HjelpTips,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";

type Kategori = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type Enhet = "sett" | "tid_sek" | "distanse_m" | "score" | "prosent" | "antall";
type Synlighet = "PRIVATE" | "COACH" | "GROUP" | "ACADEMY";

const KATEGORIER: Array<{
  verdi: Kategori;
  navn: string;
  beskrivelse: string;
  /** Ikon-navn i v2-kartet (Icon fra @/components/v2/icon). */
  ikon: string;
}> = [
  {
    verdi: "FYS",
    navn: "Fysisk",
    beskrivelse: "Styrke, fart, eksplosivitet, kondisjon",
    ikon: "dumbbell",
  },
  {
    verdi: "TEK",
    navn: "Teknisk",
    beskrivelse: "Sving, posisjon, kontakt",
    ikon: "activity",
  },
  {
    verdi: "SLAG",
    navn: "Slag",
    beskrivelse: "Trackman-tall, ball-flight",
    ikon: "target",
  },
  {
    verdi: "SPILL",
    navn: "Spill",
    beskrivelse: "Putting, chip, scrambling",
    ikon: "flag",
  },
  {
    verdi: "TURN",
    navn: "Turnering",
    beskrivelse: "Konkurranse-prestasjon, mental",
    ikon: "trophy",
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
  ikon: string;
}> = [
  {
    verdi: "PRIVATE",
    navn: "Privat",
    beskrivelse: "Kun jeg ser denne testen.",
    ikon: "lock",
  },
  {
    verdi: "COACH",
    navn: "Min coach",
    beskrivelse: "Foreslå til min coach for godkjenning.",
    ikon: "users",
  },
  {
    verdi: "GROUP",
    navn: "Min gruppe",
    beskrivelse: "Del med min treningsgruppe.",
    ikon: "users",
  },
  {
    verdi: "ACADEMY",
    navn: "Akademi",
    beskrivelse: "Tilgjengelig for alle i AK Golf Academy.",
    ikon: "eye",
  },
];

const STEG_LABELS = [
  "Navn & kategori",
  "Protokoll",
  "Måleenhet",
  "Synlighet",
  "Forhåndsvisning",
] as const;

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
};

export function NyTestEgenV2({ rolle }: Props) {
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
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      <ProgresjonsBar
        variant="segment"
        total={5}
        filled={steg}
        label={STEG_LABELS[steg - 1]}
      />

      <Kort>
        {steg === 1 && <Steg1 state={state} oppdater={oppdater} />}
        {steg === 2 && <Steg2 state={state} oppdater={oppdater} />}
        {steg === 3 && <Steg3 state={state} oppdater={oppdater} />}
        {steg === 4 && <Steg4 state={state} oppdater={oppdater} rolle={rolle} />}
        {steg === 5 && <Steg5 state={state} pending={pending} onLagre={lagre} />}

        {feilmelding && (
          <div
            role="alert"
            style={{ marginTop: 18, borderRadius: 11, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.down }}
          >
            {feilmelding}
          </div>
        )}
      </Kort>

      {/* Footer-navigasjon */}
      <div style={{ position: "sticky", bottom: 12, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 16, border: `1px solid ${T.border}`, background: T.panel, padding: "12px 14px", boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}>
        <Knapp
          ghost
          icon="chevron-left"
          onClick={() => setSteg((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))}
          disabled={steg === 1 || pending}
        >
          Tilbake
        </Knapp>
        <Caps size={9}>Steg {steg} av 5</Caps>
        {steg < 5 ? (
          <Knapp
            icon="chevron-right"
            onClick={() => setSteg((s) => (s < 5 ? ((s + 1) as 2 | 3 | 4 | 5) : s))}
            disabled={!kanGåVidere || pending}
          >
            Videre
          </Knapp>
        ) : (
          <Knapp icon="check" onClick={() => lagre("vanlig")} disabled={pending}>
            {pending
              ? "Lagrer…"
              : `Lagre${state.synlighet === "PRIVATE" ? " privat" : ""}`}
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

function FeltEtikett({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, display: "block", marginBottom: 7 }}>
      {children}
    </span>
  );
}

/* ── Steg 1: Navn + Kategori ── */

function Steg1({
  state,
  oppdater,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
}) {
  return (
    <div>
      <StegTittel>
        Hva skal <em style={{ fontStyle: "italic", color: T.lime }}>testen</em> hete?
      </StegTittel>
      <StegIngress>Gi testen et navn og velg hvilket pyramide-område den hører til.</StegIngress>

      <div style={{ marginTop: 18 }}>
        <Inndata
          label="Testnavn"
          value={state.navn}
          placeholder="Eks. «Putt-konsistens 6 fot»"
          onChange={(v) => oppdater("navn", v.slice(0, 100))}
        />
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, display: "block", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
          Minst 2 tegn. {state.navn.length}/100.
        </span>
      </div>

      <div style={{ marginTop: 18 }}>
        <FeltEtikett>
          Kategori <HjelpTips k="pyramideAkse" />
        </FeltEtikett>
        <div
          role="radiogroup"
          aria-label="Velg pyramide-område"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}
        >
          {KATEGORIER.map((k) => {
            const valgt = state.kategori === k.verdi;
            const aksefarge = T.ax[k.verdi];
            return (
              <button
                key={k.verdi}
                type="button"
                role="radio"
                aria-checked={valgt}
                onClick={() => oppdater("kategori", k.verdi)}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 10,
                  textAlign: "left",
                  borderRadius: 13,
                  padding: 14,
                  background: valgt ? T.panel3 : T.panel2,
                  border: `1px solid ${valgt ? T.lime : T.border}`,
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
                    background: `color-mix(in srgb, ${aksefarge} 16%, transparent)`,
                  }}
                >
                  <Icon name={k.ikon} size={16} style={{ color: aksefarge }} />
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
    </div>
  );
}

/* ── Steg 2: Protokoll ── */

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
    <div>
      <StegTittel>
        Hvordan <em style={{ fontStyle: "italic", color: T.lime }}>gjennomføres</em> testen?
      </StegTittel>
      <StegIngress>Beskriv protokollen steg for steg — slik at testen gjøres likt hver gang.</StegIngress>

      <div style={{ marginTop: 18 }}>
        <TekstOmraade
          label="Beskrivelse (valgfri)"
          value={state.beskrivelse}
          rows={2}
          placeholder="Hva måler denne testen og hvorfor er den verdifull?"
          onChange={(v) => oppdater("beskrivelse", v.slice(0, 2000))}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <FeltEtikett>Protokoll — steg for steg</FeltEtikett>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {state.protokollSteg.map((tekst, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ flex: "none", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.lime, fontVariantNumeric: "tabular-nums" }}>
                {i + 1}.
              </span>
              <input
                type="text"
                value={tekst}
                onChange={(e) => endreSteg(i, e.target.value)}
                placeholder={
                  i === 0
                    ? "Eks. Varm opp 5 min med dynamiske bevegelser."
                    : `Steg ${i + 1}`
                }
                maxLength={300}
                className="v2-focus"
                style={{ flex: 1, minWidth: 0, boxSizing: "border-box", appearance: "none", borderRadius: 11, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "10px 13px", fontFamily: T.ui, fontSize: 13, color: T.fg, outline: "none" }}
              />
              {state.protokollSteg.length > 1 && (
                <button
                  type="button"
                  onClick={() => fjernSteg(i)}
                  aria-label={`Fjern steg ${i + 1}`}
                  className="v2-press v2-focus"
                  style={{ appearance: "none", flex: "none", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.fg2 }}
                >
                  <Icon name="x" size={13} />
                </button>
              )}
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 10 }}>
          <Knapp ghost icon="plus" onClick={leggTilSteg}>
            Legg til steg
          </Knapp>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Inndata
          label="Estimert tid (minutter)"
          type="number"
          mono
          suffix="min"
          value={state.estMinutter}
          placeholder="15"
          onChange={(v) => oppdater("estMinutter", v)}
        />

        <div>
          <FeltEtikett>Utstyr som trengs</FeltEtikett>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, borderRadius: 11, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "8px 12px" }}>
            {state.utstyr.map((u) => (
              <span key={u} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.borderS}`, padding: "4px 11px", fontFamily: T.ui, fontSize: 12, fontWeight: 500, color: T.fg }}>
                {u}
                <button
                  type="button"
                  onClick={() => fjernUtstyr(u)}
                  aria-label={`Fjern ${u}`}
                  className="v2-focus"
                  style={{ appearance: "none", background: "transparent", border: 0, padding: 0, cursor: "pointer", color: T.mut, display: "inline-flex" }}
                >
                  <Icon name="x" size={12} />
                </button>
              </span>
            ))}
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
              onBlur={leggTilUtstyr}
              placeholder="Eks. Trackman, 10 baller"
              maxLength={60}
              aria-label="Legg til utstyr"
              className="v2-focus"
              style={{ minWidth: 120, flex: 1, background: "transparent", border: 0, outline: "none", fontFamily: T.ui, fontSize: 13, color: T.fg, padding: "4px 0" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Steg 3: Måleenhet + Mål-verdi ── */

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
    <div>
      <StegTittel>
        Hvordan <em style={{ fontStyle: "italic", color: T.lime }}>måles</em> resultatet?
      </StegTittel>
      <StegIngress>Velg måleenhet og beskriv hvordan score regnes.</StegIngress>

      <div style={{ marginTop: 18 }}>
        <FeltEtikett>Måleenhet</FeltEtikett>
        <div
          role="radiogroup"
          aria-label="Velg måleenhet"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}
        >
          {ENHETER.map((e) => (
            <ValgKort
              key={e.verdi}
              tittel={e.navn}
              sub={e.eksempel}
              valgt={state.enhet === e.verdi}
              onClick={() => oppdater("enhet", e.verdi)}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Inndata
          label="Scoring-regel"
          value={state.scoringRule}
          placeholder="Eks. «Antall puttede av 10» eller «Beste tid»"
          onChange={(v) => oppdater("scoringRule", v.slice(0, 200))}
        />
        <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, display: "block", marginTop: 6 }}>
          Beskriv hvordan score regnes — høyere bedre eller lavere bedre?
        </span>
      </div>

      <div style={{ marginTop: 18 }}>
        <FeltEtikett>Mål-verdier per NGF-nivå (valgfritt) <HjelpTips k="ngfNivaa" size={11} /></FeltEtikett>
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.5, margin: "0 0 10px" }}>
          Definer hva som regnes som godkjent per nivå. La stå tomt hvis ikke
          aktuelt.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
          {NGF_NIVAAER.map((nivaa) => (
            <Inndata
              key={nivaa}
              label={`Nivå ${nivaa}`}
              mono
              value={state.malverdier[nivaa] ?? ""}
              placeholder="Verdi"
              onChange={(v) => endreNivaa(nivaa, v.slice(0, 60))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Steg 4: Synlighet ── */

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
    <div>
      <StegTittel>
        Hvem skal kunne <em style={{ fontStyle: "italic", color: T.lime }}>bruke</em> testen?
      </StegTittel>
      <StegIngress>Du kan alltid endre synligheten senere via coach.</StegIngress>

      <div
        role="radiogroup"
        aria-label="Velg synlighet"
        style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}
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
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                textAlign: "left",
                borderRadius: 13,
                padding: 14,
                background: valgt ? T.panel3 : T.panel2,
                border: `1px solid ${valgt ? T.lime : T.border}`,
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 34,
                  height: 34,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: valgt ? T.lime : T.panel3,
                  border: valgt ? "none" : `1px solid ${T.borderS}`,
                }}
              >
                <Icon name={s.ikon} size={15} style={{ color: valgt ? T.onLime : T.fg2 }} />
              </span>
              <span>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.3 }}>
                  {s.navn}
                </span>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.45, marginTop: 4 }}>
                  {s.beskrivelse}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {erSpiller && state.synlighet === "COACH" && (
        <div style={{ marginTop: 18, borderRadius: 11, border: `1px solid color-mix(in srgb, ${T.lime} 25%, transparent)`, background: `color-mix(in srgb, ${T.lime} 6%, transparent)`, padding: "10px 14px", fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55 }}>
          <strong style={{ fontWeight: 600, color: T.fg }}>Tips:</strong> Når du
          foreslår en test til coach, vil hen kunne godkjenne den til hele
          akademi. Du beholder kreditten som skaper.
        </div>
      )}
    </div>
  );
}

/* ── Steg 5: Forhåndsvisning + Lagre ── */

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
  const protokollSteg = state.protokollSteg.filter((s) => s.trim().length > 0);

  return (
    <div>
      <StegTittel>
        Klar til å <em style={{ fontStyle: "italic", color: T.lime }}>lagre</em>?
      </StegTittel>
      <StegIngress>Sjekk at forhåndsvisningen under stemmer før du lagrer.</StegIngress>

      <div style={{ marginTop: 18, borderRadius: 13, border: `1px solid ${T.border}`, background: T.panel2, padding: 18 }}>
        <Caps size={9}>Forhåndsvisning</Caps>
        <h3 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.fg, lineHeight: 1.2, margin: "8px 0 0" }}>
          {state.navn || <em style={{ fontStyle: "italic", color: T.mut }}>(uten navn)</em>}
        </h3>
        {kategori && (
          <span style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: `color-mix(in srgb, ${T.ax[kategori.verdi]} 14%, transparent)`, padding: "4px 12px", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.ax[kategori.verdi] }}>
            <Icon name={kategori.ikon} size={12} />
            {kategori.navn}
          </span>
        )}

        {state.beskrivelse && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "12px 0 0" }}>
            {state.beskrivelse}
          </p>
        )}

        <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
          <div>
            <Caps size={9}>Måleenhet</Caps>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg, marginTop: 4 }}>
              {enhet?.navn ?? "—"}
            </div>
          </div>
          <div>
            <Caps size={9}>Scoring</Caps>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg, marginTop: 4 }}>
              {state.scoringRule || "—"}
            </div>
          </div>
          {state.estMinutter && (
            <div>
              <Caps size={9}>Estimert tid</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: T.fg, marginTop: 4 }}>
                {state.estMinutter} min
              </div>
            </div>
          )}
          {state.utstyr.length > 0 && (
            <div>
              <Caps size={9}>Utstyr</Caps>
              <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: T.fg, marginTop: 4 }}>
                {state.utstyr.join(", ")}
              </div>
            </div>
          )}
        </div>

        {protokollSteg.length > 0 && (
          <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <Caps size={9}>Protokoll</Caps>
            <ol style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {protokollSteg.map((tekst, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.5 }}>
                  <span style={{ flex: "none", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.lime, fontVariantNumeric: "tabular-nums" }}>
                    {i + 1}.
                  </span>
                  <span>{tekst}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {Object.keys(state.malverdier).some(
          (k) => state.malverdier[k]?.trim().length > 0,
        ) && (
          <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <Caps size={9}>Mål-verdier (NGF-nivå)</Caps>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
              {NGF_NIVAAER.map(
                (n) =>
                  state.malverdier[n] && (
                    <div key={n} style={{ borderRadius: 11, border: `1px solid ${T.border}`, background: T.panel, padding: "8px 11px" }}>
                      <Caps size={8.5}>{n}</Caps>
                      <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg, marginTop: 3 }}>
                        {state.malverdier[n]}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={synlighet.ikon} size={14} style={{ color: T.mut }} />
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
            Synlighet:{" "}
            <strong style={{ fontWeight: 600, color: T.fg }}>{synlighet.navn}</strong>{" "}
            — {synlighet.beskrivelse}
          </span>
        </div>
      </div>

      {state.synlighet !== "ACADEMY" && (
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <Knapp ghost icon="send" disabled={pending} onClick={() => onLagre("forslag-coach")}>
            Lagre og foreslå til coach
          </Knapp>
        </div>
      )}
    </div>
  );
}
