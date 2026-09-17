import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "akgolf-hq-komponenter";

/** DialogHeader: tittel + valgfri beskrivelse over en hårlinje. Vises alltid i hel dialog. */
const scene = { position: "relative" as const, height: 560 };

export function TittelOgBeskrivelse() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Ny økt</DialogTitle>
            <DialogDescription>Velg type og dato. Økten legges i utkast til du publiserer.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              Torsdag 18. september · 16:00–17:30 · Range, Gamle Fredrikstad GK
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Opprett</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Kun tittel: kortere hode, beskrivelsen ligger i body i stedet. */
export function BareTittel() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Flytt økta til onsdag?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              Onsdag 17. september har allerede styrke 07:00. Wedge-økta legges rett etter, 08:15–09:15.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Flytt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
