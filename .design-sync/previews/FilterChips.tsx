import { FilterChips } from "akgolf-hq-komponenter";

/** Flervalg: valgt chip får hake og kant i handlingsfargen. */
export function Standard() {
  return (
    <FilterChips
      items={["Putting", "Chip", "Wedge", "Jern", "Driver", "Bane"]}
      active={["Wedge", "Putting"]}
    />
  );
}

/** axis: verdiene er aksenøkler (FYS/TEK/…) og vises i klarspråk med kategoriprikk. */
export function Akser() {
  return <FilterChips axis items={["FYS", "TEK", "SLAG", "SPILL", "TURN"]} active={["TEK", "SLAG"]} />;
}

export function IngenValgt() {
  return <FilterChips items={["Alle", "Utkast", "Publisert", "Fullført", "Avlyst"]} />;
}
