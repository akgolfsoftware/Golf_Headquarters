import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
} from "akgolf-hq-komponenter";

/**
 * DialogClose er en ustilt <button> som kaller onOpenChange(false). DialogContent bruker den selv til
 * X-en i hjørnet; den kan også stå som egen knapp i footer (da med showCloseButton={false}).
 */
const scene = { position: "relative" as const, height: 560 };
const lukkeKnapp = {
  fontFamily: "var(--font-poppins)",
  fontWeight: 700,
  fontSize: 14,
  height: 44,
  padding: "0 24px",
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
} as const;

export function XIHjornet() {
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

/** Egen lukkeknapp i footer, X-en i hjørnet slått av. */
export function SomKnappIFooter() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Testen er registrert</DialogTitle>
            <DialogDescription>Putt Speed Control · 14 av 20 · 16. september 2026</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose style={lukkeKnapp}>Lukk</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Lukk med ikon og tekst, som i mobilhodet. */
export function MedIkonOgTekst() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md" showCloseButton={false}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <DialogTitle>Uke 38 · Øyvind Rohjan</DialogTitle>
              <DialogClose style={{ ...lukkeKnapp, height: 36, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <Icon name="x" size={14} />
                Lukk
              </DialogClose>
            </div>
            <DialogDescription>6 økter · 7 t 30 min · publisert i går</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              Tre av seks økter er gjennomført. Wedge-økta torsdag mangler TrackMan-fil.
            </p>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
