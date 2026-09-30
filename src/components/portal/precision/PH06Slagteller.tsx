"use client";

/**
 * PH-06 Slagteller — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-06.jsx, etag 1790523911257029, nattflate).
 *
 * Ren visning: all tellelogikk og lagring ligger i tapper-shell.tsx. Samme
 * komponent brukes av prøvefila tests/visual/precision/skjermer/PH-06.tsx.
 *
 * Bevisste avvik fra tegningen:
 *   - Ingen mål («/ 30 slag») og ingen fremdriftsstrek: økta har ikke et
 *     slagmål i basen (session_ball_logs lagrer bare antall). Tallet vises alene.
 *   - TrackMan-kortet («siste slag») er ikke med: tapperen leser ingen TrackMan-data.
 *     Forslag i PR-en, ikke bygget.
 *   - Tegningen har én kølleliste. Appen teller også nærspill og putting og tre
 *     repetisjonstyper (full fart, lav fart, tørrsving), så disse er egne valg
 *     over listen (samme segmentvelger som resten av Precision).
 *   - Tegningen velger kølle og trykker +1. Appen tellet før ett tapp per knapp;
 *     nå velges elementet, deretter +1 eller +5 (som tegnet).
 *   - «Prøv igjen nå» og lagringsfeil (nett borte, køet lokalt) er egen feilflate
 *     over tellingen; tegningens feiltilstand gjelder TrackMan.
 *   - AI-coach-knappen (LiveCoachPanel) er ikke i tegningen. Den beholdes og er
 *     løftet over handlingslinjen.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronLeft, CircleAlert, RotateCw, Undo2, Target } from "lucide-react";
import { Dialogboks } from "@/components/precision/pa-a4";
import { SegmentertValg } from "@/components/precision/pa-a2";
import { FeilTilstand, Ikon, Knapp, LasterTilstand, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

export type PH06Tilstand = "data" | "tom" | "laster" | "feil";
export type PH06Omrade = "FULL_SVING" | "NAERSPILL" | "PUTTING";
export type PH06RepType = "FULL_SPEED" | "LOW_SPEED" | "DRY";

export type PH06Props = {
  tilstand: PH06Tilstand;
  oktLabel: string;
  tilbakeHref: string;
  totalt: number;
  omrader: readonly { id: PH06Omrade; label: string }[];
  omrade: PH06Omrade;
  onOmrade: (o: PH06Omrade) => void;
  repTyper: readonly { id: PH06RepType; label: string }[];
  repType: PH06RepType;
  onRepType: (t: PH06RepType) => void;
  elementer: readonly { id: string; navn: string }[];
  valgt: string | null;
  onValgt: (id: string) => void;
  valgtAntall: number;
  fordeling: readonly { key: string; navn: string; antall: number }[];
  sist: { label: string; kl: string } | null;
  enhet: string;
  lagreFeil: { tittel: string; tekst: string; kode: string } | null;
  onProvIgjen: () => void;
  avsluttFeil: string | null;
  avslutter: boolean;
  onLeggTil: (n: number) => void;
  onAngre: () => void;
  onAvslutt: () => void;
  /** Coach-panelet (fast flytende knapp) — vises som barn, løftet av skallet. */
  children?: ReactNode;
};

const MAKS_BREDDE = 600;

