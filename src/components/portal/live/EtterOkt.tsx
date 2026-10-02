"use client";

/**
 * PH-07 Etter økt. Portert fra Claude Design «AK Golf Precision Athletics»
 * (7d7c2994), ui_kits/playerhq/screens/PH-live.jsx, runde 24. Natt, én kolonne,
 * fokusflate uten fanelinje, én fullbredde primærhandling nederst.
 *
 * Golf: tid totalt og per drill mot plan, reps mot plan, Belastning 1–10 og
 * valgfritt Fokus 1–10 og Kvalitet 1–5. Fysisk: tid og serier mot plan.
 * Vurdering er valgfri; kvalitet og belastning lagres sammen.
 * Manglende verdi vises som «—», aldri gjetning (se byggEtterOkt).
 *
 * Avvik fra tegningen:
 *   - Skalaene 1–10 står i to rader à fem under 600 px. Tegningens 32 px brede
 *     knapper er under kravet på 44 px treffmål.
 *   - Valgfritt notat til coach beholdes (lagreDineOrd fantes før porteringen).
 *   - Per øvelse-lista vises også for fysisk økt (serier mot plan).
 *   - «Neste økt» og lenkene til planen og Stats vises etter lagring.
 */
import { useEffect, useRef, useState, useSyncExternalStore, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleDashed, CloudOff, X } from "lucide-react";
import { FeilTilstand, Ikon, Knapp, KnappLenke, Meta, StatusPille, Tall, TomTilstand } from "@/components/precision/pa";
import { lagreSpillerVurdering } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { byggEtterOkt, mmss, type EtterOkt as EtterOktTall } from "@/lib/portal-live/etter-okt";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { byggLagringsNokkel } from "@/lib/offline-queue/eier-scope";
import type { LiveV2Summary } from "./types";
import "@/styles/precision-athletics.css";

export type EtterOktProps = {
  data: LiveV2Summary;
  nesteOkt?: { tekst: string; href: string } | null;
  /** Allerede lagret vurdering (completedSummary.spillerVurdering). */
  vurdering?: { kvalitet?: number | null; folelse?: string | null; nesteFokus?: string | null; rpe: number | null; fokus: number | null } | null;
  bekreftet?: boolean;
  /** Allerede lagret notat (completedSummary.dineOrd). */
  lagretNotat?: string | null;
};

const stor: CSSProperties = { font: "600 32px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" };
const kolonne: CSSProperties = { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 };

function useBred(): boolean {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia("(min-width: 600px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia("(min-width: 600px)").matches,
    () => false,
  );
}

