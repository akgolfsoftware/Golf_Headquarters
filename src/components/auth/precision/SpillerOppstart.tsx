"use client";

/**
 * Oppstart for spiller (AU-04), sju steg. Ren visning: all tilstand og alle
 * server-kall eies av onboarding-wizard.tsx. Tegning: Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-04-spiller.jsx (runde 23, Anders 28.09.2026), med
 * ui_kits/_shared/fasiliteter.jsx (Dekning og FasSkjema).
 *
 * Rekkefølge: Om deg · Fasiliteter · Finn deg i resultatene · Teknikktest ·
 * Samtykker · Velg treningsplan · Klar.
 */
import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowRight, Check, Plus, Search } from "lucide-react";
import { Knapp, Meta, StatusPille, FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { kategoriFraSnittscore } from "@/lib/domain/ak-kategori";
import { tolkTall } from "@/lib/onboarding/sg-baseline";
import type { Kandidat } from "@/lib/profil-kobling/typer";
import {
  OMRADER,
  OPPSTART_STEG,
  SPORSMAL,
  TEST_KLUBBER,
  TEST_VERKTOY,
  TRENINGSPLANER,
  TURNERINGSNIVAA,
  VALGFRIE_STEG,
  alderFraDato,
  d1,
  dekkerOmrader,
  samletDekning,
  testResultat,
  type FasSvar,
  type TestKlubbId,
  type TestSlag,
  type TestSlagPerKlubb,
  type TestVerktoy,
} from "@/lib/onboarding/oppstart";
import { Avkrysning, Field, Knapperad, ProgressDots, Segment, Skillelinje, StepHeading, TextField, Velg, VeiviserFlate } from "./oppstart";

/* ---------- Tilstand som vises ---------- */

export type OppstartVerdier = {
  fodt: string; // ÅÅÅÅ-MM-DD
  hcp: string;
  snitt: string;
  nivaa: string;
  sgIAar: string;
  sgForrige: string;
  fasiliteter: FasSvar[];
  fasApen: boolean;
  koblingModus: "Golf-ID" | "Navn og fødselsår";
  golfId: string;
  testVerktoy: TestVerktoy;
  testAvstand: Record<TestKlubbId, string>;
  testSlag: TestSlagPerKlubb;
  testVist: boolean;
  ytelsesbilde: boolean;
  opptak: boolean;
  forelderEpost: string;
  plan: string | null;
};

export type Kobling = {
  /** Navn og fødselsår fra profilen, som serveren søker på. */
  navn: string;
  fodselsaar: number | null;
  /** null = ikke søkt ennå. */
  kandidater: Kandidat[] | null;
  koblet: boolean;
  feil: string | null;
};

export type OppstartProps = {
  steg: number; // 1–7
  tilstand?: "data" | "laster" | "feil";
  v: OppstartVerdier;
  endre: (patch: Partial<OppstartVerdier>) => void;
  kobling: Kobling;
  venter: boolean;
  melding: string | null;
  onNeste: () => void;
  onTilbake: () => void;
  onHopp: () => void;
  onStart: () => void;
  onSok: () => void;
  onKoble: (personId: number) => void;
  onProvIgjen: () => void;
};

export const TOMME_VERDIER: OppstartVerdier = {
  fodt: "",
  hcp: "",
  snitt: "",
  nivaa: "",
  sgIAar: "",
  sgForrige: "",
  fasiliteter: [],
  fasApen: false,
  koblingModus: "Navn og fødselsår",
  golfId: "",
  testVerktoy: "TrackMan",
  testAvstand: { sw: "70", i7: "140", dr: "220" },
  testSlag: {},
  testVist: false,
  ytelsesbilde: false,
  opptak: false,
  forelderEpost: "",
  plan: null,
};

const tekstStil = { margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" } as const;

const epostOk = (v: string) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim());

/* ---------- Fasiliteter: dekning og skjema ---------- */

function kortNavn(x: string) {
  return x.replace("Innspill ca. ", "Innspill ").replace("Putting ", "Putt ");
}

export function Dekning({ liste }: { liste: readonly FasSvar[] }) {
  const dekket = new Set(samletDekning(liste));
  const mangler = OMRADER.filter((o) => !dekket.has(o));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
        <span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 auto" }}>{dekket.size} av {OMRADER.length} treningsområder dekket</span>
        <Meta>{mangler.length ? `${mangler.length} MANGLER` : "ALLE DEKKET"}</Meta>
      </div>
      <div role="img" aria-label={`${dekket.size} av ${OMRADER.length} dekket`} style={{ display: "grid", gridTemplateColumns: `repeat(${OMRADER.length}, minmax(0, 1fr))`, gap: 2 }}>
        {OMRADER.map((o) => <span key={o} style={{ height: 8, background: dekket.has(o) ? "var(--primary)" : "var(--surface-sunken)" }} />)}
      </div>
      {mangler.length > 0 && (
        <>
          <Meta>MANGLER</Meta>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {mangler.map((o) => (
              <span key={o} style={{ display: "inline-flex", alignItems: "center", minHeight: 28, padding: "0 10px", borderRadius: 999, font: "500 12px/1 var(--font-sans)", border: "1px dashed var(--border-strong)", color: "var(--text-muted)" }}>{kortNavn(o)}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function JaNei({ verdi, onVelg, etikett }: { verdi: boolean | undefined; onVelg: (b: boolean) => void; etikett: string }) {
  return (
    <div role="group" aria-label={etikett} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
      {([["Ja", true], ["Nei", false]] as const).map(([l, b]) => (
        <button
          key={l}
          type="button"
          aria-pressed={verdi === b}
          onClick={() => onVelg(b)}
          style={{
            minHeight: 52, borderRadius: 8, cursor: "pointer", font: "600 15px/1 var(--font-sans)",
            border: "1px solid " + (verdi === b ? "var(--border-ink)" : "var(--border-hairline)"),
            background: verdi === b ? "var(--primary)" : "var(--surface-card)",
            color: verdi === b ? "var(--text-on-primary)" : "var(--text-primary)",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** Ett spørsmål om gangen, ja/nei, oppfølging ved ja. Lagrer først når alle er besvart. */
export function FasSkjema({ onSave, onCancel, startId, init, startSporsmal }: { onSave: (f: FasSvar) => void; onCancel: () => void; startId: string; init?: Partial<FasSvar>; startSporsmal?: number }) {
  const [f, setF] = useState<FasSvar>({ id: startId, name: "", ...init });
  const [i, setI] = useState(startSporsmal ?? -1);
  const [feil, setFeil] = useState<string | null>(null);
  const n = SPORSMAL.length;
  const q = i >= 0 ? SPORSMAL[i] : null;
  const sett = (k: string, v: boolean | number | undefined) => setF((x) => ({ ...x, [k]: v }));
  const svar = f as unknown as Record<string, boolean | number | undefined>;
  const besvart = q ? svar[q.id] != null : true;
  const neste = () => {
    if (i === -1) {
      if (!f.name.trim()) { setFeil("Gi fasiliteten et navn."); return; }
      setFeil(null);
    }
    if (i < n - 1) setI(i + 1);
    else onSave({ ...f, name: f.name.trim() });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Meta>{i === -1 ? "NAVN" : `SPØRSMÅL ${i + 1} AV ${n}`}</Meta>
        <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: `repeat(${n + 1}, minmax(0, 1fr))`, gap: 3 }}>
          {Array.from({ length: n + 1 }, (_, k) => <span key={k} style={{ height: 4, background: k <= i + 1 ? "var(--primary)" : "var(--surface-sunken)" }} />)}
        </div>
      </div>
      {q === null ? (
        <Field label="Hva heter fasiliteten?" krav="påkrevd" htmlFor="fas-navn" hint={feil ?? undefined}>
          <TextField id="fas-navn" value={f.name} placeholder="Fredrikstad GK" onChange={(e) => { setF((x) => ({ ...x, name: e.target.value })); setFeil(null); }} />
        </Field>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ font: "600 17px/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{q.tekst}</span>
          <JaNei verdi={svar[q.id] as boolean | undefined} onVelg={(b) => sett(q.id, b)} etikett={q.tekst} />
          {svar[q.id] === true && q.oppfolging.map((o) =>
            o.type === "yn" ? (
              <div key={o.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{o.label}</span>
                <JaNei verdi={svar[o.id] as boolean | undefined} onVelg={(b) => sett(o.id, b)} etikett={o.label} />
              </div>
            ) : (
              <Field key={o.id} label={o.label + (o.enhet ? ` (${o.enhet})` : "")} htmlFor={`fas-${o.id}`}>
                <TextField id={`fas-${o.id}`} mono inputMode="numeric" value={svar[o.id] == null ? "" : String(svar[o.id])} placeholder="—" onChange={(e) => { const t = e.target.value.replace(/\D/g, "").slice(0, 3); sett(o.id, t === "" ? undefined : Number(t)); }} />
              </Field>
            ),
          )}
        </div>
      )}
      <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 12 }}>
        <Dekning liste={[f]} />
      </div>
      <Knapperad>
        <Knapp icon={i === n - 1 ? Check : ArrowRight} disabled={!besvart} onClick={neste}>{i === n - 1 ? "Lagre fasilitet" : "Neste"}</Knapp>
        {i >= 0 && <Knapp variant="ghost" onClick={() => setI(i - 1)}>Tilbake</Knapp>}
        <Knapp variant="ghost" onClick={onCancel}>Avbryt</Knapp>
      </Knapperad>
    </div>
  );
}

/* ---------- Steg ---------- */

function OmDeg({ v, endre, alder }: { v: OppstartVerdier; endre: OppstartProps["endre"]; alder: number | null }) {
  const snitt = tolkTall(v.snitt);
  const kat = snitt != null ? kategoriFraSnittscore(snitt) : null;
  const under16 = alder != null && alder < 16;
  const felt = (k: keyof OppstartVerdier) => (e: { target: { value: string } }) => endre({ [k]: e.target.value } as Partial<OppstartVerdier>);
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <Field label="Fødselsdato" krav="påkrevd" htmlFor="au-fodt" hint={alder != null ? `${alder} år` : "ÅÅÅÅ-MM-DD"}>
          <TextField id="au-fodt" mono inputMode="numeric" autoComplete="bday" value={v.fodt} onChange={(e) => endre({ fodt: e.target.value.replace(/[^\d-]/g, "").slice(0, 10) })} placeholder="2009-04-12" />
        </Field>
        <Field label="HCP" htmlFor="au-hcp"><TextField id="au-hcp" mono inputMode="decimal" value={v.hcp} onChange={felt("hcp")} placeholder="—" /></Field>
        <Field label="Snittscore" htmlFor="au-snitt" hint="Siste 10 runder, brutto"><TextField id="au-snitt" mono inputMode="decimal" value={v.snitt} onChange={felt("snitt")} placeholder="—" /></Field>
        <Velg id="au-nivaa" label="Turneringsnivå" value={v.nivaa} onChange={(x) => endre({ nivaa: x })} options={TURNERINGSNIVAA} />
        <Field label="SG i år" krav="valgfritt" htmlFor="au-sg" hint="Hvis du har det"><TextField id="au-sg" mono inputMode="decimal" value={v.sgIAar} onChange={felt("sgIAar")} placeholder="—" /></Field>
        <Field label="SG forrige sesong" krav="valgfritt" htmlFor="au-sgf" hint="Hvis du har det"><TextField id="au-sgf" mono inputMode="decimal" value={v.sgForrige} onChange={felt("sgForrige")} placeholder="—" /></Field>
      </div>
      <Meta>{(kat ? `KATEGORI ${kat.kategori} · ${kat.niva.toUpperCase()} · ESTIMAT FRA SNITTSCORE` : "KATEGORI —") + (under16 ? " · UNDER 16: FORELDER GIR SAMTYKKE" : "")}</Meta>
    </>
  );
}

function Fasiliteter({ v, endre }: { v: OppstartVerdier; endre: OppstartProps["endre"] }) {
  const fas = v.fasiliteter;
  return (
    <>
      <p style={tekstStil}>Hvor trener du? Legg inn så mange du vil. Ett spørsmål om gangen. Du kan fullføre senere i Meg.</p>
      {fas.length > 0 && (
        <div role="list">
          {fas.map((f, i) => (
            <div role="listitem" key={f.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, minHeight: 44, alignItems: "center", borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
              <span style={{ font: "500 14px/1.3 var(--font-sans)", minWidth: 0, overflowWrap: "anywhere" }}>{f.name}</span>
              <Meta>{dekkerOmrader(f).length} OMRÅDER</Meta>
            </div>
          ))}
        </div>
      )}
      {v.fasApen ? (
        <FasSkjema startId={`f${fas.length + 1}`} onCancel={() => endre({ fasApen: false })} onSave={(f) => endre({ fasiliteter: [...fas, f], fasApen: false })} />
      ) : (
        <>
          <Dekning liste={fas} />
          <div><Knapp variant="secondary" icon={Plus} onClick={() => endre({ fasApen: true })}>{fas.length ? "Legg til en til" : "Legg til fasilitet"}</Knapp></div>
        </>
      )}
    </>
  );
}

function FinnDeg({ v, endre, kobling, venter, onSok, onKoble, under16 }: { v: OppstartVerdier; endre: OppstartProps["endre"]; kobling: Kobling; venter: boolean; onSok: () => void; onKoble: (id: number) => void; under16: boolean }) {
  if (under16) {
    return (
      <>
        <p style={tekstStil}>Vi henter turneringsresultatene dine fra GolfBox.</p>
        <InlineVarsel tone="info" tittel="Treneren din kobler resultatene.">Spillere under 16 år kobles av treneren sin. Du kan hoppe over dette steget.</InlineVarsel>
      </>
    );
  }
  const soker = v.koblingModus === "Golf-ID";
  return (
    <>
      <p style={tekstStil}>Vi henter turneringsresultatene dine fra GolfBox. Søk med golf-ID, eller med navnet og fødselsåret fra profilen din. Mellomnavn ignoreres.</p>
      <Segment label="Søk med" options={["Golf-ID", "Navn og fødselsår"]} value={v.koblingModus} onChange={(m) => endre({ koblingModus: m as OppstartVerdier["koblingModus"] })} />
      {soker ? (
        <Field label="Golf-ID" htmlFor="au-golfid" hint="Minst fire siffer, for eksempel 303-579">
          <TextField id="au-golfid" mono inputMode="numeric" value={v.golfId} onChange={(e) => endre({ golfId: e.target.value.replace(/[^\d-]/g, "").slice(0, 12) })} placeholder="303-579" />
        </Field>
      ) : (
        <Meta>{`SØKER PÅ ${kobling.navn.toUpperCase() || "—"} · FØDT ${kobling.fodselsaar ?? "—"} · FRA PROFILEN DIN`}</Meta>
      )}
      <div><Knapp variant="secondary" icon={Search} onClick={onSok} loading={venter} loadingText="Søker …" disabled={soker && !v.golfId.trim()}>Søk</Knapp></div>
      {kobling.feil && <InlineVarsel tone="warn">{kobling.feil}</InlineVarsel>}
      {kobling.kandidater && !kobling.feil && (kobling.kandidater.length ? kobling.kandidater.map((k) => (
        <div key={k.person_id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 0", borderTop: "1px solid var(--border-hairline)" }}>
          <span style={{ font: "600 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{k.name}{k.birth_year ? ` · ${k.birth_year}` : ""}</span>
          <Meta>{[k.club?.toUpperCase(), `${k.tournaments} TURNERINGER`].filter(Boolean).join(" · ")}</Meta>
          {k.evidence[0] && <Meta>{`SISTE: ${[k.evidence[0].date ?? "—", k.evidence[0].tournament, k.evidence[0].class].filter(Boolean).join(" · ").toUpperCase()}`}</Meta>}
          {kobling.koblet ? <div><StatusPille tone="ok">Koblet</StatusPille></div> : <div><Knapp icon={Check} onClick={() => onKoble(k.person_id)} disabled={venter}>Dette er meg</Knapp></div>}
        </div>
      )) : <Meta>INGEN TREFF · SJEKK STAVING ELLER BRUK GOLF-ID · DU KAN KOBLE SENERE I MEG › RESULTATER</Meta>)}
    </>
  );
}

function Teknikktest({ v, endre }: { v: OppstartVerdier; endre: OppstartProps["endre"] }) {
  const avstander = { sw: +v.testAvstand.sw || 0, i7: +v.testAvstand.i7 || 0, dr: +v.testAvstand.dr || 0 };
  const { rader, storste } = testResultat(v.testSlag, avstander);
  const settSlag = (k: TestKlubbId, i: number, j: 0 | 1, tekst: string) => {
    const liste: TestSlag[] = Array.from({ length: 5 }, (_, x) => {
      const s = v.testSlag[k]?.[x];
      return (s ? [s[0], s[1]] : [null, null]) as TestSlag;
    });
    liste[i][j] = tekst === "" ? null : Number(tekst);
    endre({ testSlag: { ...v.testSlag, [k]: liste }, testVist: false });
  };
  return (
    <>
      <InlineVarsel tone="info" tittel="Anbefalt, ikke påkrevd">Bygger på Inspill Basic. Fem slag med sandwedge, 7-jern og driver på din egen avstand. Resultatet viser største svakhet. Det setter ikke nivå.</InlineVarsel>
      <Segment label="Måleverktøy" options={TEST_VERKTOY} value={v.testVerktoy} onChange={(x) => endre({ testVerktoy: x as TestVerktoy, testVist: false })} />
      {TEST_KLUBBER.map((k) => (
        <Skillelinje key={k.id}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 112px", gap: 12, alignItems: "end" }}>
            <span style={{ font: "600 15px/1.3 var(--font-sans)" }}>{k.navn}</span>
            <Field label="Din avstand (m)" htmlFor={`t-${k.id}`}>
              <TextField id={`t-${k.id}`} mono inputMode="numeric" value={v.testAvstand[k.id]} onChange={(e) => endre({ testAvstand: { ...v.testAvstand, [k.id]: e.target.value.replace(/\D/g, "").slice(0, 3) }, testVist: false })} />
            </Field>
          </div>
          <div role="group" aria-label={`${k.navn} slag`} style={{ display: "grid", gridTemplateColumns: "28px minmax(0, 1fr) minmax(0, 1fr)", gap: 6, alignItems: "center" }}>
            <Meta>#</Meta><Meta>CARRY (M)</Meta><Meta>FRA MÅL (M)</Meta>
            {Array.from({ length: 5 }, (_, i) => {
              const s = v.testSlag[k.id]?.[i] ?? [null, null];
              return (
                <Rad key={i} nr={i + 1}>
                  <TextField mono inputMode="decimal" aria-label={`${k.navn} slag ${i + 1} carry`} value={s[0] == null ? "" : String(s[0])} placeholder="—" onChange={(e) => settSlag(k.id, i, 0, e.target.value.replace(/[^\d.]/g, ""))} />
                  <TextField mono inputMode="decimal" aria-label={`${k.navn} slag ${i + 1} fra mål`} value={s[1] == null ? "" : String(s[1])} placeholder="—" onChange={(e) => settSlag(k.id, i, 1, e.target.value.replace(/[^\d.]/g, ""))} />
                </Rad>
              );
            })}
          </div>
        </Skillelinje>
      ))}
      {v.testVerktoy === "TrackMan" ? (
        <Skillelinje>
          <Meta>FRA TRACKMAN · SPREDNING OG VARIASJON · 7-JERN</Meta>
          {["Club Path", "Face Angle", "Face to Path", "Attack Angle", "Dynamic Loft", "Club Speed"].map((p, i) => (
            <div key={p} style={{ display: "flex", justifyContent: "space-between", minHeight: 36, alignItems: "center", borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
              <span style={{ font: "400 14px/1.3 var(--font-sans)" }}>{p}</span>
              <span style={{ font: "600 13px/1 var(--font-mono)" }}>—</span>
            </div>
          ))}
          <Meta>KØLLEDATA HENTES FRA TRACKMAN NÅR DEN ER KOBLET · FØR DET VISES —</Meta>
        </Skillelinje>
      ) : (
        <Meta>{v.testVerktoy === "Banen" ? "PÅ BANEN: MÅL AVSTAND MED LASER ELLER SKRITT · CARRY ANSLÅS" : "TRACKMAN RANGE GIR CARRY OG AVSTAND FRA MÅL · IKKE KØLLEDATA"}</Meta>
      )}
      <div><Knapp variant="secondary" icon={Check} disabled={!storste} onClick={() => endre({ testVist: true })}>Vis resultat</Knapp></div>
      {v.testVist && storste && storste.snittFeil != null && storste.relativ != null && (
        <section aria-label="Resultat" style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, borderRadius: 8, background: "var(--surface-sunken)" }}>
          <Meta>STØRSTE SVAKHET</Meta>
          <span style={{ font: "600 15px/1.4 var(--font-sans)", textWrap: "pretty" }}>{storste.navn}: {d1(storste.snittFeil)} m fra mål i snitt på {storste.avstand} m ({Math.round(storste.relativ * 100)} % av avstanden).</span>
          <Meta>{rader.map((r) => `${r.navn.toUpperCase()} ${d1(r.snittFeil)} M`).join(" · ")} · SETTER IKKE NIVÅ</Meta>
        </section>
      )}
    </>
  );
}

function Rad({ nr, children }: { nr: number; children: ReactNode }) {
  return (
    <>
      <Meta>{nr}</Meta>
      {children}
    </>
  );
}

function Samtykker({ v, endre, alder }: { v: OppstartVerdier; endre: OppstartProps["endre"]; alder: number | null }) {
  if (alder != null && alder < 16) {
    return (
      <>
        <InlineVarsel tone="info" tittel={`Du er ${alder} år`}>Under 16 år gir forelderen samtykket. Vi sender en lenke.</InlineVarsel>
        <Field label="Forelderens e-post" krav="påkrevd" htmlFor="au-forelder">
          <TextField id="au-forelder" type="email" inputMode="email" autoComplete="off" value={v.forelderEpost} onChange={(e) => endre({ forelderEpost: e.target.value })} placeholder="navn@epost.no" />
        </Field>
        <Meta>YTELSESBILDE OG OPPTAK ER AV TIL FORELDEREN HAR SVART</Meta>
      </>
    );
  }
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Avkrysning checked={v.ytelsesbilde} onChange={(b) => endre({ ytelsesbilde: b })} label="Ytelsesbilde: søvn, mat og energi lagres og deles med coachen" />
        <Avkrysning checked={v.opptak} onChange={(b) => endre({ opptak: b })} label="Opptak i coachingøkt: video og lyd fra timene lagres på profilen din" />
      </div>
      <Meta>KAN ENDRES NÅR SOM HELST I MEG › INNSTILLINGER</Meta>
    </>
  );
}

function Treningsplan({ v, endre }: { v: OppstartVerdier; endre: OppstartProps["endre"] }) {
  const snitt = tolkTall(v.snitt);
  const kat = snitt != null ? kategoriFraSnittscore(snitt) : null;
  return (
    <>
      <p style={tekstStil}>Alle fem planene kan velges i alle kategorier A–K. Innholdet tilpasses kategorien din{kat ? ` (Kategori ${kat.kategori})` : ""}. Du velger selv, og kan bytte senere i Plan.</p>
      <div role="radiogroup" aria-label="Treningsplan" style={{ display: "flex", flexDirection: "column" }}>
        {TRENINGSPLANER.map((p, i) => (
          <button
            key={p.navn}
            type="button"
            role="radio"
            aria-checked={v.plan === p.navn}
            onClick={() => endre({ plan: p.navn })}
            style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) auto", gap: 12, alignItems: "center", minHeight: 56, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}
          >
            <span style={{ width: 18, height: 18, borderRadius: 999, border: "2px solid var(--text-primary)", boxShadow: v.plan === p.navn ? "inset 0 0 0 3px var(--surface-card), inset 0 0 0 9px var(--text-primary)" : "none" }} />
            <span style={{ font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{p.navn}</span>
            <Meta>{p.timer}</Meta>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- Helhet ---------- */

export function SpillerOppstart(p: OppstartProps) {
  const { steg, v, endre, tilstand = "data" } = p;
  const bredde = steg === 4 ? 600 : 560;
  if (tilstand === "laster") {
    return <VeiviserFlate max={560}><LasterTilstand text="Gjør klart kontoen …" /></VeiviserFlate>;
  }
  if (tilstand === "feil") {
    return (
      <VeiviserFlate max={560}>
        <FeilTilstand icon={AlertTriangle} title="Oppsettet kunne ikke lagres" text="Svarene er ikke lagret ennå. Prøv igjen." retry={<Knapp variant="secondary" onClick={p.onProvIgjen}>Prøv igjen</Knapp>} />
      </VeiviserFlate>
    );
  }

  const alder = alderFraDato(v.fodt);
  const under16 = alder != null && alder < 16;
  const valgfri = VALGFRIE_STEG.has(steg);
  const siste = steg === OPPSTART_STEG.length;
  let kanNeste = true;
  if (steg === 1) kanNeste = alder != null;
  if (steg === 5 && under16) kanNeste = epostOk(v.forelderEpost);
  if (steg === 6) kanNeste = v.plan != null;

  let kropp: ReactNode = null;
  if (steg === 1) kropp = <OmDeg v={v} endre={endre} alder={alder} />;
  if (steg === 2) kropp = <Fasiliteter v={v} endre={endre} />;
  if (steg === 3) kropp = <FinnDeg v={v} endre={endre} kobling={p.kobling} venter={p.venter} onSok={p.onSok} onKoble={p.onKoble} under16={under16} />;
  if (steg === 4) kropp = <Teknikktest v={v} endre={endre} />;
  if (steg === 5) kropp = <Samtykker v={v} endre={endre} alder={alder} />;
  if (steg === 6) kropp = <Treningsplan v={v} endre={endre} />;
  if (steg === 7) kropp = <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)" }}>PlayerHQ er klar{v.plan ? ` med ${v.plan}` : ""}. Start med I dag.{v.fasiliteter.length ? "" : " Fasilitetene kan du legge inn i Meg."}</p>;

  return (
    <VeiviserFlate max={bredde}>
      <ProgressDots total={OPPSTART_STEG.length} current={steg} etikett="Spiller" valgfri={valgfri} />
      <StepHeading title={OPPSTART_STEG[steg - 1]} />
      {kropp}
      {p.melding && <InlineVarsel tone="warn">{p.melding}</InlineVarsel>}
      <Knapperad>
        {steg > 1 && <Knapp variant="ghost" onClick={p.onTilbake} disabled={p.venter}>Tilbake</Knapp>}
        {siste ? (
          <Knapp icon={ArrowRight} onClick={p.onStart} loading={p.venter} loadingText="Starter …">Start</Knapp>
        ) : (
          <>
            <Knapp disabled={!kanNeste || p.venter} onClick={p.onNeste}>Fortsett</Knapp>
            {valgfri && <Knapp variant="ghost" onClick={p.onHopp} disabled={p.venter}>Hopp over</Knapp>}
          </>
        )}
      </Knapperad>
    </VeiviserFlate>
  );
}
