"use client";

/**
 * AU-04 Oppstart for spiller i nytt design (docs/design-system/utkast-flater/innlogging.html, utkast 1
 * 15.10.2026). Ren visning: tilstand og server-kall eies av onboarding-wizard.tsx.
 *
 * 1 Om deg · 2 Strokes Gained · 3 Hva har du tilgang til? · 4 Finn deg i turneringsresultatene ·
 * 5 Teknikktest · 6 Samtykker · 7 Velg treningsplan. Alt unntatt Om deg kan hoppes over.
 *
 * Avvik mot utkastet:
 * - Fødselsdato skrives dd.mm.åååå og lagres som ÅÅÅÅ-MM-DD.
 * - Teknikktesten fører snitt av fem slag per kølle (carry og fra mål), ikke hvert slag. Målavstanden er
 *   fast per kølle (TEST_KLUBBER). TrackMan-data kommer når TrackMan er koblet; før det vises ingenting.
 * - Aksefordelingen på planene er merket «Eksempel» til planene er skrevet (åpent hos Anders).
 * - Spillere under 16 kobles mot turneringsresultatene av treneren (som før).
 */
import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { FlateRamme, FlateLaster, FlateMelding } from "@/components/flater/FlateRamme";
import type { Kandidat } from "@/lib/profil-kobling/typer";
import {
  OMRADER,
  OMRADE_FAMILIER,
  OPPSTART_STEG,
  STEDER,
  TEST_KLUBBER,
  TRENINGSPLANER,
  TURNERINGSNIVAA,
  VALGFRIE_STEG,
  alderFraDato,
  anbefaltPlan,
  d1,
  testResultat,
  type TestKlubbId,
} from "@/lib/onboarding/oppstart";
import { tolkTall } from "@/lib/onboarding/sg-baseline";
import "@/styles/flater-ny-konto.css";

export type SgFelt = "sgOtt" | "sgApp" | "sgArg" | "sgPutt";

export type OppstartVerdier = {
  /** Slik spilleren skriver den: dd.mm.åååå. */
  fodtTekst: string;
  hcp: string;
  snitt: string;
  nivaa: string;
  sgIAar: Record<SgFelt, string>;
  sgIFjor: Record<SgFelt, string>;
  omrader: string[];
  steder: string[];
  golfId: string;
  test: Record<TestKlubbId, { carry: string; fraMal: string }>;
  ytelsesbilde: boolean;
  opptak: boolean;
  forelderEpost: string;
  plan: string | null;
};

export type Kobling = {
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

const TOM_SG: Record<SgFelt, string> = { sgOtt: "", sgApp: "", sgArg: "", sgPutt: "" };

export const TOMME_VERDIER: OppstartVerdier = {
  fodtTekst: "",
  hcp: "",
  snitt: "",
  nivaa: "",
  sgIAar: { ...TOM_SG },
  sgIFjor: { ...TOM_SG },
  omrader: [],
  steder: [],
  golfId: "",
  test: { sw: { carry: "", fraMal: "" }, i7: { carry: "", fraMal: "" }, dr: { carry: "", fraMal: "" } },
  ytelsesbilde: false,
  opptak: false,
  forelderEpost: "",
  plan: null,
};

/** «14.03.2011» → «2011-03-14». Ugyldig gir "". */
export function fodtIso(tekst: string): string {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(tekst.trim());
  if (!m) return /^\d{4}-\d{2}-\d{2}$/.test(tekst.trim()) ? tekst.trim() : "";
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** «2011-03-14» → «14.03.2011». */
export function fodtTekstFraIso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
}

const epostOk = (v: string) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim());

const SG_RADER: ReadonlyArray<[SgFelt, string]> = [["sgOtt", "Utslag"], ["sgApp", "Innspill"], ["sgArg", "Nærspill"], ["sgPutt", "Putting"]];

/** Fargestripe per plan. Eksempel til planene er skrevet (åpent hos Anders). */
const PLAN_INFO: Record<string, { tekst: string; akser: Array<[string, number]> }> = {
  "Weekend Warrior": { tekst: "Få timer i uka, mest i helgene.", akser: [["a-tek", 20], ["a-slag", 40], ["a-spill", 40]] },
  Klubbspilleren: { tekst: "Jevn trening og klubbspill gjennom sesongen.", akser: [["a-fys", 15], ["a-tek", 25], ["a-slag", 30], ["a-spill", 30]] },
  "Junior-aspirant": { tekst: "Bred grunnmur for juniorer som vil videre.", akser: [["a-fys", 25], ["a-tek", 30], ["a-slag", 25], ["a-spill", 15], ["a-turn", 5]] },
  Konkurransespilleren: { tekst: "For deg som spiller turneringer.", akser: [["a-fys", 20], ["a-tek", 20], ["a-slag", 25], ["a-spill", 20], ["a-turn", 15]] },
  "Practice like the pros": { tekst: "Stor treningsmengde med tydelig struktur.", akser: [["a-fys", 20], ["a-tek", 25], ["a-slag", 25], ["a-spill", 15], ["a-turn", 15]] },
};

