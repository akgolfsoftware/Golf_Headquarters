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
 * DialogContent eier rammen: størrelse (sm → full), lukk-X og bakteppe. Alltid inne i <Dialog open>.
 * Overlegget er fixed inset-0, så hver celle får en relativ beholder med fast høyde.
 */
const scene = { position: "relative" as const, height: 560 };
const mute = { color: "hsl(var(--muted-foreground))" };

export function StorrelseSm() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Slett økt?</DialogTitle>
            <DialogDescription>Torsdag 18. september · Wedge 80–120 m. Kan ikke angres.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Slett økt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StorrelseMd() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Publiser uke 38?</DialogTitle>
            <DialogDescription>Øyvind Rohjan får varsel og ser økta i «I dag».</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              6 økter · 7 t 30 min · 2 TrackMan-mål (Carry, Attack Angle)
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, ...mute }}>
              Utkastet ble sist endret av Anders Kristiansen i dag kl. 14:12.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Publiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StorrelseLg() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Importer TrackMan-økt</DialogTitle>
            <DialogDescription>CSV fra TrackMan Range, 16. september · 74 slag lest.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                ["Club Speed", "104,2 mph"],
                ["Carry", "231 m"],
                ["Attack Angle", "−1,8°"],
              ].map(([k, v]) => (
                <div key={k} style={{ border: "1px solid hsl(var(--border))", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", ...mute }}>{k}</div>
                  <div style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 22, fontWeight: 600, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Importer 74 slag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** showCloseButton={false}: brukes når handlingen må tas i footeren (samtykke). */
export function UtenLukkeknapp() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Del profil med WANG Toppidrett</DialogTitle>
            <DialogDescription>Trinn 1 deler tester, turneringer og statistikk. Du kan trekke delingen når som helst.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost-light">Ikke nå</Button>
            <Button>Del trinn 1</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
