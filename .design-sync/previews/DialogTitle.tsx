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

/** DialogTitle er h2 i display-font, og aria-labelledby peker på den. Alltid inne i DialogHeader. */
const scene = { position: "relative" as const, height: 560 };

export function KortTittel() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Registrer runde</DialogTitle>
            <DialogDescription>Gamle Fredrikstad GK · 18 hull · gul tee</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              Score <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 600 }}>76</span> · Putt{" "}
              <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 600 }}>31</span> · Fairway-treff 8 av 14
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Lagre runde</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Lang tittel bryter over to linjer og skyver ikke lukk-X. */
export function LangTittel() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Publiser uke 38 til Øyvind Rohjan og tre andre i GFGK Junior?</DialogTitle>
            <DialogDescription>Hver spiller får sin egen kopi av gruppeøktene.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Publiser til 4</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
