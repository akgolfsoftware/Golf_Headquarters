import { StrikeSmash } from "akgolf-hq-komponenter";

/** Ni soner, rad for rad fra toppen: hæl · senter · tå. */
const DRIVER = [
  { andel: 0.04, smash: 1.42 }, { andel: 0.08, smash: 1.46 }, { andel: 0.03, smash: 1.44 },
  { andel: 0.16, smash: 1.44 }, { andel: 0.38, smash: 1.49 }, { andel: 0.12, smash: 1.47 },
  { andel: 0.11, smash: 1.41 }, { andel: 0.08, smash: 1.45 }, { andel: 0, smash: null },
];

/** 3×3 treffpunkt (hæl ← → tå) med Smash Factor per sone mot ideal 1,50. Tom sone er stiplet og «—». */
export function Standard() {
  return (
    <StrikeSmash
      kolle="Driver"
      soner={DRIVER}
      idealSmash={1.5}
      grunnlag="86 slag · TrackMan · uke 36–38"
      dom="Lav hæl-treff koster 0,06 smash — tee ballen litt høyere."
    />
  );
}

/** 7-jern: ideal 1,38, treffet samlet i senter. */
export function Jern7() {
  return (
    <StrikeSmash
      kolle="7-jern"
      soner={[
        { andel: 0.02, smash: 1.33 }, { andel: 0.1, smash: 1.36 }, { andel: 0.03, smash: 1.34 },
        { andel: 0.12, smash: 1.37 }, { andel: 0.52, smash: 1.38 }, { andel: 0.14, smash: 1.37 },
        { andel: 0.03, smash: 1.31 }, { andel: 0.04, smash: 1.35 }, { andel: 0, smash: null },
      ]}
      idealSmash={1.38}
      grunnlag="54 slag · TrackMan · 10.09.2026"
      dom="Senter-treff på 52 % og smash på ideal. Lav tå er eneste lekkasje."
    />
  );
}

/** Spredt treff: jevn fordeling og smash langt under ideal → gult og rødt i hele bladet. */
export function SpredtTreff() {
  return (
    <StrikeSmash
      kolle="Driver"
      soner={[
        { andel: 0.09, smash: 1.4 }, { andel: 0.12, smash: 1.44 }, { andel: 0.1, smash: 1.41 },
        { andel: 0.13, smash: 1.43 }, { andel: 0.18, smash: 1.47 }, { andel: 0.12, smash: 1.42 },
        { andel: 0.1, smash: 1.38 }, { andel: 0.09, smash: 1.4 }, { andel: 0.07, smash: 1.39 },
      ]}
      idealSmash={1.5}
      grunnlag="120 slag · TrackMan · uke 34–38"
      dom="Bare 18 % i senter — treffpunktet er problemet, ikke svinghastigheten."
    />
  );
}

/** Ingen treffdata (færre enn ni soner) → tom tilstand. */
export function Tom() {
  return <StrikeSmash kolle="Driver" soner={[]} />;
}
