import { Button, TallHero } from "akgolf-hq-komponenter";

/** Målt tall med enhet, delta og kilde. Tallet vises direkte, aldri med opptelling. */
export function Standard() {
  return (
    <TallHero
      label="Snittscore"
      value="74,3"
      unit="slag"
      delta="−1,2"
      dir="down"
      sub="Siste 10 runder · kilde: GolfBox, 14.09.2026"
    />
  );
}

export function Aksent() {
  return <TallHero label="SG totalt" value="+1,8" delta="+0,4" dir="up" accent sub="Mot eget snitt, 30 dager" />;
}

export function MedHandling() {
  return (
    <TallHero
      label="Økter denne uka"
      value={4}
      unit="av 6"
      sub="To gjenstår: onsdag og lørdag"
      action={<Button variant="secondary" size="sm">Åpne uke</Button>}
    />
  );
}

/** Tom verdi gir tankestrek — aldri 0. */
export function Tom() {
  return <TallHero label="Putt per runde" value="" sub="Ingen runder registrert ennå" />;
}