function Steghode({ steg, onHopp, venter }: { steg: number; onHopp: () => void; venter: boolean }) {
  const valgfri = VALGFRIE_STEG.has(steg);
  return (
    <div className="steghode">
      <div className="rad">
        <span className="nr">Steg {steg} av {OPPSTART_STEG.length}{steg === 5 ? " · anbefalt" : ""}</span>
        {valgfri && <button type="button" className="hopp" onClick={onHopp} disabled={venter}>{steg === 3 ? "Fullfør senere" : "Hopp over"}</button>}
      </div>
      <div className="steg-linje" aria-hidden="true">
        {OPPSTART_STEG.map((_, i) => <i key={i} className={i < steg ? "ja" : undefined} />)}
      </div>
    </div>
  );
}

function Feltlinje({ id, label, hjelp, children }: { id: string; label: string; hjelp?: ReactNode; children: ReactNode }) {
  return (
    <div className="felt">
      <label htmlFor={id}>{label}</label>
      {children}
      {hjelp && <span className="hjelp">{hjelp}</span>}
    </div>
  );
}

/* ---------- Stegene ---------- */

function OmDeg({ v, endre, alder }: { v: OppstartVerdier; endre: OppstartProps["endre"]; alder: number | null }) {
  const nivaaer = TURNERINGSNIVAA.filter((n) => n.value !== "");
  return (
    <form className="seksjon" onSubmit={(e) => e.preventDefault()}>
      <Feltlinje id="fd" label="Fødselsdato" hjelp={alder != null ? `Du er ${alder} år. Fødselsdato kan bare endres av coach.` : "Skriv dd.mm.åååå."}>
        <input id="fd" inputMode="numeric" autoComplete="bday" placeholder="dd.mm.åååå" value={v.fodtTekst} onChange={(e) => endre({ fodtTekst: e.target.value.replace(/[^\d.]/g, "").slice(0, 10) })} />
      </Feltlinje>
      <div className="to-felt">
        <Feltlinje id="hcp" label="Handicap">
          <input id="hcp" inputMode="decimal" style={{ fontFamily: "var(--mono)" }} value={v.hcp} onChange={(e) => endre({ hcp: e.target.value })} />
        </Feltlinje>
        <Feltlinje id="snitt" label="Snittscore" hjelp="Brutto, 18 hull">
          <input id="snitt" inputMode="numeric" style={{ fontFamily: "var(--mono)" }} value={v.snitt} onChange={(e) => endre({ snitt: e.target.value })} />
        </Feltlinje>
      </div>
      <div className="felt">
        <span className="etikett" id="niva-tekst">Høyeste turneringsnivå</span>
        <div className="chips" role="group" aria-labelledby="niva-tekst">
          {nivaaer.map((n) => (
            <button key={n.value} type="button" aria-pressed={v.nivaa === n.value} onClick={() => endre({ nivaa: n.value })}>
              {n.value === "REGION" ? "Region" : n.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

function StrokesGained({ v, endre }: { v: OppstartVerdier; endre: OppstartProps["endre"] }) {
  const sett = (periode: "sgIAar" | "sgIFjor", felt: SgFelt, verdi: string) =>
    endre({ [periode]: { ...v[periode], [felt]: verdi.replace(/[^\d,.+\-−]/g, "").slice(0, 6) } } as Partial<OppstartVerdier>);
  return (
    <div className="kort">
      <div className="sg-tabell">
        <div className="sg-r hode"><span>Område</span><span style={{ textAlign: "right" }}>I år</span><span style={{ textAlign: "right" }}>I fjor</span></div>
        {SG_RADER.map(([felt, navn]) => (
          <div className="sg-r" key={felt}>
            <span>{navn}</span>
            <input aria-label={`${navn} i år`} inputMode="decimal" placeholder="—" value={v.sgIAar[felt]} onChange={(e) => sett("sgIAar", felt, e.target.value)} />
            <input aria-label={`${navn} i fjor`} inputMode="decimal" placeholder="—" value={v.sgIFjor[felt]} onChange={(e) => sett("sgIFjor", felt, e.target.value)} />
          </div>
        ))}
      </div>
      <p className="kilde">Egne tall merkes «Egenført» til runder i appen tar over.</p>
    </div>
  );
}

function Fasiliteter({ v, endre }: { v: OppstartVerdier; endre: OppstartProps["endre"] }) {
  const valgt = new Set(v.omrader);
  const veksle = (o: string) => endre({ omrader: valgt.has(o) ? v.omrader.filter((x) => x !== o) : [...v.omrader, o] });
  const veksleSted = (s: string) => endre({ steder: v.steder.includes(s) ? v.steder.filter((x) => x !== s) : [...v.steder, s] });
  return (
    <>
      <div className="kort">
        <div className="hoved"><strong>{valgt.size}<small>av {OMRADER.length}</small></strong><span className="trend">treningsområder dekket</span></div>
        <div>
          {OMRADE_FAMILIER.map((f) => (
            <div className="fam" key={f.navn}>
              <div className="fam-topp"><b>{f.navn}</b><span>{f.omrader.filter((o) => valgt.has(o.id)).length}/{f.omrader.length}</span></div>
              <div className="omr" role="group" aria-label={f.navn}>
                {f.omrader.map((o) => (
                  <button key={o.id} type="button" aria-pressed={valgt.has(o.id)} onClick={() => veksle(o.id)}>{o.kort}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="seksjon">
        <span className="undertittel" id="steder-tekst">Steder du bruker</span>
        <div className="chips" role="group" aria-labelledby="steder-tekst">
          {STEDER.map((s) => (
            <button key={s} type="button" aria-pressed={v.steder.includes(s)} onClick={() => veksleSted(s)}>{s}</button>
          ))}
        </div>
      </section>
    </>
  );
}

function FinnDeg({ v, endre, kobling, venter, onSok, onKoble, under16 }: { v: OppstartVerdier; endre: OppstartProps["endre"]; kobling: Kobling; venter: boolean; onSok: () => void; onKoble: (id: number) => void; under16: boolean }) {
  if (under16) {
    return <div className="kort dempet"><b className="undertittel">Treneren din kobler resultatene</b><p className="forklar">Spillere under 16 år kobles av treneren sin. Du kan hoppe over dette steget.</p></div>;
  }
  return (
    <>
      <form className="seksjon" onSubmit={(e) => { e.preventDefault(); onSok(); }}>
        <Feltlinje id="gid" label="Golf-ID" hjelp="Tomt felt søker på navnet og fødselsåret fra profilen din. Mellomnavn ignoreres.">
          <input id="gid" inputMode="numeric" placeholder="F.eks. 123-4567" style={{ fontFamily: "var(--mono)" }} value={v.golfId} onChange={(e) => endre({ golfId: e.target.value.replace(/[^\d-]/g, "").slice(0, 12) })} />
        </Feltlinje>
        <p className="kilde">Søker på {kobling.navn || "—"} · født {kobling.fodselsaar ?? "—"}</p>
        <button type="submit" className="knapp sek" disabled={venter}>{venter ? "Søker …" : "Søk"}</button>
      </form>
      {kobling.feil && <p className="feilmelding" role="alert"><AlertCircle className="ikon" aria-hidden="true" />{kobling.feil}</p>}
      {kobling.kandidater && !kobling.feil && (
        <section className="seksjon">
          <div className="sek-topp"><h2>{kobling.kandidater.length} treff</h2></div>
          {kobling.kandidater.length === 0 && <p className="forklar">Ingen treff. Sjekk stavingen, prøv Golf-ID, eller hopp over. Du kan koble senere i Meg › Resultater.</p>}
          {kobling.kandidater.map((k) => (
            <div key={k.person_id} className={kobling.koblet ? "treff valgt" : "treff"}>
              <span className="avatar lys">{k.name.split(/\s+/).map((d) => d[0]).slice(0, 2).join("")}</span>
              <span><b>{k.name}</b><span className="kilde">{[k.birth_year, k.club, `${k.tournaments} turneringer`].filter(Boolean).join(" · ")}</span></span>
              {kobling.koblet ? <span className="pille ok"><i />Det er meg</span> : <button type="button" className="knapp sek" style={{ minHeight: 44 }} onClick={() => onKoble(k.person_id)} disabled={venter}>Det er meg</button>}
            </div>
          ))}
        </section>
      )}
    </>
  );
}

function Teknikktest({ v, endre }: { v: OppstartVerdier; endre: OppstartProps["endre"] }) {
  const slag = Object.fromEntries(TEST_KLUBBER.map((k) => [k.id, [[tolkTall(v.test[k.id].carry) ?? null, tolkTall(v.test[k.id].fraMal) ?? null]]]));
  const avst = Object.fromEntries(TEST_KLUBBER.map((k) => [k.id, k.avstand])) as Record<TestKlubbId, number>;
  const { storste } = testResultat(slag, avst);
  const sett = (k: TestKlubbId, felt: "carry" | "fraMal", verdi: string) => endre({ test: { ...v.test, [k]: { ...v.test[k], [felt]: verdi.replace(/[^\d,.]/g, "").slice(0, 5) } } });
  return (
    <>
      <div className="kort">
        <div className="test-rad hode"><span>Kølle og mål</span><span style={{ textAlign: "right" }}>Carry</span><span style={{ textAlign: "right" }}>Fra mål</span></div>
        {TEST_KLUBBER.map((k, i) => (
          <div className="test-rad" key={k.id} style={i === TEST_KLUBBER.length - 1 ? { borderBottom: 0 } : undefined}>
            <span><b style={{ fontWeight: 600 }}>{k.navn}</b><br /><span className="kilde">mål {k.avstand} m</span></span>
            <input aria-label={`Carry ${k.navn}`} inputMode="decimal" placeholder="—" value={v.test[k.id].carry} onChange={(e) => sett(k.id, "carry", e.target.value)} />
            <input aria-label={`Fra mål ${k.navn}`} inputMode="decimal" placeholder="—" value={v.test[k.id].fraMal} onChange={(e) => sett(k.id, "fraMal", e.target.value)} />
          </div>
        ))}
        <p className="kilde">Snitt av fem slag, i meter. Egenført.</p>
      </div>
      {storste && storste.snittFeil != null && storste.relativ != null && (
        <div className="svakhet inn">
          <span className="akse-merke"><i />SLAG</span>
          <b>Største svakhet: {storste.navn}, avstand fra mål</b>
          <p>{d1(storste.snittFeil)} m fra mål er {Math.round(storste.relativ * 100)} % av slaglengden. Testen setter ikke nivå.</p>
        </div>
      )}
    </>
  );
}

function Samtykker({ v, endre, alder }: { v: OppstartVerdier; endre: OppstartProps["endre"]; alder: number | null }) {
  const under16 = alder != null && alder < 16;
  return (
    <>
      <div className="kort">
        <div style={{ display: "grid", gap: 12 }}>
          <label className="avkrysning" style={under16 ? { opacity: 0.7 } : undefined}>
            <input type="checkbox" checked={!under16 && v.ytelsesbilde} disabled={under16} onChange={(e) => endre({ ytelsesbilde: e.target.checked })} />
            <span><b>Ytelsesbilde</b>Søvn, mat og energi brukes til å tilpasse belastningen.{under16 ? " Forelderen bestemmer." : ""}</span>
          </label>
          <label className="avkrysning" style={under16 ? { opacity: 0.7 } : undefined}>
            <input type="checkbox" checked={!under16 && v.opptak} disabled={under16} onChange={(e) => endre({ opptak: e.target.checked })} />
            <span><b>Opptak i coachingtimer</b>Lyd fra timen blir sammendrag til deg.{under16 ? " Forelderen bestemmer. Sperret til forelderen har godkjent." : " Du kan trekke samtykket i Meg."}</span>
          </label>
        </div>
      </div>
      {under16 && (
        <form className="seksjon" onSubmit={(e) => e.preventDefault()}>
          <Feltlinje id="fe" label="Forelderens e-post" hjelp="Forelderen får en lenke og godkjenner kontoen innen sju dager.">
            <input id="fe" type="email" autoComplete="off" value={v.forelderEpost} onChange={(e) => endre({ forelderEpost: e.target.value })} />
          </Feltlinje>
        </form>
      )}
    </>
  );
}

function Treningsplan({ v, endre }: { v: OppstartVerdier; endre: OppstartProps["endre"] }) {
  const anbefalt = anbefaltPlan(v.nivaa);
  const rekke = [anbefalt, ...TRENINGSPLANER.map((p) => p.navn).filter((n) => n !== anbefalt)];
  return (
    <>
      <div className="planer valg-grid" role="group" aria-label="Treningsplan" style={{ display: "grid", gap: "var(--r2)" }}>
        {rekke.map((navn) => {
          const info = PLAN_INFO[navn];
          return (
            <button key={navn} type="button" className="plan-kort" aria-pressed={v.plan === navn} onClick={() => endre({ plan: navn })}>
              {navn === anbefalt && <span className="anbefalt">Anbefalt for deg</span>}
              <b className="n">{navn}</b>
              <span className="forklar">{info.tekst}{navn === anbefalt ? (anbefalt === "Konkurransespilleren" ? " Fordi du har spilt turneringer på regionnivå eller høyere." : " Fordi du ikke har oppgitt turneringer på regionnivå.") : ""}</span>
              <span className="akser" aria-hidden="true">{info.akser.map(([k, b]) => <i key={k} className={k} style={{ width: `${b}%` }} />)}</span>
            </button>
          );
        })}
      </div>
      <p className="kilde">Fargestripen viser fordeling på FYS · TEK · SLAG · SPILL · TURN. <span className="eksempel">Eksempel</span> til planene er skrevet.</p>
    </>
  );
}

/* ---------- Helhet ---------- */

const INGRESS: Record<number, (alder: number | null) => ReactNode> = {
  1: () => "Dette bestemmer hvor planen starter. Du kan endre alt utenom fødselsdato senere.",
  2: () => "Har du tallene fra en app eller fra coach? Fyll inn det du har. Felt du lar stå tomme, vises som «—».",
  3: () => "Trykk på det du kan trene på i vanlig uke. Planen bruker bare øvelser du kan gjennomføre.",
  4: () => "Da kommer turneringsrundene dine inn i Stats av seg selv.",
  5: () => "Inspill Basic: fem slag med hver kølle mot et mål. Før snitt av carry og avstand fra mål i meter.",
  6: (alder) => (alder != null && alder < 16 ? `Du er ${alder} år. Forelderen din gir disse samtykkene. Du kan bruke hele appen i sju dager mens du venter.` : "Du bestemmer selv, og kan endre det senere i Meg."),
  7: () => "Alle fem kan velges. Innholdet tilpasses kategorien din. Du kan bygge egne økter i Workbench når som helst.",
};

export function SpillerOppstart(p: OppstartProps) {
  const { steg, v, endre, tilstand = "data" } = p;
  const alder = alderFraDato(fodtIso(v.fodtTekst));
  const under16 = alder != null && alder < 16;

  let innhold: ReactNode;
  if (tilstand === "laster") innhold = <FlateLaster tekst="Lager planen …" />;
  else if (tilstand === "feil") innhold = <FlateMelding tittel="Oppsettet kunne ikke lagres" tekst="Ingenting er lagret. Sjekk nettet og prøv igjen." handling={<button type="button" className="knapp pri" onClick={p.onProvIgjen}>Prøv igjen</button>} />;
  else {
    let kanNeste = true;
    if (steg === 1) kanNeste = alder != null;
    if (steg === 6 && under16) kanNeste = epostOk(v.forelderEpost);
    if (steg === 7) kanNeste = v.plan != null;
    innhold = (
      <>
        {steg === 1 && <OmDeg v={v} endre={endre} alder={alder} />}
        {steg === 2 && <StrokesGained v={v} endre={endre} />}
        {steg === 3 && <Fasiliteter v={v} endre={endre} />}
        {steg === 4 && <FinnDeg v={v} endre={endre} kobling={p.kobling} venter={p.venter} onSok={p.onSok} onKoble={p.onKoble} under16={under16} />}
        {steg === 5 && <Teknikktest v={v} endre={endre} />}
        {steg === 6 && <Samtykker v={v} endre={endre} alder={alder} />}
        {steg === 7 && <Treningsplan v={v} endre={endre} />}
        {p.melding && <p className="feilmelding" role="alert"><AlertCircle className="ikon" aria-hidden="true" />{p.melding}</p>}
        <div className="bunnknapper">
          {steg > 1 ? <button type="button" className="knapp sek" onClick={p.onTilbake} disabled={p.venter}>Tilbake</button> : <span />}
          {steg === 7 ? (
            <button type="button" className="knapp pri stor" onClick={p.onStart} disabled={!kanNeste || p.venter}>{v.plan ? `Start med ${v.plan}` : "Velg en plan"}</button>
          ) : (
            <button type="button" className="knapp pri stor" onClick={p.onNeste} disabled={!kanNeste || p.venter}>
              {p.venter ? "Lagrer …" : steg === 6 && under16 ? "Send til forelder og fortsett" : "Neste"}
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <FlateRamme skall="konto" bred>
      <Steghode steg={steg} onHopp={p.onHopp} venter={p.venter} />
      <div className="topp">
        <h1 className="tittel">{OPPSTART_STEG[steg - 1]}</h1>
        <p className="ingress">{INGRESS[steg]?.(alder)}</p>
      </div>
      {innhold}
    </FlateRamme>
  );
}
