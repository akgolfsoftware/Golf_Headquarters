import {
  Button,
  Icon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "akgolf-hq-komponenter";

/**
 * SheetClose er en ustilt <button> som kaller onOpenChange(false). SheetContent bruker den til X-en;
 * den kan også stå som egen knapp (da med showCloseButton={false}).
 */
const scene = { position: "relative" as const, height: 560 };
const mute = { color: "hsl(var(--muted-foreground))" };
const kropp = { flex: 1, overflowY: "auto" as const, padding: 24 };
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

/** Egen «Lukk»-knapp i footer, X-en slått av. */
export function SomKnappIFooter() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Om SG-tallet</SheetTitle>
            <SheetDescription>Strokes Gained måles mot ditt eget snitt, ikke mot proffene.</SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              +0,4 betyr at du sparte 0,4 slag per runde mot snittet ditt de siste 30 dagene. Tallet kommer fra
              runder du selv har registrert, med dato og bane.
            </p>
          </div>
          <SheetFooter>
            <SheetClose style={lukkeKnapp}>Lukk</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Tilbake-pil i hodet på en venstreskuff (mobilmønster). */
export function TilbakeIHode() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="left" size="sm" showCloseButton={false}>
          <SheetHeader>
            <SheetClose
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: 0, padding: 0, fontFamily: "var(--font-poppins)", fontSize: 12, fontWeight: 600, cursor: "pointer", ...mute }}
            >
              <Icon name="arrow-left" size={14} />
              Tilbake
            </SheetClose>
            <SheetTitle>Innstillinger</SheetTitle>
          </SheetHeader>
          <div style={kropp}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>Varsler, tema og deling per organisasjon.</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
