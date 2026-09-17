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

/** SheetFooter: høyrestilte handlinger over hårlinje, fast i bunnen av panelet. */
const scene = { position: "relative" as const, height: 560 };
const mute = { color: "hsl(var(--muted-foreground))" };
const kropp = { flex: 1, overflowY: "auto" as const, padding: 24 };

const KATEGORIER: [string, boolean][] = [
  ["Teknikk", true],
  ["Kortspill", true],
  ["Putting", true],
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

export function EnHandling() {
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
            <Button>Bruk filtre</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ToHandlinger() {
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
            <Button>Bruk 3 filtre</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Teller til venstre (margin-right auto), handling til høyre. */
export function MedTellerTilVenstre() {
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
            <span style={{ marginRight: "auto", fontSize: 12, ...mute }}>
              <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 600 }}>9</span> av 14 treffer
            </span>
            <Button>Vis 9</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
