import {
  Button,
  Checkbox,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "akgolf-hq-komponenter";

/** SheetHeader: tittel + valgfri beskrivelse over hårlinje, fast (shrink-0) over rullende innhold. */
const scene = { position: "relative" as const, height: 560 };
const kropp = { flex: 1, overflowY: "auto" as const, padding: 24 };

const KATEGORIER: [string, boolean][] = [
  ["Teknikk", true],
  ["Kortspill", true],
  ["Putting", false],
  ["Banespill", false],
];

function Filterliste() {
  return (
    <div style={kropp}>
      {KATEGORIER.map(([navn, valgt]) => (
        <label key={navn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14 }}>
          <Checkbox checked={valgt} readOnly />
          {navn}
        </label>
      ))}
    </div>
  );
}

export function TittelOgBeskrivelse() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Filtre</SheetTitle>
            <SheetDescription>Stall · 14 spillere</SheetDescription>
          </SheetHeader>
          <Filterliste />
          <SheetFooter>
            <Button variant="ghost-light">Nullstill</Button>
            <Button>Bruk 2 filtre</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function BareTittel() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Kategori</SheetTitle>
          </SheetHeader>
          <Filterliste />
          <SheetFooter>
            <Button>Bruk</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
