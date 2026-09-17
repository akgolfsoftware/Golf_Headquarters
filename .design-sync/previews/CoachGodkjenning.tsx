import { CoachGodkjenning, Kort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };
const kilde = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" };

/** Ett Caddie-forslag som venter på coach: type, P-chip, spiller · tid, begrunnelse, evidens og de tre valgene. */
export function Standard() {
  return (
    <div style={boks}>
      <CoachGodkjenning
        type="Marker krav som ferdig"
        spiller="Øyvind Rohjan"
        p="P4"
        forslag="«Venstre arm parallell i P4» — begge spor er i mål: 300/300 reps og spredning 8,4 m (mål 9,0 m), stabilt siste 14 dager."
        evidens="214 TrackMan-slag · siste 14 dager"
        foreslaatt="I går 21:00"
        last
      />
    </div>
  );
}

/** Nytt krav foreslått med TrackMan-parametere på engelsk med stor forbokstav. */
export function NyttKrav() {
  return (
    <div style={boks}>
      <CoachGodkjenning
        type="Nytt krav"
        spiller="Øyvind Rohjan"
        p="P5"
        forslag="«Hoftene starter nedsvingen før armene» — Club Path har gått fra −4° til −1° på 14 dager, men Attack Angle er fortsatt −6° med driver. Foreslår 200 reps i lav hastighet før neste test."
        evidens="168 TrackMan-slag · siste 14 dager"
        foreslaatt="I dag 06:10"
        last
      />
    </div>
  );
}

/** Køen slik coachen møter den: tre forslag i ett kort, hårlinje mellom, siste uten. */
export function Ko() {
  return (
    <div style={boks}>
      <Kort eyebrow="Forslag fra Caddie · 3 venter" action={<span style={kilde}>Øyvind Rohjan · oppdatert 06:10</span>} pad="4px 17px 6px">
        <CoachGodkjenning
          type="Marker krav som ferdig"
          spiller="Øyvind Rohjan"
          p="P4"
          forslag="«Venstre arm parallell i P4» — begge spor er i mål: 300/300 reps og spredning 8,4 m (mål 9,0 m), stabilt siste 14 dager."
          evidens="214 TrackMan-slag · siste 14 dager"
          foreslaatt="I går 21:00"
        />
        <CoachGodkjenning
          type="Nytt krav"
          spiller="Øyvind Rohjan"
          p="P5"
          forslag="«Hoftene starter nedsvingen før armene» — Club Path har gått fra −4° til −1° på 14 dager, men Attack Angle er fortsatt −6° med driver."
          evidens="168 TrackMan-slag · siste 14 dager"
          foreslaatt="I dag 06:10"
        />
        <CoachGodkjenning
          type="Juster TrackMan-mål"
          spiller="Øyvind Rohjan"
          p="P7"
          forslag="Spredning 7-jern er 8,1 m i snitt siste 60 slag (mål 9,0 m). Foreslår å skjerpe målet til 7,5 m."
          evidens="60 TrackMan-slag · siste 7 dager"
          foreslaatt="Mandag 22:40"
          last
        />
      </Kort>
    </div>
  );
}
