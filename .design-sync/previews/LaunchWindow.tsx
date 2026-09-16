import { LaunchWindow } from "akgolf-hq-komponenter";

const DRIVER_SKUDD = [
  { launch: 11.2, spinn: 2900 }, { launch: 12.4, spinn: 2450 }, { launch: 13.1, spinn: 2300 },
  { launch: 10.4, spinn: 3150 }, { launch: 12.9, spinn: 2600 }, { launch: 14.2, spinn: 2100 },
  { launch: 11.8, spinn: 2750 }, { launch: 13.6, spinn: 2350 }, { launch: 12.1, spinn: 3050 }, { launch: 13.3, spinn: 2500 },
];
const DRIVER_VINDU = { launchMin: 12, launchMax: 14.5, spinnMin: 2100, spinnMax: 2600 };

/** Launch Angle mot Spin Rate for ti driverslag. Grønt felt = kravvinduet, fylte prikker = inne. Meter igjen i hodet. */
export function Standard() {
  return (
    <LaunchWindow
      kolle="Driver"
      csNivaa="Kat. A"
      skudd={DRIVER_SKUDD}
      vindu={DRIVER_VINDU}
      meterIgjen={9}
      grunnlag="26 slag · TrackMan · 12.09.2026"
      dom="Spinnen ligger ~400 rpm for høyt — det ligger 9 meter igjen i vinduet."
    />
  );
}

/** 7-jern: annet vindu og annen skala — de fleste slag inne, to meter igjen. */
export function Jern7() {
  return (
    <LaunchWindow
      kolle="7-jern"
      csNivaa="Kat. A"
      skudd={[
        { launch: 17.8, spinn: 6800 }, { launch: 18.4, spinn: 7100 }, { launch: 16.2, spinn: 6100 },
        { launch: 18.9, spinn: 7300 }, { launch: 17.5, spinn: 6600 }, { launch: 19.6, spinn: 7900 },
        { launch: 18.1, spinn: 6900 }, { launch: 17.2, spinn: 6400 }, { launch: 18.7, spinn: 7200 }, { launch: 15.8, spinn: 5900 },
      ]}
      vindu={{ launchMin: 17, launchMax: 19.5, spinnMin: 6200, spinnMax: 7500 }}
      meterIgjen={2}
      grunnlag="40 slag · TrackMan · 10.09.2026"
      dom="Stabilt — de to lave slagene er tynne treff, ikke et launch-problem."
    />
  );
}

/** Uten dom og uten meter-tall: kun grafen og andelen i vinduet. */
export function KunGraf() {
  return (
    <LaunchWindow
      kolle="Driver"
      csNivaa="Kat. B"
      skudd={DRIVER_SKUDD.slice(0, 6)}
      vindu={DRIVER_VINDU}
      meterIgjen={null}
      grunnlag="6 slag · TrackMan"
      dom={null}
    />
  );
}

/** Ingen TrackMan-data ennå → tom tilstand med kølle og krav i teksten. */
export function Tom() {
  return <LaunchWindow kolle="3-tre" csNivaa="Kat. A" skudd={[]} />;
}
