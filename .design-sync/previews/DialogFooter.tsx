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

/** DialogFooter: høyrestilte handlinger over en hårlinje. Én primær CTA per dialog. */
const scene = { position: "relative" as const, height: 560 };
const mute = { color: "hsl(var(--muted-foreground))" };

export function AvbrytOgBekreft() {
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

/** Kun én handling: informasjonsdialog som bare skal lukkes. */
export function EnHandling() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Runden er lagret</DialogTitle>
            <DialogDescription>76 slag · 31 putt · SG totalt +0,4 mot eget snitt.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Se analysen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Statusmelding til venstre (margin-left auto på knappene) og to handlinger til høyre. */
export function MedStatusTilVenstre() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Publiser uke 38?</DialogTitle>
            <DialogDescription>Øyvind Rohjan får varsel og ser økta i «I dag».</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <span style={{ marginRight: "auto", fontSize: 12, ...mute }}>Utkast lagret 14:12</span>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Publiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
