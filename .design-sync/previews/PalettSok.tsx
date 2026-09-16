import { AkseChip, Kort, PalettSok, Rad } from "akgolf-hq-komponenter";

/**
 * PalettSok er det ene søkefeltet inn i øvelsesbiblioteket. Standard-placeholder i kilden sier
 * «drill» (utgått skjermord — det heter øvelse), så hver celle setter placeholder selv.
 */
const felt = { maxWidth: 360 };
const plassholder = "Søk økt, øvelse eller mal …";

/** Tomt felt med søkeikon og placeholder. */
export function Tom() {
  return (
    <div style={felt}>
      <PalettSok value="" onChange={() => {}} placeholder={plassholder} />
    </div>
  );
}

/** Med søketekst: tøm-knappen (×) vises til høyre. */
export function MedTekst() {
  return (
    <div style={felt}>
      <PalettSok value="wedge" onChange={() => {}} placeholder={plassholder} />
    </div>
  );
}

/** I paletten: feltet øverst i kortet, treffene som rader under. */
export function IBiblioteket() {
  return (
    <div style={{ maxWidth: 440 }}>
      <Kort pad="15px 17px" eyebrow="Øvelsesbibliotek · 3 treff">
        <PalettSok value="putt" onChange={() => {}} placeholder={plassholder} />
        <div style={{ marginTop: 10 }}>
          <Rad title="Putt 1–3 m" sub="Test · 20 putter · puttinggreen" meta={<AkseChip a="SLAG" />} />
          <Rad title="Putt Speed 1×5" sub="Test · lengdekontroll · puttinggreen" meta={<AkseChip a="SLAG" />} />
          <Rad title="Greenlesing — seks putter" sub="Øvelse · Observert · 15 min" meta={<AkseChip a="SPILL" />} last />
        </div>
      </Kort>
    </div>
  );
}