export function PH06Slagteller(p: PH06Props) {
  const [avslutt, setAvslutt] = useState(false);
  const tom = p.tilstand === "tom";
  const kanTelle = p.tilstand === "data" || p.tilstand === "tom" || p.tilstand === "feil";
  const valgtNavn = p.elementer.find((e) => e.id === p.valgt)?.navn ?? null;

  const topp = (
    <>
      <Link href={p.tilbakeHref} className="pa-iconbtn" aria-label="Til live-økta" style={{ width: 56, height: 56 }}>
        <Ikon icon={ChevronLeft} size={22} name="chevron-left" />
      </Link>
      <StatusPille tone="live">Live</StatusPille>
      <Meta style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        SLAGTELLER · {p.oktLabel.toUpperCase()}
      </Meta>
      <Knapp variant="ghost" onClick={() => setAvslutt(true)} disabled={p.avslutter} style={{ height: 56 }}>Avslutt</Knapp>
    </>
  );

  return (
    <div className="pa-root" data-theme="night" data-design="precision-athletics" data-screen="PH-06"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, width: "100%", maxWidth: MAKS_BREDDE, margin: "0 auto", padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56, minWidth: 0 }}>{topp}</div>

        {p.tilstand === "laster" && <LasterTilstand text="Henter økta …" />}

        {p.avsluttFeil && <FeilTilstand icon={CircleAlert} title="Økta ble ikke avsluttet" text={p.avsluttFeil} />}
        {p.lagreFeil && (
          <FeilTilstand icon={CircleAlert} title={p.lagreFeil.tittel} text={p.lagreFeil.tekst} code={p.lagreFeil.kode}
            retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={p.onProvIgjen}>Prøv igjen nå</Knapp>} />
        )}

        {kanTelle && (
          <>
            <div className="pa-card" style={{ padding: 16, gap: 10 }}>
              <div style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>Repetisjoner denne økta</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <span style={{ font: "600 56px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
                  aria-label={tom ? "Ingen registrert" : `${p.totalt} registrert`}>{tom ? "—" : p.totalt}</span>
                <Meta style={{ overflowWrap: "anywhere" }}>{valgtNavn ? `${valgtNavn.toUpperCase()} · ${p.valgtAntall}` : "—"}</Meta>
              </div>
              {p.sist && <Meta style={{ overflowWrap: "anywhere" }}>SIST: {p.sist.label.toUpperCase()} · KL. {p.sist.kl}</Meta>}
            </div>

            {tom && <TomTilstand icon={Target} title="Ingen slag registrert" text="Velg kølle og trykk +1 for hvert slag." />}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <SegmentertValg label="Område" value={p.omrade} options={p.omrader} onChange={p.onOmrade} />
              <SegmentertValg label="Repetisjonstype" value={p.repType} options={p.repTyper} onChange={p.onRepType} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span className="pa-field__label" style={{ color: "var(--text-secondary)" }}>
                  {p.omrade === "FULL_SVING" ? "Kølle fra bagen" : p.omrade === "NAERSPILL" ? "Slagtype" : "Puttøvelse"}
                </span>
                <Meta>{p.elementer.length} {p.omrade === "FULL_SVING" ? "KØLLER" : "VALG"}</Meta>
              </div>
              <div role="group" aria-label="Velg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", gap: 6 }}>
                {p.elementer.map((e) => {
                  const på = e.id === p.valgt;
                  return (
                    <button key={e.id} type="button" onClick={() => p.onValgt(e.id)} aria-pressed={på}
                      style={{
                        minHeight: 56, borderRadius: 8, padding: "6px 8px", minWidth: 0,
                        border: "1px solid " + (på ? "var(--border-ink)" : "var(--border-hairline)"),
                        background: på ? "var(--primary)" : "var(--surface-card)",
                        color: på ? "var(--text-on-primary)" : "var(--text-primary)",
                        font: "600 14px/1.25 var(--font-sans)", cursor: "pointer", overflowWrap: "anywhere",
                      }}>{e.navn}</button>
                  );
                })}
              </div>
            </div>

            {p.fordeling.length > 0 && (
              <div className="pa-card" style={{ padding: 16, gap: 8 }}>
                <span className="kicker">Fordeling denne økta</span>
                {p.fordeling.map((f) => {
                  const maks = Math.max(1, ...p.fordeling.map((x) => x.antall));
                  return (
                    <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, borderTop: "1px solid var(--border-hairline)", paddingTop: 8 }}>
                      <span style={{ flex: "1 1 0", minWidth: 0, font: "var(--type-body-s)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{f.navn}</span>
                      <span style={{ flex: "0 0 72px", height: 6, background: "var(--surface-sunken)" }}>
                        <span style={{ display: "block", height: "100%", width: Math.round((f.antall / maks) * 100) + "%", background: "var(--text-primary)", opacity: 0.6 }} />
                      </span>
                      <span style={{ flex: "none", minWidth: "3ch", textAlign: "right", font: "600 15px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>{f.antall}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {kanTelle && (
        <div style={{ position: "sticky", bottom: 0, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", zIndex: 5 }}>
          <div style={{ maxWidth: MAKS_BREDDE, margin: "0 auto", padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: 8 }}>
              <button type="button" className="pa-btn pa-btn--secondary" aria-label="Angre ett slag" onClick={p.onAngre}
                disabled={p.avslutter || !p.sist} style={{ width: 72, height: 72, padding: 0 }}>
                <Ikon icon={Undo2} size={22} name="undo-2" />
              </button>
              <Knapp variant="secondary" onClick={() => p.onLeggTil(5)} disabled={p.avslutter || !p.valgt}
                style={{ height: 72, font: "600 21px/1 var(--font-sans)" }}>+5 {p.enhet}</Knapp>
            </div>
            <Knapp size="xl" fullWidth onClick={() => p.onLeggTil(1)} disabled={p.avslutter || !p.valgt}
              style={{ height: 96, font: "600 29px/1 var(--font-sans)" }}>+1 {p.enhet}</Knapp>
          </div>
        </div>
      )}

      <Dialogboks open={avslutt} onClose={() => setAvslutt(false)} title="Avslutte økta?"
        footer={<>
          <Knapp size="xl" variant="secondary" onClick={() => setAvslutt(false)}>Fortsett</Knapp>
          <Knapp size="xl" loading={p.avslutter} loadingText="Lagrer …" onClick={() => { setAvslutt(false); p.onAvslutt(); }}>Avslutt og lagre</Knapp>
        </>}>
        {p.totalt} repetisjoner er registrert i denne økta. De lagres når du avslutter.
      </Dialogboks>
      {p.children}
    </div>
  );
}

/** «Ingen økt pågår» — tom flate for slagtelleren (nattflate, en vei videre). */
export function PH06IngenOkt() {
  return (
    <div className="pa-root" data-theme="night" data-design="precision-athletics" data-screen="PH-06"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: MAKS_BREDDE, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <TomTilstand icon={Target} title="Ingen økt pågår"
          text="Slagtelleren hører til en pågående økt. Start dagens økt, så teller vi derfra."
          actions={<Link href="/portal" className="pa-btn pa-btn--primary pa-btn--xl pa-btn--full">Start økta</Link>} />
      </div>
    </div>
  );
}
