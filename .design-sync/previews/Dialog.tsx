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

/**
 * Slik dialogen komponeres i appen (fra JSDoc i ui/dialog.tsx): åpen tilstand, størrelse md.
 * Kortets ramme er transformert og får høyde fra innholdet; overlegget (fixed inset-0) trenger derfor
 * en beholder med eksplisitt høyde for å vises inne i kortet.
 */
export function NyOkt() {
  return (
    <div style={{ position: "relative", height: 560 }}>
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
