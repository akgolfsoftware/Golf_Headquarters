import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from "akgolf-hq-komponenter";

/** DialogBody: 24 px padding, flex-1 og egen rull når innholdet blir høyere enn 90 vh. */
const scene = { position: "relative" as const, height: 560 };
const etikett = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 } as const;
const mute = { color: "hsl(var(--muted-foreground))" };

export function Skjema() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Ny økt</DialogTitle>
            <DialogDescription>Økten legges i utkast til du publiserer.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={etikett}>Tittel</label>
                <Input defaultValue="Wedge 80–120 m" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={etikett}>Dato</label>
                  <Input defaultValue="18.09.2026" />
                </div>
                <div>
                  <label style={etikett}>Varighet</label>
                  <Select defaultValue="90">
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </Select>
                </div>
              </div>
            </div>
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

export function Tekst() {
  return (
    <div style={scene}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Kopier forrige uke?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              Uke 37 hadde 5 økter og 6 t 15 min. Alt kopieres som utkast til uke 38, så retter du det som
              skal endres.
            </p>
            <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.5, ...mute }}>
              Turneringen lørdag 26. september ligger allerede inne og røres ikke.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost-light">Start tom</Button>
            <Button>Kopier uke 37</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Langt innhold: body ruller, header og footer står fast. Scenen er 576 = max-h 90 vh av 640, så modalen fyller den nøyaktig. */
export function LangtInnhold() {
  const okter = [
    ["Man 14.09", "Styrke · underkropp", "60 min"],
    ["Tir 15.09", "Wedge 80–120 m", "75 min"],
    ["Ons 16.09", "Putting · 3–8 fot", "45 min"],
    ["Tor 17.09", "TrackMan · driver", "90 min"],
    ["Fre 18.09", "Banespill 9 hull", "120 min"],
    ["Lør 19.09", "Kortspill · chip", "60 min"],
    ["Søn 20.09", "Hvile", "—"],
    ["Man 21.09", "Styrke · overkropp", "60 min"],
    ["Tir 22.09", "Approach 120–160 m", "75 min"],
    ["Ons 23.09", "Putting · lag", "45 min"],
  ];
  return (
    <div style={{ ...scene, height: 576 }}>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Økter som publiseres</DialogTitle>
            <DialogDescription>10 økter · uke 38 og 39</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {okter.map(([dag, navn, tid], i) => (
              <div
                key={dag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < okter.length - 1 ? "1px solid hsl(var(--border))" : "none",
                  fontSize: 14,
                }}
              >
                <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12, width: 84, ...mute }}>{dag}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{navn}</span>
                <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 12, ...mute }}>{tid}</span>
              </div>
            ))}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost-light">Avbryt</Button>
            <Button>Publiser 10 økter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
