import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
.akhq-fv{display:flex;flex-direction:column;gap:var(--s3);font-family:var(--ui)}
.akhq-fv-steg{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--s4)}
.akhq-fv-steg[data-hvilende=true]{opacity:.5}
.akhq-fv-steg--felt{border-style:dashed;background:var(--bg)}
.akhq-fv-hd{display:flex;align-items:center;gap:var(--s2);margin-bottom:var(--s1)}
.akhq-fv-num{--h:22px;font-family:var(--mono);font-size:11px;color:var(--on-cta);background:var(--cta);border-radius:var(--r-pill);width:var(--h);height:var(--h);display:grid;place-items:center;flex:none}
.akhq-fv-num--felt{background:var(--soft);color:var(--muted)}
.akhq-fv-tit{font-weight:600;font-size:15px;flex:1;color:var(--fg)}
.akhq-fv-pick{font-family:var(--mono);font-size:12px;color:var(--accent-fg);font-weight:500;text-align:right}
.akhq-fv-desc{font-family:var(--body);font-size:13px;color:var(--muted);line-height:1.55;margin:0 0 var(--s3)}
.akhq-fv-grp{margin-bottom:var(--s3)}
.akhq-fv-grp:last-child{margin-bottom:0}
.akhq-fv-gl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600;margin-bottom:var(--s2)}
.akhq-fv-chips{display:flex;flex-wrap:wrap;gap:var(--s2)}
.akhq-fv-chip{--h:36px;--floor:0px;min-height:max(var(--h),var(--floor));display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:var(--r-pill);padding:0 var(--s3);font-family:inherit;font-size:13px;font-weight:500;color:var(--fg);background:var(--surface);cursor:pointer;transition:background var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.akhq-fv-chip:hover:not([aria-pressed=true]),.akhq-fv-chip[data-state=hover]{background:var(--soft)}
.akhq-fv-chip[aria-pressed=true]{background:var(--cta);color:var(--on-cta);border-color:var(--cta)}
.akhq-fv-chip:focus-visible,.akhq-fv-chip[data-state=focus]{outline:2px solid var(--focus);outline-offset:2px}
.akhq-fv-chip--mono{font-family:var(--mono);font-size:12px;min-width:64px;justify-content:center}
.akhq-fv-sw{width:8px;height:8px;border-radius:50%;background:var(--akhq-fv-pyr,var(--mid));flex:none}
.akhq-fv-note{font-family:var(--body);font-size:12.5px;color:var(--muted);line-height:1.5;margin-top:var(--s3);padding-left:var(--s3);border-left:2px solid var(--hairline)}
.akhq-fv-note b{font-family:var(--ui);font-weight:600;color:var(--fg)}
.akhq-fv-note--apen{border-left-color:var(--accent)}
.akhq-fv-bar{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--s4)}
.akhq-fv-bl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600;margin-bottom:6px}
.akhq-fv-formel{font-family:var(--mono);font-size:13px;line-height:1.5;word-break:break-word;font-weight:500;color:var(--fg)}
.akhq-fv-tom{color:var(--mid)}
.akhq-fv-sep{color:var(--mid)}
.akhq-fv-human{font-family:var(--body);font-size:12.5px;color:var(--muted);margin-top:6px;line-height:1.5}
}
@layer akhq-container{
/* Gulvet gjelder treffmålet — chipen. Samme regel som SegmentControl. */
@media(pointer:coarse){.akhq-fv-chip{--floor:44px}}
[data-coarse-test] .akhq-fv-chip{--floor:44px}
}
`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-fv")) { const s = document.createElement("style"); s.id = "akhq-css-fv"; s.textContent = css; document.head.appendChild(s); }

/* ── Strukturen — AK-formel v3, jf. docs/ordre-ak-formel-v3-2026-08-03.md §2 ──
   Områdelista avhenger av pyramiden. Pyramiden er en gaffel, ikke en etikett. */

const DEL_PUTT = [
  { k: "GREENLESNING", l: "Greenlesning", d: "Lese fall og hastighet" },
  { k: "SIKTE", l: "Sikte", d: "Peke putteren der du vil" },
  { k: "BALLSTART", l: "Ballstart", d: "Få ballen ut på valgt linje" },
  { k: "LENGDEKONTROLL", l: "Lengdekontroll", d: "Riktig fart på ballen" },
];
const DEL_SLAG = [
  { k: "OPPSTILLING", l: "Oppstilling", d: "Kropp og føtter i forhold til målet" },
  { k: "GREP", l: "Grep", d: "Hendene på køllen" },
  { k: "SIKTE", l: "Sikte", d: "Køllebladet mot målet" },
  { k: "BALLSTART", l: "Ballstart", d: "Startretningen på ballen" },
  { k: "SKRU", l: "Skru", d: "Kurven — draw eller fade" },
  { k: "LENGDEKONTROLL", l: "Lengdekontroll", d: "Treffe riktig distanse" },
];
const DEL_SPILL = [
  { k: "FORBEREDELSER", l: "Forberedelser", d: "Banekunnskap, plan, rutine før slaget" },
  { k: "STRATEGI_TAKTIKK", l: "Strategi/taktikk", d: "Køllevalg, mål, risiko og buffer" },
  { k: "MENTAL", l: "Mental", d: "Fokus, aksept, spenningsregulering" },
];
/* FYS: kun STYRKE er definert (Anders 03.08). De tre øvrige står åpne — vis det, ikke dikt. */
const DEL_FYS = { STYRKE: [
  { k: "RFD", l: "RFD", d: "Kraftutvikling per tid — eksplosivitet" },
  { k: "MAKSSTYRKE", l: "Maksstyrke", d: "Høyeste kraft uansett tid" },
  { k: "UTHOLDENHET", l: "Utholdenhet", d: "Kraft holdt over tid" },
] };

/* Tee/innspill/nærspill/putt — 17 områder i fire SG-grupper. Deles av TEK og SLAG. */
const OMR_GOLF = [
  { grp: "Tee", items: [{ k: "TEE_TOTAL", l: "Tee Total" }] },
  { grp: "Innspill", items: [
    { k: "INNSPILL_200", l: "Innspill 200+" }, { k: "INNSPILL_150", l: "Innspill 150–200" },
    { k: "INNSPILL_100", l: "Innspill 100–150" }, { k: "INNSPILL_50", l: "Innspill 50–100" },
    { k: "INNSPILL_0_50", l: "Innspill 0–50" },
  ] },
  { grp: "Nærspill", items: [
    { k: "PITCH", l: "Pitch" }, { k: "CHIP", l: "Chip" }, { k: "LOB", l: "Lob" }, { k: "BUNKER", l: "Bunker" },
  ] },
  /* Enhet fot (Anders 03.08). Koden lagrer meter — vis alltid enhet, aldri bart tall. */
  { grp: "Putt (fot)", items: [
    { k: "PUTT_0_3", l: "Putt 0–3" }, { k: "PUTT_3_5", l: "Putt 3–5" }, { k: "PUTT_5_10", l: "Putt 5–10" },
    { k: "PUTT_10_15", l: "Putt 10–15" }, { k: "PUTT_15_25", l: "Putt 15–25" },
    { k: "PUTT_25_40", l: "Putt 25–40" }, { k: "PUTT_40", l: "Putt 40+" },
  ] },
];

export const AK_STRUKTUR = {
  FYS: {
    l: "Fysisk", d: "Styrke, kondisjon, spenst og bevegelighet.",
    omrader: [{ grp: null, items: [
      { k: "STYRKE", l: "Styrke" }, { k: "KONDISJON", l: "Kondisjon" },
      { k: "SPENST", l: "Spenst" }, { k: "BEVEGELIGHET", l: "Bevegelighet" },
    ] }],
    del: "fys", slots: ["pyr", "omr", "del", "bel"],
    delApen: "Delferdighet er definert for Styrke. Kondisjon, spenst og bevegelighet står åpne — se §4.1b.",
  },
  TEK: { l: "Teknikk", d: "Sving-mekanikk, P-posisjoner, MORAD-arbeid.", omrader: OMR_GOLF, del: "golf", slots: ["pyr", "omr", "del", "mot", "bel", "press"] },
  SLAG: { l: "Golfslag", d: "Slag med ball mot mål.", omrader: OMR_GOLF, del: "golf", slots: ["pyr", "omr", "del", "mot", "bel", "press"] },
  SPILL: {
    l: "Spill", d: "Banespill, test, scoring.",
    /* BANE beholdt (Anders 03.08): form, ikke sted. Etiketter alltid — «Bane» finnes òg under Belastning. */
    omrader: [{ grp: null, items: [
      { k: "BANE", l: "Bane" }, { k: "TEST", l: "Test" }, { k: "SCORING", l: "Scoring" }, { k: "INNSPILL", l: "Innspill" },
    ] }],
    del: "spill", slots: ["pyr", "omr", "del", "mot", "bel", "press"],
  },
  TURN: {
    l: "Turnering", d: "Turneringstypene — hva turneringen skal brukes til.",
    omrader: [{ grp: null, items: [
      { k: "TRENING", l: "Trening", d: "Turnering som treningsarena" },
      { k: "UTVIKLING", l: "Utvikling", d: "Turnering for å bygge nivå" },
      { k: "PRESTASJON", l: "Prestasjon", d: "Turnering det skal leveres i" },
    ] }],
    del: "spill", slots: ["pyr", "omr", "del", "mot", "bel", "press"],
  },
};

export const AK_MOTORIKK = [
  { k: "UTEN_BALL", l: "Uten ball", d: "Bevegelse uten å slå" },
  { k: "LAV_HASTIGHET", l: "Lav hastighet", d: "Sakte, kontrollert" },
  { k: "AUTO", l: "Auto", d: "Full fart, automatisert" },
];
export const AK_BELASTNING = [
  { k: "INNENDORS", l: "Innendørs", d: "Studio, simulator, treningsrom" },
  { k: "TRENINGSOMRADE", l: "Treningsområde", d: "Range, nærspillsareal, puttegreen" },
  { k: "BANE", l: "Bane", d: "Ute på hullene" },
  { k: "KONKURRANSE", l: "Konkurranse", d: "Reell turnering" },
];
export const AK_PRESS = [
  { k: "ALENE", l: "Alene", d: "Ingen ser på" },
  { k: "OBSERVERT", l: "Observert", d: "Noen følger med, resultat noteres" },
  { k: "KONKURRANSE", l: "Konkurranse", d: "Match, poeng eller konsekvens" },
  { k: "TURNERING", l: "Turnering", d: "Ekte turneringssituasjon" },
];
export const AK_P_POSISJONER = ["P1.0", "P2.0", "P3.0", "P4.0", "P5.0", "P6.0", "P7.0", "P8.0", "P9.0", "P10.0"];
const P_MODUS = [
  { k: "ENKEL", l: "Én posisjon" }, { k: "FLERE", l: "Flere" }, { k: "INTERVALL", l: "Mellom" },
];
/* P-systemet gjelder kun TEK på tee og innspill (Anders 03.08). Ikke nærspill, ikke putt. */
const P_OMRADER = ["TEE_TOTAL", "INNSPILL_200", "INNSPILL_150", "INNSPILL_100", "INNSPILL_50", "INNSPILL_0_50"];
const MOT_KORT = { UTEN_BALL: "UTEN_BALL", LAV_HASTIGHET: "LAV_HAST", AUTO: "AUTO" };
const TOM = { pyr: "PYRAMIDE", omr: "OMRÅDE", p: "P-POSISJON", del: "DELFERDIGHET", mot: "MOTORIKK", bel: "BELASTNING", press: "PRESS" };
/* Nullstillingskartet — bytter du et steg, faller alt under bort. Ikke bare skjules. */
const NULLSTILL = { pyr: ["omr", "del", "mot", "bel", "press"], omr: ["del", "mot", "bel", "press"], del: ["mot", "bel", "press"], mot: ["bel", "press"], bel: ["press"] };

const finn = (liste, k) => (liste || []).find((x) => x.k === k) || null;
const pIdx = (k) => AK_P_POSISJONER.indexOf(k);

export function omradeObjekt(verdi) {
  const p = AK_STRUKTUR[verdi.pyr];
  if (!p) return null;
  for (const g of p.omrader) { const f = g.items.find((i) => i.k === verdi.omr); if (f) return { ...f, grp: g.grp }; }
  return null;
}
export function delferdighetsListe(verdi) {
  const p = AK_STRUKTUR[verdi.pyr];
  if (!p || !p.del) return null;
  if (p.del === "spill") return DEL_SPILL;
  if (p.del === "fys") return DEL_FYS[verdi.omr] || null;
  const o = omradeObjekt(verdi);
  if (!o) return null;
  return o.grp && o.grp.startsWith("Putt") ? DEL_PUTT : DEL_SLAG;
}
export function harPPosisjon(verdi) { return verdi.pyr === "TEK" && P_OMRADER.includes(verdi.omr); }
export function pEkspandert(verdi) {
  const valg = verdi.pValg || [];
  if (!valg.length) return [];
  if (verdi.pModus === "INTERVALL" && valg.length === 2) {
    const a = pIdx(valg[0]), b = pIdx(valg[1]);
    return AK_P_POSISJONER.slice(Math.min(a, b), Math.max(a, b) + 1);
  }
  return [...valg].sort((x, y) => pIdx(x) - pIdx(y));
}
function pStreng(verdi) {
  const e = pEkspandert(verdi);
  if (!e.length) return null;
  if (verdi.pModus === "INTERVALL" && e.length > 1) return e[0] + "-" + e[e.length - 1];
  return e.join("+");
}
export function formelSlots(verdi) {
  const p = AK_STRUKTUR[verdi.pyr];
  if (!p) return ["pyr"];
  const s = [...p.slots];
  if (harPPosisjon(verdi)) s.splice(s.indexOf("omr") + 1, 0, "p");
  return s;
}
export function formelStreng(verdi) {
  const alle = { pyr: verdi.pyr, omr: verdi.omr, p: pStreng(verdi), del: verdi.del, mot: verdi.mot ? MOT_KORT[verdi.mot] : null, bel: verdi.bel, press: verdi.press };
  return formelSlots(verdi).map((s) => alle[s] || TOM[s]).join("_");
}

function Chip({ l, valgt, onClick, mono, pyr }) {
  return (
    <button type="button" className={"akhq-fv-chip" + (mono ? " akhq-fv-chip--mono" : "")} aria-pressed={valgt} onClick={onClick}
      style={pyr ? { "--akhq-fv-pyr": pyr } : undefined}>
      {pyr && <span className="akhq-fv-sw" aria-hidden="true" />}<span>{l}</span>
    </button>
  );
}
function Steg({ nr, tittel, valgt, desc, hvilende, felt, children, note, apen }) {
  return (
    <section className={"akhq-fv-steg" + (felt ? " akhq-fv-steg--felt" : "")} data-hvilende={hvilende ? "true" : undefined}>
      <div className="akhq-fv-hd">
        <span className={"akhq-fv-num" + (felt ? " akhq-fv-num--felt" : "")}>{nr}</span>
        <span className="akhq-fv-tit">{tittel}</span>
        <span className="akhq-fv-pick">{valgt || ""}</span>
      </div>
      {desc && <p className="akhq-fv-desc">{desc}</p>}
      {children}
      {note && <div className="akhq-fv-note"><b>{note.tit}:</b> {note.tekst}</div>}
      {apen && <div className="akhq-fv-note akhq-fv-note--apen"><b>Åpent:</b> {apen}</div>}
    </section>
  );
}

const PYR_FARGE = { FYS: "var(--accent-heather)", TEK: "var(--info-raw)", SLAG: "var(--up-raw)", SPILL: "var(--accent-cactus)", TURN: "var(--accent-fig)" };
const OMR_DESC = { FYS: "Fire fysiske hovedområder.", TEK: "Hvor på banen? 17 områder i fire grupper. Gruppa er Strokes Gained-aksen.", SLAG: "Hvor på banen? 17 områder i fire grupper. Gruppa er Strokes Gained-aksen.", SPILL: "Hva slags spilltrening?", TURN: "Hva skal turneringen brukes til?" };

export function AkFormelVelger({ verdi = {}, onChange, visFormel = true, dataOdId = "ak-formel-velger", ...rest }) {
  const v = { pModus: "ENKEL", pValg: [], ...verdi };
  const p = AK_STRUKTUR[v.pyr] || null;
  const omr = omradeObjekt(v);
  const dl = delferdighetsListe(v);
  const slots = p ? p.slots : [];
  const har = (s) => slots.includes(s);

  const sett = (felt, k) => {
    if (!onChange) return;
    const neste = { ...v, [felt]: v[felt] === k ? null : k };
    (NULLSTILL[felt] || []).forEach((x) => { neste[x] = null; });
    if (felt === "pyr" || felt === "omr") neste.pValg = [];
    onChange(neste);
  };
  const settP = (k) => {
    if (!onChange) return;
    const valg = v.pValg || [];
    let neste;
    if (v.pModus === "ENKEL") neste = valg[0] === k ? [] : [k];
    else if (v.pModus === "FLERE") neste = valg.includes(k) ? valg.filter((x) => x !== k) : [...valg, k];
    else neste = valg.length === 1 ? [valg[0], k] : [k];
    onChange({ ...v, pValg: neste });
  };
  const pValgt = (k) => {
    const valg = v.pValg || [];
    if (!valg.length) return false;
    if (v.pModus === "INTERVALL" && valg.length === 2) {
      const a = pIdx(valg[0]), b = pIdx(valg[1]), i = pIdx(k);
      return i >= Math.min(a, b) && i <= Math.max(a, b);
    }
    return valg.includes(k);
  };

  const delValgt = v.del && dl ? finn(dl, v.del) : null;
  const motValgt = finn(AK_MOTORIKK, v.mot);
  const belValgt = finn(AK_BELASTNING, v.bel);
  const pressValgt = finn(AK_PRESS, v.press);
  const belKlar = har("mot") ? !!v.mot : !!v.omr;

  return (
    <div className="akhq-fv" data-od-id={dataOdId} {...rest}>
      <Steg nr="1" tittel="Pyramide" valgt={p ? p.l : ""}
        desc="Hva slags trening er dette? Fem typer, aldri flere. Valget her styrer alt under."
        note={p ? { tit: p.l, tekst: p.d } : null}>
        <div className="akhq-fv-chips">
          {Object.keys(AK_STRUKTUR).map((k) => (
            <Chip key={k} l={AK_STRUKTUR[k].l} valgt={v.pyr === k} pyr={PYR_FARGE[k]} onClick={() => sett("pyr", k)} />
          ))}
        </div>
      </Steg>

      <Steg nr="2" tittel="Område" valgt={omr ? omr.l : ""} hvilende={!p}
        desc={p ? OMR_DESC[v.pyr] : "Velg pyramide først."}
        note={omr && omr.d ? { tit: omr.l, tekst: omr.d } : null}>
        {p && p.omrader.map((g, i) => (
          <div className="akhq-fv-grp" key={g.grp || i}>
            {g.grp && <div className="akhq-fv-gl">{g.grp}</div>}
            <div className="akhq-fv-chips">
              {g.items.map((it) => <Chip key={it.k} l={it.l} valgt={v.omr === it.k} onClick={() => sett("omr", it.k)} />)}
            </div>
          </div>
        ))}
      </Steg>

      {harPPosisjon(v) && (
        <Steg nr="P" tittel="P-posisjon" valgt={pStreng(v) || ""}
          desc="Hvor i svingen? MORAD P1.0–P10.0. Velg ett punkt, flere punkter, eller bevegelsen mellom to.">
          <div className="akhq-fv-grp">
            <div className="akhq-fv-gl">Hvordan velge</div>
            <div className="akhq-fv-chips">
              {P_MODUS.map((m) => <Chip key={m.k} l={m.l} valgt={v.pModus === m.k}
                onClick={() => onChange && onChange({ ...v, pModus: m.k, pValg: [] })} />)}
            </div>
          </div>
          <div className="akhq-fv-grp">
            <div className="akhq-fv-gl">
              {v.pModus === "INTERVALL"
                ? (v.pValg || []).length === 0 ? "Trykk startpunkt" : (v.pValg || []).length === 1 ? "Trykk sluttpunkt" : "Trykk for å begynne på nytt"
                : "Posisjon"}
            </div>
            <div className="akhq-fv-chips">
              {AK_P_POSISJONER.map((k) => <Chip key={k} l={k} mono valgt={pValgt(k)} onClick={() => settP(k)} />)}
            </div>
          </div>
        </Steg>
      )}
      {v.pyr === "TEK" && omr && !harPPosisjon(v) && (
        <Steg nr="P" tittel="P-posisjon" felt
          desc={`P-systemet gjelder kun Tee Total og innspill. ${omr.l} har det ikke.`} />
      )}

      <Steg nr="3" tittel="Delferdighet" valgt={delValgt ? delValgt.l : ""} hvilende={!omr}
        desc={!p ? "Velg pyramide først." : har("del") ? "Hva ved slaget trener du?" : "Ikke definert for denne pyramiden."}
        note={delValgt ? { tit: delValgt.l, tekst: delValgt.d } : null}
        apen={p && p.delApen && !dl ? p.delApen : null}>
        {har("del") && dl && (
          <div className="akhq-fv-chips">
            {dl.map((d) => <Chip key={d.k} l={d.l} valgt={v.del === d.k} onClick={() => sett("del", d.k)} />)}
          </div>
        )}
      </Steg>

      <Steg nr="4" tittel="Motorikk" valgt={motValgt ? motValgt.l : ""} hvilende={!har("mot") || !v.del}
        desc={har("mot") ? "Hvor fort går bevegelsen? Erstatter L-fase og CS-nivå." : "Gjelder ikke denne pyramiden."}
        note={motValgt ? { tit: motValgt.l, tekst: motValgt.d } : null}>
        {har("mot") && v.del && (
          <div className="akhq-fv-chips">
            {AK_MOTORIKK.map((m) => <Chip key={m.k} l={m.l} valgt={v.mot === m.k} onClick={() => sett("mot", m.k)} />)}
          </div>
        )}
      </Steg>

      <Steg nr="5" tittel="Belastning" valgt={belValgt ? belValgt.l : ""} hvilende={!belKlar}
        desc="Hvor foregår det? Erstatter M0–M5."
        note={belValgt ? { tit: belValgt.l, tekst: belValgt.d } : null}>
        {belKlar && (
          <div className="akhq-fv-chips">
            {AK_BELASTNING.map((b) => <Chip key={b.k} l={b.l} valgt={v.bel === b.k} onClick={() => sett("bel", b.k)} />)}
          </div>
        )}
      </Steg>

      <Steg nr="6" tittel="Press" valgt={pressValgt ? pressValgt.l : ""} hvilende={!har("press") || !v.bel}
        desc={har("press") ? "Hvor mye står på spill? Erstatter PR1–PR5." : "Gjelder ikke denne pyramiden."}
        note={pressValgt ? { tit: pressValgt.l, tekst: pressValgt.d } : null}>
        {har("press") && v.bel && (
          <div className="akhq-fv-chips">
            {AK_PRESS.map((x) => <Chip key={x.k} l={x.l} valgt={v.press === x.k} onClick={() => sett("press", x.k)} />)}
          </div>
        )}
      </Steg>

      {visFormel && <AkFormelLinje verdi={v} />}
    </div>
  );
}

export function AkFormelLinje({ verdi = {}, dataOdId = "ak-formel-linje", ...rest }) {
  const v = { pModus: "ENKEL", pValg: [], ...verdi };
  const p = AK_STRUKTUR[v.pyr] || null;
  const dl = delferdighetsListe(v);
  const omr = omradeObjekt(v);
  const alle = { pyr: v.pyr, omr: v.omr, p: pStreng(v), del: v.del, mot: v.mot ? MOT_KORT[v.mot] : null, bel: v.bel, press: v.press };
  const slots = formelSlots(v);
  const igjen = slots.filter((s) => !alle[s]).length;
  const menneske = !p ? "Velg pyramide for å begynne."
    : igjen > 0 ? `${igjen} igjen av ${slots.length}.`
    : [p.l, omr ? omr.l : null, harPPosisjon(v) ? pStreng(v) : null,
       v.del && dl ? (finn(dl, v.del) || {}).l : null,
       v.mot ? (finn(AK_MOTORIKK, v.mot) || {}).l : null,
       v.bel ? (finn(AK_BELASTNING, v.bel) || {}).l : null,
       v.press ? (finn(AK_PRESS, v.press) || {}).l : null].filter(Boolean).join(" · ");
  return (
    <div className="akhq-fv-bar" data-od-id={dataOdId} {...rest}>
      <div className="akhq-fv-bl">Formelen så langt</div>
      <div className="akhq-fv-formel">
        {slots.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <span className="akhq-fv-sep">_</span>}
            <span className={alle[s] ? undefined : "akhq-fv-tom"}>{alle[s] || TOM[s]}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="akhq-fv-human">{menneske}</div>
    </div>
  );
}
