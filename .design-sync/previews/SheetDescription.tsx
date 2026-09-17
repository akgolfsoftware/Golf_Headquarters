import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "akgolf-hq-komponenter";

/** SheetDescription: dempet 14 px under tittelen, koblet via aria-describedby. */
const scene = { position: "relative" as const, height: 560 };
const kropp = { flex: 1, overflowY: "auto" as const, padding: 24 };

export function EnLinje() {
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

export function FlereLinjer() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Del med Team Norway</SheetTitle>
            <SheetDescription>
              Trinn 1 deler tester, turneringer og statistikk og er gratis. Trinn 2 deler hele profilen
              med treningsplan, TrackMan og analyse, og krever FULL. Du kan trekke hvert trinn når som helst.
            </SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>Team Norway ser i dag: trinn 1.</p>
          </div>
          <SheetFooter>
            <Button variant="ghost-light">Trekk trinn 1</Button>
            <Button>Del trinn 2</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
