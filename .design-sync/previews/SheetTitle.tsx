import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "akgolf-hq-komponenter";

/** SheetTitle er h2 i display-font og målet for aria-labelledby. Alltid inne i SheetHeader. */
const scene = { position: "relative" as const, height: 560 };
const mute = { color: "hsl(var(--muted-foreground))" };
const kropp = { flex: 1, overflowY: "auto" as const, padding: 24 };

export function KortTittel() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Filtre</SheetTitle>
            <SheetDescription>Stall · 14 spillere</SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>Ingen filtre valgt. Alle 14 spillere vises.</p>
          </div>
          <SheetFooter>
            <Button>Bruk</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Lang tittel bryter over to linjer og holder seg unna lukk-X. */
export function LangTittel() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Spillere i GFGK Junior med utkast som ikke er publisert</SheetTitle>
            <SheetDescription>4 av 14 · sist endret i dag</SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              Øyvind Rohjan har utkast for uke 38 med 6 økter.
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, ...mute }}>
              Tre andre spillere har utkast fra gruppeuka som venter på deg.
            </p>
          </div>
          <SheetFooter>
            <Button>Publiser alle 4</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
