"use client";

/**
 * FangstSheet — Paper-fasitens fangstkomponent (designsystem/paper/fase1/
 * fangstsheet.html), kontekst A: bunn-ark fra composeren på PlayerHQ-hjem.
 * Erstatter den gamle FangstModal-stubben (PP-3).
 *
 * Fasitens ufravikelige mål (§1): mikrofonflate ≥60px, chips ≥44px, 4–6
 * chips avledet av øktformelen, AUTOLAGRING (ingen lagre-knapp), 10 s
 * angrevindu med kvittering i flaten (klokkeslett, ikke toast), stoppeklokke
 * mot 20 s-målet, ett trykk rett i opptak.
 *
 * Tilstandsmaskin (fasit §5): hvile · opptak · transkriberer · lagret ·
 * ingen mikrofon · offline (køet) · for kort (<2 s forkastes).
 *
 * DATABEGRENSNING: CaptureNote-modellen finnes ikke — lagringen går via
 * dagens mekanisme (onLagre → chat-tråden, usePortalChat.sendMessage).
 * Chips lagres som del av teksten («[chip: …]») så ingenting går tapt.
 * Fordi tråd-meldinger ikke kan oppdateres i etterkant, holder arket ÉN
 * pending-fangst per åpning: autolagring oppdaterer den (kvittering +
 * angrevindu vises umiddelbart), og selve sendingen skjer når arket lukkes
 * eller avmonteres. Angre innen 10 s forkaster alt. Offline køes teksten i
 * localStorage og sendes når nettet er tilbake (eller ved neste åpning).
 *
 * Stoppeklokka (fasit §7) er midlertidig telemetri — skal ut når tallet er
 * lest, men ikke før.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, Square, X } from "lucide-react";
import {
  deriveFangstChips,
  fangstFormelTag,
  type FangstFormel,
} from "@/lib/domain/fangst-chips";

type FangstTilstand =
  | "hvile"
  | "opptak"
  | "transkriberer"
  | "lagret"
  | "ingen_mikrofon"
  | "offline"
  | "for_kort";

const KO_KEY = "akhq-fangst-ko";

/** Kø for offline-fangster — ren localStorage, chips-teksten er alt. */
function lesKo(): string[] {
  try {
    const raw = localStorage.getItem(KO_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function skrivKo(ko: string[]) {
  try {
    if (ko.length === 0) localStorage.removeItem(KO_KEY);
    else localStorage.setItem(KO_KEY, JSON.stringify(ko));
  } catch {
    /* lagring nektet — fangsten lever videre i minnet til arket lukkes */
  }
}

function klokke(d: Date): string {
  const p = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function sek(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

const HINT: Record<FangstTilstand, string> = {
  hvile: "Ett trykk. Snakk. Slipp aldri tanken ut av hånda.",
  opptak: "Hører deg. Trykk igjen når du er ferdig.",
  transkriberer: "Skriver ned det du sa …",
  lagret: "Fanget. Du kan lukke nå.",
  ingen_mikrofon:
    "Mikrofonen er ikke tilgjengelig her. Chips og tekst virker som normalt — velg under, så er fangsten fanget.",
  offline:
    "Ingen forbindelse. Notatet ligger på telefonen og sendes automatisk når nettet er tilbake.",
  for_kort:
    "For kort — under 2 sekunder ble ingenting fanget. Trykk igjen og si det. Chips-valgene dine står.",
};

export function FangstSheet({
  onClose,
  onLagre,
  formel,
  oktLabel,
  autostart = true,
}: {
  onClose: () => void;
  /** Sender fangst-teksten samme vei som composeren (chat-tråden). */
  onLagre: (tekst: string) => void;
  /** Øktformel-utsnitt fra aktiv/nylig økt — null gir generiske chips. */
  formel: FangstFormel | null;
  /** Kontekstlinje under ledeteksten, f.eks. øktas tid og sted. */
  oktLabel?: string | null;
  /** Kontekst A: ett trykk fra composeren går rett i opptak (fasit §2). */
  autostart?: boolean;
}) {
  // «Ingen mikrofon» avgjøres ved init — Web Speech API mangler i Safari/Firefox.
  const [tilstand, setTilstand] = useState<FangstTilstand>(() => {
    if (typeof window === "undefined") return "hvile";
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ? "hvile" : "ingen_mikrofon";
  });
  const [transkript, setTranskript] = useState("");
  const [interim, setInterim] = useState("");
  const [valgteChips, setValgteChips] = useState<string[]>([]);
  const [skrivApen, setSkrivApen] = useState(false);
  const [skrevet, setSkrevet] = useState("");
  const [opptakMs, setOpptakMs] = useState(0);
  const [kvittering, setKvittering] = useState<{ kl: string; koet: boolean } | null>(null);
  const [angreSek, setAngreSek] = useState<number | null>(null);
  const [watchMs, setWatchMs] = useState(0);
  const [watchStoppet, setWatchStoppet] = useState<number | null>(null);

  const chips = deriveFangstChips(formel);
  const tag = fangstFormelTag(formel);

  // ── Refs for tidsstyring og pending fangst ──────────────────────────────
  const sheetRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLButtonElement>(null);
  const recogRef = useRef<InstanceType<NonNullable<typeof window.SpeechRecognition>> | null>(null);
  const recStartRef = useRef(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const angreTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const skrivDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t0Ref = useRef(0);
  const watchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingRef = useRef<string | null>(null);
  const finalTextRef = useRef("");
  const tilstandRef = useRef<FangstTilstand>("hvile");
  useEffect(() => {
    tilstandRef.current = tilstand;
  }, [tilstand]);

  const micStottet =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  // ── Levering: send eller kø (offline) ───────────────────────────────────
  const lever = useCallback(
    (tekst: string) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        skrivKo([...lesKo(), tekst]);
        return;
      }
      onLagre(tekst);
    },
    [onLagre],
  );

  /** Send det som ligger i pending (kalles ved lukking/avmontering). */
  const commitPending = useCallback(() => {
    if (pendingRef.current) {
      lever(pendingRef.current);
      pendingRef.current = null;
    }
  }, [lever]);

  // Flush offline-køen ved montering og når nettet kommer tilbake.
  useEffect(() => {
    const flush = () => {
      const ko = lesKo();
      if (ko.length === 0) return;
      skrivKo([]);
      ko.forEach((t) => onLagre(t));
    };
    if (typeof navigator === "undefined" || navigator.onLine) flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [onLagre]);

  // ── Stoppeklokke mot 20 s-målet (fasit §7 — midlertidig telemetri) ──────
  useEffect(() => {
    t0Ref.current = Date.now();
    watchTimerRef.current = setInterval(() => {
      setWatchMs(Date.now() - t0Ref.current);
    }, 100);
    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, []);

  // ── Autolagring: snapshot → kvittering + 10 s angre ─────────────────────
  const autosave = useCallback(() => {
    const rå = `${finalTextRef.current} ${skrevet}`.trim();
    const chipDel = valgteChips.map((c) => `[chip: ${c}]`).join(" ");
    const tekst = [rå, chipDel].filter(Boolean).join("\n").trim();
    if (!tekst) return;

    pendingRef.current = tekst;
    const koet = typeof navigator !== "undefined" && !navigator.onLine;
    setKvittering({ kl: klokke(new Date()), koet });
    setTilstand(koet ? "offline" : "lagret");
    setWatchStoppet((prev) => prev ?? Date.now() - t0Ref.current);

    if (angreTimerRef.current) clearInterval(angreTimerRef.current);
    setAngreSek(10);
    angreTimerRef.current = setInterval(() => {
      setAngreSek((n) => {
        if (n == null || n <= 1) {
          if (angreTimerRef.current) clearInterval(angreTimerRef.current);
          return n == null ? null : 0;
        }
        return n - 1;
      });
    }, 1000);
  }, [skrevet, valgteChips]);

  const autosaveRef = useRef(autosave);
  useEffect(() => {
    autosaveRef.current = autosave;
  }, [autosave]);

  // ── Angre: forkast alt, tilbake til hvile ───────────────────────────────
  const angre = useCallback(() => {
    if (angreTimerRef.current) clearInterval(angreTimerRef.current);
    pendingRef.current = null;
    finalTextRef.current = "";
    setTranskript("");
    setInterim("");
    setValgteChips([]);
    setSkrevet("");
    setKvittering(null);
    setAngreSek(null);
    setOpptakMs(0);
    setWatchStoppet(null);
    t0Ref.current = Date.now();
    setTilstand("hvile");
    micRef.current?.focus();
  }, []);

  // ── Talegjenkjenning (Web Speech API, nb-NO) ────────────────────────────
  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return; // init-tilstanden er allerede «ingen_mikrofon»
    const r = new Ctor();
    r.lang = "nb-NO";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (ev) => {
      let interimTekst = "";
      let finalTekst = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i];
        if (!res) continue;
        const alt = res[0];
        if (!alt) continue;
        if (res.isFinal) finalTekst += alt.transcript;
        else interimTekst += alt.transcript;
      }
      if (finalTekst) {
        finalTextRef.current = `${finalTextRef.current}${finalTekst} `;
        setTranskript(finalTextRef.current.trim());
        setInterim("");
      } else {
        setInterim(interimTekst);
      }
    };

    r.onerror = (ev) => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        setTilstand("ingen_mikrofon");
        setSkrivApen(true);
      } else if (tilstandRef.current === "opptak" || tilstandRef.current === "transkriberer") {
        setTilstand("hvile");
      }
    };

    r.onend = () => {
      if (tilstandRef.current !== "transkriberer" && tilstandRef.current !== "opptak") return;
      const elapsed = Date.now() - recStartRef.current;
      if (elapsed < 2000 || !finalTextRef.current.trim()) {
        // Fasit: under 2 s forkastes — chips-valgene står.
        finalTextRef.current = "";
        setTranskript("");
        setInterim("");
        setOpptakMs(0);
        setTilstand("for_kort");
        return;
      }
      setTranskript(finalTextRef.current.trim());
      setInterim("");
      // Autolagring straks transkripsjonen er ferdig. Ingen lagre-knapp.
      autosaveRef.current();
    };

    recogRef.current = r;
    return () => r.abort();
  }, []);

  const startOpptak = useCallback(() => {
    const r = recogRef.current;
    if (!r) {
      setTilstand("ingen_mikrofon");
      setSkrivApen(true);
      return;
    }
    finalTextRef.current = "";
    setTranskript("");
    setInterim("");
    recStartRef.current = Date.now();
    setOpptakMs(0);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    recTimerRef.current = setInterval(() => {
      setOpptakMs(Date.now() - recStartRef.current);
    }, 100);
    try {
      r.start();
      setTilstand("opptak");
    } catch {
      /* allerede aktiv */
    }
  }, []);

  const stoppOpptak = useCallback(() => {
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    setOpptakMs(Date.now() - recStartRef.current);
    setTilstand("transkriberer");
    try {
      recogRef.current?.stop();
    } catch {
      /* noop */
    }
  }, []);

  const micKlikk = useCallback(() => {
    if (tilstandRef.current === "ingen_mikrofon") return;
    if (tilstandRef.current === "opptak") stoppOpptak();
    else startOpptak();
  }, [startOpptak, stoppOpptak]);

  // Kontekst A: ett trykk fra composeren går RETT i opptak — ingen meny først.
  const autostartetRef = useRef(false);
  useEffect(() => {
    micRef.current?.focus();
    if (autostart && micStottet && !autostartetRef.current) {
      autostartetRef.current = true;
      startOpptak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- autostart kun ved mount
  }, []);

  // ── Chips: hver chip er i seg selv en fangst — autolagring ved trykk ────
  const chipKlikk = useCallback((tekst: string) => {
    setValgteChips((prev) =>
      prev.includes(tekst) ? prev.filter((c) => c !== tekst) : [...prev, tekst],
    );
  }, []);
  // Autolagre når chips/skrevet endres og det finnes innhold (etter render,
  // så snapshot leser oppdatert state).
  const forsteRenderRef = useRef(true);
  useEffect(() => {
    if (forsteRenderRef.current) {
      forsteRenderRef.current = false;
      return;
    }
    if (valgteChips.length > 0 || skrevet.trim() || finalTextRef.current.trim()) {
      if (skrivDebounceRef.current) clearTimeout(skrivDebounceRef.current);
      skrivDebounceRef.current = setTimeout(() => autosaveRef.current(), 700);
    }
  }, [valgteChips, skrevet]);

  // ── Lukking: Esc + commit av pending ved avmontering ────────────────────
  const lukk = useCallback(() => {
    commitPending();
    onClose();
  }, [commitPending, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        lukk();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [lukk]);

  useEffect(() => {
    return () => {
      // Avmontering uten eksplisitt lukking (navigasjon) — ingenting går tapt.
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      if (angreTimerRef.current) clearInterval(angreTimerRef.current);
      if (skrivDebounceRef.current) clearTimeout(skrivDebounceRef.current);
      commitPending();
    };
  }, [commitPending]);

  // ── Rendering ───────────────────────────────────────────────────────────
  const visKvittering = kvittering != null && (tilstand === "lagret" || tilstand === "offline");
  const tomt =
    tilstand === "hvile" && !transkript && !interim && valgteChips.length === 0 && !skrevet.trim();
  const watchVerdi = watchStoppet ?? watchMs;
  const watchFerdig = watchStoppet != null;
  const innenfor = watchVerdi < 20_000;

  const ghostBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--p-s2)",
    minHeight: "var(--p-tap)",
    padding: "0 var(--p-s4)",
    fontFamily: "var(--p-ui)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--p-fg)",
    background: "transparent",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-r)",
    cursor: "pointer",
  };

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={lukk}
        style={{ position: "fixed", inset: 0, background: "var(--p-scrim)", zIndex: 92 }}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Fang med stemmen"
        data-paper-slug="fangstsheet"
        data-od-id="fangst-sheet"
        data-state={tilstand}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 93,
          background: "var(--p-surface)",
          color: "var(--p-fg)",
          borderTop: "1px solid var(--p-border)",
          borderRadius: "var(--p-r) var(--p-r) 0 0",
          boxShadow: "var(--p-shadow)",
          padding: "var(--p-s3) var(--p-s4) calc(var(--p-s5) + env(safe-area-inset-bottom))",
          maxHeight: "88vh",
          overflow: "auto",
          fontFamily: "var(--p-ui)",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--p-s3)", minWidth: 0 }}>
          {/* Grab-håndtak */}
          <div
            aria-hidden
            style={{ width: 36, height: 4, borderRadius: 999, background: "var(--p-border)", margin: "0 auto" }}
          />

          {/* Hode: kontekst + formel-tag + lukk */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--p-s2)", flexWrap: "wrap", minWidth: 0 }}>
            <span
              style={{
                fontFamily: "var(--p-mono)",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "var(--p-muted)",
              }}
            >
              Fangst
            </span>
            <span style={{ flex: "1 1 auto" }} />
            {tag && (
              <span
                className="num"
                style={{
                  fontFamily: "var(--p-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "3px var(--p-s2)",
                  borderRadius: 999,
                  background: "var(--p-soft)",
                  color: "var(--p-muted)",
                  border: "1px solid var(--p-border)",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </span>
            )}
            <button
              type="button"
              onClick={lukk}
              aria-label="Lukk"
              data-od-id="fangst-lukk"
              style={{ ...ghostBtn, width: "var(--p-tap)", padding: 0 }}
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <p style={{ margin: 0, fontFamily: "var(--p-disp)", fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}>
              Hva la du merke til?
            </p>
            {oktLabel && (
              <p style={{ margin: "2px 0 0", fontFamily: "var(--p-body)", fontSize: 13.5, color: "var(--p-muted)" }}>
                {oktLabel}
              </p>
            )}
          </div>

          {/* Scene: mikrofon (komponentens ENE clay-flate) + teller + hint */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--p-s2)", padding: "var(--p-s3) 0 var(--p-s1)" }}>
            <button
              ref={micRef}
              type="button"
              onClick={micKlikk}
              aria-disabled={tilstand === "ingen_mikrofon" || undefined}
              aria-label={
                tilstand === "ingen_mikrofon"
                  ? "Mikrofon er ikke tilgjengelig"
                  : tilstand === "opptak"
                    ? "Stopp opptak"
                    : "Start opptak"
              }
              data-od-id="fangst-mic"
              style={{
                position: "relative",
                width: "var(--p-tap-capture)",
                height: "var(--p-tap-capture)",
                minHeight: "var(--p-tap-capture)",
                padding: 0,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border:
                  tilstand === "ingen_mikrofon"
                    ? "1px solid var(--p-border)"
                    : "1px solid var(--p-accent)",
                background: tilstand === "ingen_mikrofon" ? "transparent" : "var(--p-accent)",
                color: tilstand === "ingen_mikrofon" ? "var(--p-muted)" : "var(--p-on-accent)",
                cursor: tilstand === "ingen_mikrofon" ? "not-allowed" : "pointer",
              }}
            >
              {tilstand === "opptak" && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: -8,
                    borderRadius: 999,
                    border: "2px solid var(--p-accent)",
                    animation: "fangst-ring 1.4s var(--p-ease) infinite",
                  }}
                />
              )}
              {tilstand === "opptak" ? <Square size={24} fill="currentColor" /> : <Mic size={26} />}
            </button>
            <span className="num" style={{ fontFamily: "var(--p-mono)", fontSize: 15, fontWeight: 500, color: "var(--p-muted)" }}>
              {sek(opptakMs)}
            </span>
            <p style={{ margin: 0, fontFamily: "var(--p-body)", fontSize: 13.5, color: "var(--p-muted)", textAlign: "center", maxWidth: "40ch" }}>
              {HINT[tilstand]}
            </p>
          </div>

          {/* Skjelettlinjer under transkribering (fasit §5) */}
          {tilstand === "transkriberer" && (
            <div aria-hidden>
              {["100%", "70%", "45%"].map((w) => (
                <div
                  key={w}
                  className="skel"
                  style={{
                    width: w,
                    height: 12,
                    marginBottom: "var(--p-s2)",
                    background: "var(--p-soft)",
                    borderRadius: "var(--p-r-sm)",
                    animation: "fangst-puls 1.6s var(--p-ease) infinite",
                  }}
                />
              ))}
            </div>
          )}

          {/* Transkripsjon */}
          {(transkript || interim) && (
            <div
              aria-live="polite"
              style={{
                padding: "var(--p-s3)",
                background: "var(--p-soft)",
                border: "1px solid var(--p-border)",
                borderRadius: "var(--p-r)",
                fontFamily: "var(--p-body)",
                fontSize: 14.5,
                lineHeight: 1.62,
              }}
            >
              {transkript}
              {interim && <em style={{ opacity: 0.7 }}> {interim}</em>}
            </div>
          )}

          {/* Tom tilstand — aldri en tom flate uten neste steg */}
          {tomt && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--p-s2)",
                padding: "var(--p-s4)",
                background: "var(--p-soft)",
                border: "1px dashed var(--p-border)",
                borderRadius: "var(--p-r)",
              }}
            >
              <span style={{ fontFamily: "var(--p-disp)", fontSize: 15, fontWeight: 600 }}>
                Ingenting fanget ennå
              </span>
              <span style={{ fontFamily: "var(--p-body)", fontSize: 14, color: "var(--p-muted)", maxWidth: "46ch" }}>
                Trykk mikrofonen og si det med dine egne ord, eller velg en chip. Begge deler teller.
              </span>
            </div>
          )}

          {/* Skriv i stedet (alltid åpen når mikrofonen mangler) */}
          {(skrivApen || tilstand === "ingen_mikrofon") && (
            <div>
              <label
                htmlFor="fangst-skriv"
                style={{
                  display: "block",
                  marginBottom: "var(--p-s1)",
                  fontFamily: "var(--p-mono)",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "var(--p-muted)",
                }}
              >
                Skriv i stedet
              </label>
              <textarea
                id="fangst-skriv"
                rows={2}
                value={skrevet}
                onChange={(e) => setSkrevet(e.target.value)}
                placeholder="Skriv med dine egne ord …"
                data-od-id="fangst-skriv"
                style={{
                  width: "100%",
                  minHeight: "var(--p-tap-lg)",
                  padding: "var(--p-s3)",
                  fontFamily: "var(--p-body)",
                  fontSize: 14,
                  color: "var(--p-fg)",
                  background: "var(--p-surface)",
                  border: "1px solid var(--p-border)",
                  borderRadius: "var(--p-r)",
                  resize: "vertical",
                }}
              />
            </div>
          )}

          {/* Chips — avledet av øktformelen, ≥44px, autolagres ved trykk */}
          <div role="group" aria-label="Velg det som stemmer" style={{ display: "flex", gap: "var(--p-s2)", flexWrap: "wrap" }}>
            {chips.map((c) => {
              const valgt = valgteChips.includes(c.tekst);
              return (
                <button
                  key={c.tekst}
                  type="button"
                  aria-pressed={valgt}
                  onClick={() => chipKlikk(c.tekst)}
                  data-od-id="fangst-chip"
                  data-chip-kategori={c.kategori}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "var(--p-tap)",
                    padding: "0 var(--p-s4)",
                    fontFamily: "var(--p-ui)",
                    fontSize: 12.5,
                    color: valgt ? "var(--p-bg)" : "var(--p-fg)",
                    background: valgt ? "var(--p-fg)" : "var(--p-surface)",
                    border: `1px solid ${valgt ? "var(--p-fg)" : "var(--p-border)"}`,
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                >
                  {c.tekst}
                </button>
              );
            })}
          </div>

          {/* Kvittering i flaten — klokkeslett, ikke toast + 10 s angre */}
          {visKvittering && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--p-s3)",
                flexWrap: "wrap",
                padding: "var(--p-s3)",
                background: "var(--p-soft)",
                border: "1px solid var(--p-border)",
                borderRadius: "var(--p-r)",
                fontSize: 12.5,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: kvittering.koet ? "var(--p-info)" : "var(--p-up)",
                }}
              />
              <span>
                {kvittering.koet ? "Lagret lokalt " : "Lagret "}
                <span className="num" style={{ fontFamily: "var(--p-mono)" }}>{kvittering.kl}</span>
                {kvittering.koet ? " · køet for synk" : ""}
              </span>
              <span style={{ flex: "1 1 auto" }} />
              {angreSek != null && angreSek > 0 ? (
                <button type="button" onClick={angre} data-od-id="fangst-angre" style={{ ...ghostBtn, fontSize: 12 }}>
                  Angre <span className="num" style={{ fontFamily: "var(--p-mono)" }}>{angreSek}</span>&nbsp;s
                </button>
              ) : (
                <span style={{ color: "var(--p-muted)" }}>Angrefrist ute</span>
              )}
            </div>
          )}

          {/* Fot: stoppeklokke (midlertidig telemetri) + skriv-toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--p-s2)", flexWrap: "wrap" }}>
            <span
              data-verdict={watchFerdig ? (innenfor ? "ok" : "over") : ""}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--p-s2)",
                padding: "var(--p-s1) var(--p-s3)",
                border: "1px solid var(--p-border)",
                borderRadius: 999,
                background: "var(--p-surface)",
                fontSize: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--p-mono)",
                  fontSize: 10,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "var(--p-muted)",
                }}
              >
                Tid
              </span>
              <span className="num" style={{ fontFamily: "var(--p-mono)", fontSize: 13.5, fontWeight: 600 }}>
                {sek(watchVerdi)}
              </span>
              <span
                style={{
                  fontFamily: "var(--p-body)",
                  color: watchFerdig ? (innenfor ? "var(--p-up)" : "var(--p-dn)") : "var(--p-muted)",
                }}
              >
                {watchFerdig ? (innenfor ? "innenfor målet på 20 s" : "over målet på 20 s") : "måler …"}
              </span>
            </span>
            <span style={{ flex: "1 1 auto" }} />
            {tilstand !== "ingen_mikrofon" && (
              <button
                type="button"
                onClick={() => setSkrivApen((v) => !v)}
                data-od-id="fangst-skriv-toggle"
                style={ghostBtn}
              >
                Skriv i stedet
              </button>
            )}
          </div>
        </div>
        <style>{`
          @keyframes fangst-ring{ 0%{ transform:scale(.92); opacity:.55 } 70%{ transform:scale(1.22); opacity:0 } 100%{ opacity:0 } }
          @keyframes fangst-puls{ 0%,100%{opacity:1} 50%{opacity:.55} }
          @media (prefers-reduced-motion: reduce){
            [data-paper-slug="fangstsheet"] *{ animation-duration:.01ms !important; animation-iteration-count:1 !important; }
          }
        `}</style>
      </div>
    </>,
    document.body,
  );
}
