import { Kort, Pyramide } from "akgolf-hq-komponenter";

/** Timer per akse i periode 3 (uke 32–38). Grunnmuren størst nederst. */
const PERIODE = [
  { akse: "TURN", value: 14, plan: 16 },
  { akse: "SPILL", value: 24, plan: 26 },
  { akse: "SLAG", value: 32, plan: 36 },
  { akse: "TEK", value: 38, plan: 36 },
  { akse: "FYS", value: 40, plan: 38 },
];

/** Fem akser, faktisk mot plan (streken). Tekstfarge med fallende opasitet — aldri én farge per nivå. */
export function Standard() {
  return <Pyramide data={PERIODE} max={50} />;
}

/** Uten plan: bare målt volum, ingen strek. */
export function UtenPlan() {
  return <Pyramide data={PERIODE.map(({ akse, value }) => ({ akse, value, plan: null }))} max={50} />;
}

/** Uten tall — for kompakte flater der tallene står et annet sted. */
export function UtenVerdier() {
  return <Pyramide data={PERIODE} max={50} showValues={false} />;
}

/** I kort med enhet og periode i hodet, og dommen under. */
export function IKort() {
  return (
    <Kort eyebrow="Treningspyramide · timer" action={<span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>periode 3 · uke 32–38 · faktisk / plan</span>}>
      <Pyramide data={PERIODE} max={50} />
      <p style={{ fontFamily: "var(--tl-font-sans)", fontSize: 12.5, color: "var(--tl-mute)", lineHeight: 1.55, margin: "14px 0 0" }}>
        148 av 152 planlagte timer. Slag ligger 4 timer under plan — teknikk og fysisk ligger over.
      </p>
    </Kort>
  );
}