function Skala({ label, verdi, set, lo, hi, bred, disabled, n = 10 }: { label: string; verdi: number | null; set: (n: number) => void; lo: string; hi: string; bred: boolean; disabled?: boolean; n?: number }) {
  return <div role="group" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ flex: 1, font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{label}</span>
      <Meta>{verdi == null ? "—" : `${verdi} AV ${n}`}</Meta>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(n, bred ? 10 : 5)},minmax(0,1fr))`, gap: 4 }}>
      {Array.from({ length: n }, (_, i) => i + 1).map((k) => <button key={k} type="button" aria-pressed={verdi === k} disabled={disabled} onClick={() => set(k)}
        style={{ height: 52, minWidth: 44, padding: 0, borderRadius: 6, border: `1px solid ${verdi === k ? "var(--border-ink)" : "var(--border-hairline)"}`, background: verdi === k ? "var(--primary)" : "var(--surface-card)", color: verdi === k ? "var(--text-on-primary)" : "var(--text-primary)", font: "600 15px/1 var(--font-mono)", cursor: disabled ? "default" : "pointer" }}>{k}</button>)}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><Meta>{lo}</Meta><Meta style={{ textAlign: "right" }}>{hi}</Meta></div>
  </div>;
}

function Rad({ f, first }: { f: EtterOktTall["rader"][number]; first: boolean }) {
  return <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 12, alignItems: "center", minHeight: 60, borderTop: first ? "none" : "1px solid var(--border-hairline)", padding: "6px 0", minWidth: 0 }}>
    <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", minWidth: 0, textWrap: "pretty", overflowWrap: "anywhere" }}><span>{f.navn}</span>{f.detaljer.map((d, i) => <span key={i} style={{ display: "block", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{d.label}: {d.verdi}</span>)}{f.notat && <span style={{ display: "block", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{f.notat}</span>}</span>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}><Tall style={{ font: "600 14px/1 var(--font-mono)" }}>{mmss(f.sek)}</Tall><Meta>AV {mmss(f.planSek)}</Meta></span>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end", minWidth: 56 }}><Tall style={{ font: "600 14px/1 var(--font-mono)" }}>{f.antall ?? "—"}</Tall><Meta>{f.enhet === "serier" ? "SERIER " : ""}AV {f.planAntall ?? "—"}</Meta></span>
  </div>;
}

export function EtterOkt({ data, nesteOkt, vurdering, lagretNotat, bekreftet }: EtterOktProps) {
  const eierId = useLokalDataEier();
  const bred = useBred();
  const tall = byggEtterOkt(data);
  const fys = tall.variant === "fys";
  const erTapper = data.logSource === "tapper";
  const tapperAntall = erTapper ? tall.antall : null;
  const harSkjema = !erTapper;
  const [kvalitet, setKvalitet] = useState<number | null>(vurdering?.kvalitet ?? null);
  const savedRating = useRef({ kvalitet: vurdering?.kvalitet ?? null, rpe: vurdering?.rpe ?? null, fokus: vurdering?.fokus ?? null });
  const saving = useRef(false);
  const [rpe, setRpe] = useState<number | null>(vurdering?.rpe ?? null);
  const [fokus, setFokus] = useState<number | null>(vurdering?.fokus ?? null);
  const [notat, setNotat] = useState(lagretNotat ?? "");
  const [lagret, setLagret] = useState(Boolean(bekreftet || (vurdering?.kvalitet != null && vurdering.rpe != null)));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Notatene spilleren skrev underveis i økta ligger i nettleseren og er utgangspunkt for notatfeltet.
  useEffect(() => {
    if (lagretNotat != null) return;
    const t = setTimeout(() => {
      try {
        const key = byggLagringsNokkel(`akhq-live-notater-${data.sessionId}`, eierId);
        const raw = key ? sessionStorage.getItem(key) : null;
        const arr: unknown = raw ? JSON.parse(raw) : [];
        const tekster = Array.isArray(arr) ? arr.map((n) => (n && typeof n === "object" && typeof (n as { tekst?: unknown }).tekst === "string" ? (n as { tekst: string }).tekst : "")).filter(Boolean) : [];
        if (tekster.length) setNotat((n) => n || tekster.join("\n"));
      } catch { /* Ingen lagrede notater. */ }
    }, 0);
    return () => clearTimeout(t);
  }, [data.sessionId, eierId, lagretNotat]);

  const kanLagre = kvalitet != null && rpe != null;

  function lagre(medVurdering = true) {
    if ((medVurdering && !kanLagre) || saving.current) return;
    saving.current = true;
    setFeil(null);
    start(async () => {
      try {
        if (!navigator.onLine) { setFeil("Du er uten nett. Koble til og prøv igjen."); return; }
        const v = await lagreSpillerVurdering(data.sessionId, {
          ...(medVurdering ? { kvalitet: kvalitet ?? undefined, rpe: rpe ?? undefined, ...(fys ? {} : { fokus }) } : { utenVurdering: true }),
          notat: notat.trim(),
        });
        if (!v.ok) { setFeil(v.error ?? "Vurderingen ble ikke lagret."); return; }
        if (medVurdering) savedRating.current = { kvalitet, rpe, fokus };
        else {
          setKvalitet(savedRating.current.kvalitet); setRpe(savedRating.current.rpe); setFokus(savedRating.current.fokus);
        }
        setLagret(true);
      } catch {
        setFeil("Kunne ikke bekrefte lagringen.");
      } finally { saving.current = false; }
    });
  }

  const tom = tall.tom && !erTapper;
  const lagretMeta = data.coachName ? `DELT MED ${data.coachName.toUpperCase()}` : "";

  return <div className="pa-root" data-theme="night" data-design="precision-athletics" data-od-id="playerhq-live-summary" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--surface-page)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
    <div style={{ flex: 1, width: "100%", maxWidth: 720, margin: "0 auto", boxSizing: "border-box", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56 }}>
        <Link href="/portal" aria-label="Lukk" className="pa-btn pa-btn--secondary" style={{ width: 56, height: 56, padding: 0, flex: "none" }}><Ikon icon={X} size={22} name="x" /></Link>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <div className="kicker">Etter økt</div>
          <Meta>{data.title.toUpperCase()}</Meta>
        </div>
      </div>

      {tom
        ? <TomTilstand icon={CircleDashed} title={fys ? "Ingen serier ble fullført" : "Ingen øvelser ble fullført"} text="Ingen gjennomføring er registrert i oppsummeringen. Du kan legge til en vurdering eller et notat." />
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
          <div style={kolonne}><Meta>TID TOTALT</Meta><span style={stor}>{mmss(tall.totalSek)}</span><Meta>{tall.planSek != null ? `AV ${mmss(tall.planSek)} PLANLAGT` : "PLAN —"}</Meta></div>
          <div style={kolonne}><Meta>{fys ? "SERIER" : erTapper ? "SLAG" : "REPS"}</Meta><span style={stor}>{(erTapper ? tapperAntall : tall.antall) ?? "—"}</span><Meta>{tall.planAntall != null ? `AV ${tall.planAntall} PLANLAGT` : "PLAN —"}</Meta></div>
        </div>}

      {!tom && tall.rader.length > 0 && <section aria-label="Per øvelse" style={{ display: "flex", flexDirection: "column" }}>
        <Meta>{data.drillsCompleted} AV {data.drills.length} ØVELSER FULLFØRT</Meta>
        <Meta>{fys ? "PER ØVELSE · TID OG SERIER MOT PLAN" : "PER ØVELSE · TID OG REPETISJONER MOT PLAN"}</Meta>
        <div role="list">{tall.rader.map((f, i) => <Rad key={f.id} f={f} first={i === 0} />)}</div>
      </section>}

      {harSkjema && <section aria-label="Vurdering (valgfri)" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Meta>VURDERING · VALGFRI</Meta>
        <Skala label="Kvalitet" n={5} verdi={kvalitet} set={(n) => setKvalitet(kvalitet === n ? null : n)} lo="1 DÅRLIG" hi="5 SVÆRT GOD" bred={bred} disabled={pending || lagret} />
        <Skala label="Belastning" verdi={rpe} set={(n) => setRpe(rpe === n ? null : n)} lo="1 SVÆRT LETT" hi="10 MAKS" bred={bred} disabled={pending || lagret} />
        {!fys && <Skala label="Fokus (valgfritt)" verdi={fokus} set={(n) => setFokus(fokus === n ? null : n)} lo="1 UKONSENTRERT" hi="10 HELT TIL STEDE" bred={bred} disabled={pending || lagret} />}
        {!lagret && <Meta>Kvalitet og belastning lagres sammen. Du kan også lagre uten vurdering.</Meta>}
      </section>}

      {harSkjema && (vurdering?.folelse || vurdering?.nesteFokus) && <details>
        <summary style={{ minHeight: 44, paddingTop: 12, cursor: "pointer" }}>Tidligere vurdering</summary>
        {vurdering.folelse && <p>Følelse: {vurdering.folelse}</p>}
        {vurdering.nesteFokus && <p>Neste fokus: {vurdering.nesteFokus}</p>}
      </details>}

      {harSkjema && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="etter-okt-notat" style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>Notat til coach <Meta>VALGFRITT</Meta></label>
        <textarea id="etter-okt-notat" value={notat} maxLength={2000} rows={3} onChange={(e) => setNotat(e.target.value)} disabled={pending || lagret}
          placeholder="Kort om hvordan det gikk."
          style={{ width: "100%", boxSizing: "border-box", minHeight: 96, padding: 12, resize: "vertical", background: "var(--surface-card)", color: "var(--text-primary)", border: "1px solid var(--border-control)", borderRadius: "var(--radius)", font: "var(--type-body)" }} />
      </div>}

      {data.coachName && <p style={{ margin: 0, font: "600 16px/1.4 var(--font-sans)", color: "var(--text-primary)" }}>Coach ser økta.</p>}

      {feil && <FeilTilstand icon={CloudOff} title="Vurderingen kunne ikke lagres" text={`${feil} Feltene er bevart. Prøv igjen.`} />}

      {lagret && nesteOkt && <section className="pa-card" style={{ padding: 16, gap: 8 }}>
        <span className="kicker">Neste økt</span>
        <Link href={nesteOkt.href} data-od-id="etter-kvitt-neste" style={{ display: "flex", alignItems: "center", minHeight: 44, font: "500 15px/1.4 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{nesteOkt.tekst}</Link>
      </section>}
    </div>

    <div style={{ position: "sticky", bottom: 0, zIndex: 5, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", boxSizing: "border-box", padding: "12px 16px calc(16px + env(safe-area-inset-bottom) + var(--cookie-banner-height, 0px))", display: "flex", flexDirection: "column", gap: 8 }}>
        {!harSkjema
          ? <KnappLenke size="xl" fullWidth icon={ArrowLeft} href="/portal">Til I dag</KnappLenke>
          : lagret
            ? <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minHeight: 64 }}>
              <span role="status"><StatusPille tone="ok">Lagret</StatusPille></span>{lagretMeta && <Meta>{lagretMeta}</Meta>}
              <span style={{ flex: 1 }} />
              <Knapp variant="ghost" onClick={() => { setLagret(false); setFeil(null); }}>Endre</Knapp>
              <KnappLenke variant="secondary" href="/portal">Til I dag</KnappLenke>
            </div>
            : <><Knapp size="xl" fullWidth icon={Check} iconName="check" disabled={!kanLagre || pending} loading={pending} style={{ height: 64 }} onClick={() => lagre()}>{feil ? "Prøv igjen" : "Lagre økta"}</Knapp><Knapp size="xl" variant="secondary" fullWidth disabled={pending} onClick={() => lagre(false)}>Lagre uten vurdering</Knapp></>}
        {lagret && <nav aria-label="Etter økta" style={{ display: "flex", flexWrap: "wrap", gap: "0 20px" }}>
          <Link href="/portal/planlegge" data-od-id="etter-kvitt-plan" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, font: "500 14px/1 var(--font-sans)", color: "var(--text-secondary)" }}>Til planen</Link>
          <Link href="/portal/analysere" data-od-id="etter-kvitt-analyse" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, font: "500 14px/1 var(--font-sans)", color: "var(--text-secondary)" }}>Se utviklingen i Stats</Link>
        </nav>}
      </div>
    </div>
  </div>;
}
