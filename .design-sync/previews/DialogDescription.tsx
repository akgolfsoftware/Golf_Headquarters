import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "akgolf-hq-komponenter";

/** DialogDescription: dempet 14 px under tittelen, koblet via aria-describedby. */
const scene = { position: "relative" as const, height: 560 };

export function EnLinje() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Avlys økta?</DialogTitle>
            <DialogDescription>Øyvind Rohjan får beskjed med en gang.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost-light">Behold</Button>
            <Button>Avlys</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Flere linjer: beskrivelsen bærer konsekvensen, tittelen bare spørsmålet. */
export function FlereLinjer() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Trekk delingen med Team Norway?</DialogTitle>
            <DialogDescription>
              Team Norway mister tilgang til treningsplan, TrackMan-økter og analyse med én gang. Tester,
              turneringer og statistikk (trinn 1) deles fortsatt til du også trekker den. Coachen din får
              beskjed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Trekk trinn 2</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
