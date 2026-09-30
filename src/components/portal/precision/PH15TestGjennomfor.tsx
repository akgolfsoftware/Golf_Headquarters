"use client";

/**
 * PH-15 Test: gjennomfør — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-15.jsx etag 1790434195422386 og PH-15-tn.jsx
 * etag 1790611488899113, nattflate).
 *
 * Ren visning: all lagring og fullføring ligger i klientene under
 * src/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/. Samme
 * komponenter brukes av prøvefila tests/visual/precision/skjermer/PH-15.tsx.
 *
 * To varianter, samme skall (topplinje, kort, scorekort, handlingslinje):
 *   - PH15Innspill: ett tall per slag (meter til mål), PEI-protokollene.
 *   - PH15Treff: Treff eller Bom per slag, gate-protokollene.
 *
 * Bevisste avvik fra tegningen:
 *   - Tegningen teller «innenfor 4 m». Appen har ingen slik grense: Innspill
 *     regner PEI (til mål delt på målavstand), så kortene viser snitt PEI og
 *     snitt til mål, og scorekortet har ingen understreking.
 *   - Innspill har et eget felt for målavstand (tegningen har fast «ca. 50 m»).
 *     Protokollen lar spilleren føre både målavstand og til mål per slag.
 *   - Gate-protokollen for putting krever V eller H ved Bom. Egen rad, som
 *     tegningen ikke har.
 *   - Steg for meter til mål er ±0,1 og ±1 (tegningen har ±0,5): protokollen føres på desimeter.
 *   - Ingen tilbakepil i toppen, som tegnet: Avslutt er veien ut.
 *   - «Til testene» etter lagring finnes ikke: lagring sender spilleren til
 *     testsiden med kvittering (server-redirect), som før.
 */
import { useState, type ReactNode } from "react";
import { Check, CircleAlert, Plus, Target, Undo2, X } from "lucide-react";
import { Dialogboks } from "@/components/precision/pa-a4";
import { FeilTilstand, Knapp, LasterTilstand, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Ikon } from "@/components/precision/pa";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

export type PH15Tilstand = "data" | "tom" | "laster" | "feil";

const MAKS_BREDDE = 600;

/** Norsk desimal med ett siffer: 3,5. */
export function dec(n: number): string {
  return n.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

type SkallProps = {
  tilstand: PH15Tilstand;
  /** Caps-linjen i toppen, f.eks. «INNSPILL BASIC · 10 SLAG». */
  meta: string;
  onAvslutt: () => void;
  avslutter: boolean;
  antallForsok: number;
  totalt: number;
  /** Feil fra lagring/fullføring som vises over innholdet. */
  lagreFeil: { tittel: string; tekst: string; kode: string } | null;
  action: ReactNode | null;
  children: ReactNode;
};

function Skall(p: SkallProps) {
  const [avslutt, setAvslutt] = useState(false);
  return (
    <div className="pa-root" data-theme="night" data-design="precision-athletics" data-screen="PH-15"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, width: "100%", maxWidth: MAKS_BREDDE, margin: "0 auto", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56, minWidth: 0 }}>
          <StatusPille tone="live">Test</StatusPille>
          <Meta style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.meta.toUpperCase()}</Meta>
          <Knapp variant="ghost" onClick={() => setAvslutt(true)} disabled={p.avslutter} style={{ height: 56 }}>Avslutt</Knapp>
        </div>

        {p.tilstand === "laster" && <LasterTilstand text="Henter testprotokollen …" />}
        {p.tilstand === "feil" && (
          <FeilTilstand icon={CircleAlert} title="Testen kunne ikke startes"
            text="Protokollen kunne ikke lastes. Registrerte slag er lagret på telefonen." code="FRAKOBLET · TEST" />
        )}
        {p.lagreFeil && <FeilTilstand icon={CircleAlert} title={p.lagreFeil.tittel} text={p.lagreFeil.tekst} code={p.lagreFeil.kode} />}

        {(p.tilstand === "data" || p.tilstand === "tom") && p.children}
      </div>

      {(p.tilstand === "data" || p.tilstand === "tom") && p.action && (
        <div style={{ position: "sticky", bottom: 0, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", zIndex: 5 }}>
          <div style={{ maxWidth: MAKS_BREDDE, margin: "0 auto", padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 8 }}>
            {p.action}
          </div>
        </div>
      )}

      <Dialogboks open={avslutt} onClose={() => setAvslutt(false)} title="Avslutte testen?"
        footer={<>
          <Knapp size="xl" variant="secondary" onClick={() => setAvslutt(false)}>Fortsett</Knapp>
          <Knapp size="xl" onClick={() => { setAvslutt(false); p.onAvslutt(); }}>Avslutt uten å lagre</Knapp>
        </>}>
        {p.antallForsok} av {p.totalt} slag er registrert. En test må ha alle {p.totalt} slag for å telle. Slagene lagres ikke.
      </Dialogboks>
    </div>
  );
}

