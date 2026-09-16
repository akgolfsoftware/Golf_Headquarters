import { SegmentertFaner } from "akgolf-hq-komponenter";

/** Uten synlig etikett (toolbar-bruk): skjermlesernavn via ariaLabel. */
export function Standard() {
  return (
    <SegmentertFaner
      ariaLabel="Tidsrom"
      options={[
        { id: "uke", label: "Uke" },
        { id: "maned", label: "Måned" },
        { id: "sesong", label: "Sesong" },
      ]}
      defaultValue="uke"
    />
  );
}

export function MedEtikett() {
  return (
    <SegmentertFaner
      label="Visning"
      options={[
        { id: "dag", label: "Dag" },
        { id: "uke", label: "Uke" },
        { id: "maned", label: "Måned" },
        { id: "agenda", label: "Agenda" },
      ]}
      defaultValue="maned"
    />
  );
}

/** To valg, kontrollert med statisk verdi. */
export function ToValg() {
  return (
    <SegmentertFaner
      label="Modus"
      options={[
        { id: "plan", label: "Plan" },
        { id: "gjort", label: "Gjort" },
      ]}
      value="gjort"
      onChange={() => {}}
    />
  );
}

/** Mange valg bryter til ny rad i smal kolonne. */
export function MangeValg() {
  return (
    <div style={{ maxWidth: 360 }}>
      <SegmentertFaner
        label="Kategori"
        options={[
          { id: "tee", label: "Tee-slag" },
          { id: "innspill", label: "Innspill" },
          { id: "naerspill", label: "Nærspill" },
          { id: "putting", label: "Putting" },
          { id: "fysisk", label: "Fysisk" },
          { id: "mental", label: "Mental" },
        ]}
        defaultValue="putting"
      />
    </div>
  );
}