function Tittel({ tittel, meta }: { tittel: string; meta: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <h1 style={{ margin: 0, font: "var(--type-title-l)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{tittel}</h1>
      <Meta style={{ display: "block", marginTop: 6, overflowWrap: "anywhere" }}>{meta.toUpperCase()}</Meta>
    </div>
  );
}

function Nokkeltall({ rader }: { rader: readonly (readonly [string, string])[] }) {
  return (
    <div className="pa-card" style={{ padding: 16, gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${rader.length},minmax(0,1fr))`, gap: 12 }}>
        {rader.map(([k, v]) => (
          <div key={k} style={{ minWidth: 0 }}>
            <Meta>{k.toUpperCase()}</Meta>
            <div style={{ font: "600 21px/1.2 var(--font-mono)", color: "var(--text-primary)", marginTop: 4, overflowWrap: "anywhere" }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Rute = { hoved: string; under?: string | null; ok?: boolean };

function Scorekort({ celler, nesteIdx, kolonner, meta, fotnote }: {
  celler: readonly (Rute | null)[]; nesteIdx: number; kolonner: number; meta: string; fotnote?: string;
}) {
  return (
    <div className="pa-card" style={{ padding: 12, gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", padding: "0 4px" }}>
        <span className="kicker">Scorekort</span>
        <Meta>{meta.toUpperCase()}</Meta>
      </div>
      <div role="list" style={{ display: "grid", gridTemplateColumns: `repeat(${kolonner},minmax(0,1fr))`, gap: 6 }}>
        {celler.map((c, i) => (
          <div role="listitem" key={i}
            aria-label={`Slag ${i + 1}` + (c ? ` ${c.hoved}${c.under ? ", " + c.under : ""}` : " ikke slått")}
            style={{
              minHeight: 64, borderRadius: 8, minWidth: 0, padding: "4px 2px",
              border: "1px solid " + (i === nesteIdx ? "var(--border-ink)" : "var(--border-hairline)"),
              background: c?.ok ? "var(--surface-sunken)" : "transparent",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            }}>
            <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)" }}>{i + 1}</span>
            <span style={{ font: "600 15px/1 var(--font-mono)", color: c ? "var(--text-primary)" : "var(--text-faint)", overflowWrap: "anywhere", textAlign: "center",
              textDecoration: c?.ok ? "underline" : "none", textUnderlineOffset: 4, textDecorationThickness: 2 }}>{c ? c.hoved : "—"}</span>
            {c?.under && <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)" }}>{c.under}</span>}
          </div>
        ))}
      </div>
      {fotnote && <Meta style={{ padding: "0 4px" }}>{fotnote.toUpperCase()}</Meta>}
    </div>
  );
}

function AngreKnapp({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="pa-btn pa-btn--ghost" onClick={onClick} disabled={disabled} style={{ minHeight: 44 }}>
      <Ikon icon={Undo2} size={18} name="undo-2" />
      <span>Angre siste</span>
    </button>
  );
}

const stegKnapp: React.CSSProperties = {
  height: 72, flex: "1 1 0", minWidth: 0, borderRadius: 8, border: "1px solid var(--border-strong)",
  background: "var(--surface-card)", color: "var(--text-primary)", font: "600 21px/1 var(--font-mono)", cursor: "pointer",
};

/* ────────────────────────────── Innspill (PEI) ───────────────────────────── */

export type PH15InnspillProps = {
  tilstand: PH15Tilstand;
  tittel: string;
  meta: string;
  shots: number;
  /** Førte slag i rekkefølge (bare de ferdige). */
  slag: readonly { malAvstandM: number; tillMalM: number }[];
  snittPei: string | null;
  snittTilMal: number | null;
  malAvstand: number;
  tillMal: number;
  onMalAvstand: (v: number) => void;
  onTillMal: (v: number) => void;
  onRegistrer: () => void;
  onAngre: () => void;
  onLagre: () => void;
  onAvslutt: () => void;
  opptatt: boolean;
  lagreFeil: { tittel: string; tekst: string; kode: string } | null;
};

export function PH15Innspill(p: PH15InnspillProps) {
  const n = p.slag.length;
  const ferdig = n >= p.shots;
  const celler: (Rute | null)[] = Array.from({ length: p.shots }, (_, i) =>
    p.slag[i] ? { hoved: dec(p.slag[i].tillMalM), under: dec(p.slag[i].malAvstandM) + " m" } : null);
  const rundt = (v: number) => Math.max(0, Math.round(v * 100) / 100);

  const action = ferdig ? (
    <Knapp size="xl" fullWidth icon={Check} iconName="check" style={{ height: 64 }} loading={p.opptatt} loadingText="Lagrer …" onClick={p.onLagre}>
      Lagre resultat · snitt PEI {p.snittPei ?? "—"}
    </Knapp>
  ) : (
    <Knapp size="xl" fullWidth icon={Plus} iconName="plus" style={{ height: 80, font: "600 21px/1 var(--font-sans)" }} onClick={p.onRegistrer} disabled={p.opptatt}>
      Registrer slag {n + 1} · {dec(p.tillMal)} m
    </Knapp>
  );

  return (
    <Skall tilstand={p.tilstand} meta={p.meta} onAvslutt={p.onAvslutt} avslutter={p.opptatt}
      antallForsok={n} totalt={p.shots} lagreFeil={p.lagreFeil} action={action}>
      <Tittel tittel={p.tittel} meta={`${p.shots} slag · meter til mål per slag`} />
      <Nokkeltall rader={[
        ["Snitt PEI", n ? (p.snittPei ?? "—") : "—"],
        ["Snitt til mål", p.snittTilMal == null ? "—" : dec(p.snittTilMal) + " m"],
        ["Slag", `${n} / ${p.shots}`],
      ]} />
      <Scorekort celler={celler} nesteIdx={n} kolonner={5} meta="Meter til mål" fotnote="Liten tekst = målavstand" />
      {p.tilstand === "tom" && n === 0 && (
        <TomTilstand icon={Target} title="Ingen slag registrert" text="Slå første slag, mål avstanden til mål og registrer." />
      )}
      {!ferdig ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <span className="pa-field__label" style={{ color: "var(--text-secondary)" }}>Målavstand</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button type="button" aria-label="Minus 5 meter" onClick={() => p.onMalAvstand(rundt(p.malAvstand - 5))}
                style={{ ...stegKnapp, height: 44, flex: "none", width: 56, font: "600 15px/1 var(--font-mono)" }}>−5</button>
              <span style={{ font: "600 17px/1 var(--font-mono)", color: "var(--text-primary)", minWidth: "6ch", textAlign: "center" }}>{dec(p.malAvstand)} m</span>
              <button type="button" aria-label="Pluss 5 meter" onClick={() => p.onMalAvstand(rundt(p.malAvstand + 5))}
                style={{ ...stegKnapp, height: 44, flex: "none", width: 56, font: "600 15px/1 var(--font-mono)" }}>+5</button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <span className="pa-field__label" style={{ color: "var(--text-secondary)" }}>Meter til mål · slag {n + 1}</span>
            {n > 0 && <AngreKnapp onClick={p.onAngre} disabled={p.opptatt} />}
          </div>
          <div style={{ textAlign: "center", padding: "0 0 4px" }}>
            <span style={{ font: "600 56px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{dec(p.tillMal)}</span>
            <span style={{ font: "var(--type-num)", color: "var(--text-muted)" }}> m</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {([-1, -0.1, 0.1, 1] as const).map((d) => (
              <button key={d} type="button" aria-label={(d > 0 ? "Pluss " : "Minus ") + dec(Math.abs(d)) + " meter"}
                onClick={() => p.onTillMal(rundt(p.tillMal + d))} style={stegKnapp}>{(d > 0 ? "+" : "−") + dec(Math.abs(d))}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pa-card" style={{ padding: 16, gap: 8 }}>
          <span className="kicker">Resultat</span>
          <div style={{ font: "600 29px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>Snitt PEI {p.snittPei ?? "—"}</div>
          <Meta>SNITT TIL MÅL {p.snittTilMal == null ? "—" : dec(p.snittTilMal) + " M"} · {p.shots} SLAG</Meta>
        </div>
      )}
    </Skall>
  );
}

/* ─────────────────────────────── Treff eller Bom ─────────────────────────── */

export type PH15TreffProps = {
  tilstand: PH15Tilstand;
  tittel: string;
  meta: string;
  shots: number;
  /** Ett element per slag: null = ikke slått, ellers treff/bom (+ side ved bom). */
  slag: readonly ({ ok: boolean; side: "V" | "H" | null } | null)[];
  /** Bom som venter på V eller H. */
  venterPaaSide: boolean;
  harSide: boolean;
  maal: number | null;
  /** Endring i treff mot forrige gjennomføring, null uten forrige. */
  deltaForrige: number | null;
  onTreff: () => void;
  onBom: () => void;
  onSide: (s: "V" | "H") => void;
  onAngre: () => void;
  onLagre: () => void;
  onAvslutt: () => void;
  opptatt: boolean;
  lagreFeil: { tittel: string; tekst: string; kode: string } | null;
};

export function PH15Treff(p: PH15TreffProps) {
  const ferdigeSlag = p.slag.filter((s) => s !== null);
  const n = ferdigeSlag.length;
  const treff = ferdigeSlag.filter((s) => s?.ok).length;
  const ferdig = p.slag.every((s) => s !== null && (s.ok || !p.harSide || s.side !== null));
  const nesteIdx = p.slag.findIndex((s) => s === null || (!s.ok && p.harSide && s.side === null));
  const celler: (Rute | null)[] = p.slag.map((s) =>
    s ? { hoved: s.ok ? "Treff" : "Bom", under: !s.ok && s.side ? (s.side === "V" ? "VENSTRE" : "HØYRE") : null, ok: s.ok } : null);
  const nr = nesteIdx < 0 ? p.shots : nesteIdx + 1;

  const action = ferdig ? (
    <Knapp size="xl" fullWidth icon={Check} iconName="check" style={{ height: 64 }} loading={p.opptatt} loadingText="Lagrer …" onClick={p.onLagre}>
      Lagre resultat · {treff} av {p.shots}
    </Knapp>
  ) : (
    <>
      <Meta style={{ textAlign: "center" }}>
        {p.venterPaaSide ? `SLAG ${nr} · BOM REGISTRERT · VELG SIDE` : `SLAG ${nr} AV ${p.shots}`}
      </Meta>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
        <Knapp size="xl" icon={Check} iconName="check" style={{ height: 72 }} onClick={p.onTreff} disabled={p.opptatt || p.venterPaaSide}>Treff</Knapp>
        <Knapp size="xl" variant="secondary" icon={X} iconName="x" style={{ height: 72 }} onClick={p.onBom} disabled={p.opptatt || p.venterPaaSide}>Bom</Knapp>
      </div>
      {p.harSide && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          <Knapp size="lg" variant="secondary" onClick={() => p.onSide("V")} disabled={!p.venterPaaSide || p.opptatt} style={{ height: 56 }}>Venstre</Knapp>
          <Knapp size="lg" variant="secondary" onClick={() => p.onSide("H")} disabled={!p.venterPaaSide || p.opptatt} style={{ height: 56 }}>Høyre</Knapp>
        </div>
      )}
    </>
  );

  return (
    <Skall tilstand={p.tilstand} meta={p.meta} onAvslutt={p.onAvslutt} avslutter={p.opptatt}
      antallForsok={n} totalt={p.shots} lagreFeil={p.lagreFeil} action={action}>
      <Tittel tittel={p.tittel} meta={`${p.shots} slag · treff eller bom per slag${p.maal !== null ? ` · mål ${p.maal} av ${p.shots}` : ""}`} />
      <Nokkeltall rader={[
        ["Treff", n ? `${treff} av ${n}` : "—"],
        ["Slag", `${n} / ${p.shots}`],
      ]} />
      <Scorekort celler={celler} nesteIdx={nesteIdx} kolonner={5} meta="Treff eller bom" fotnote="Understreket = treff" />
      {p.tilstand === "tom" && n === 0 && (
        <TomTilstand icon={Target} title="Ingen slag registrert" text="Slå første slag og trykk Treff eller Bom." />
      )}
      {!ferdig && n > 0 && <div><AngreKnapp onClick={p.onAngre} disabled={p.opptatt} /></div>}
      {ferdig && (
        <div className="pa-card" style={{ padding: 16, gap: 8 }}>
          <span className="kicker">Resultat</span>
          <div style={{ font: "600 29px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{treff} av {p.shots} treff</div>
          <Meta>
            {p.deltaForrige === null ? "FØRSTE GJENNOMFØRING" : p.deltaForrige > 0 ? `+${p.deltaForrige} MOT FORRIGE` : p.deltaForrige < 0 ? `−${Math.abs(p.deltaForrige)} MOT FORRIGE` : "LIKT SOM FORRIGE"}
            {p.maal !== null && ` · MÅL ${p.maal} AV ${p.shots}`}
          </Meta>
        </div>
      )}
    </Skall>
  );
}
