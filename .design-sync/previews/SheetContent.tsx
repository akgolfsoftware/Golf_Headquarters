import {
  Button,
  Checkbox,
  Icon,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "akgolf-hq-komponenter";

/**
 * SheetContent eier side (left/right/top/bottom) og størrelse (sm–xl), bakteppe og lukk-X.
 * Horisontale sider bruker size som maks bredde, vertikale som maks høyde (30–85 vh).
 */
const scene = { position: "relative" as const, height: 560 };
const mute = { color: "hsl(var(--muted-foreground))" };
const kropp = { flex: 1, overflowY: "auto" as const, padding: 24 };
const mono = { fontFamily: "var(--font-ibm-plex-mono)" };

const KATEGORIER: [string, boolean][] = [
  ["Teknikk", true],
  ["Kortspill", true],
  ["Putting", false],
  ["Banespill", false],
];

export function HoyreMd() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Filtre</SheetTitle>
            <SheetDescription>Stall · 14 spillere</SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            {KATEGORIER.map(([navn, valgt]) => (
              <label key={navn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14 }}>
                <Checkbox checked={valgt} readOnly />
                {navn}
              </label>
            ))}
          </div>
          <SheetFooter>
            <Button variant="ghost-light">Nullstill</Button>
            <Button>Bruk 2 filtre</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

const NAV: [string, string, boolean][] = [
  ["home", "I dag", true],
  ["calendar", "Plan", false],
  ["bar-chart", "Analyse", false],
  ["user", "Meg", false],
];

export function VenstreSm() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="left" size="sm">
          <SheetHeader>
            <SheetTitle>PlayerHQ</SheetTitle>
            <SheetDescription>Øyvind Rohjan · FULL</SheetDescription>
          </SheetHeader>
          <nav style={{ ...kropp, padding: 12 }}>
            {NAV.map(([ikon, navn, aktiv]) => (
              <a
                key={navn}
                href="#"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: aktiv ? 600 : 500,
                  textDecoration: "none",
                  color: "inherit",
                  background: aktiv ? "hsl(var(--secondary))" : "transparent",
                }}
              >
                <Icon name={ikon} size={18} />
                {navn}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** bottom + lg = maks 70 vh; høyden følger innholdet. */
export function BunnLg() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="bottom" size="lg">
          <SheetHeader>
            <SheetTitle>Wedge 80–120 m</SheetTitle>
            <SheetDescription>Torsdag 18. september · 16:00–17:30 · Øyvind Rohjan</SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                ["Slag", "60"],
                ["Carry-mål", "95 m ± 5"],
                ["Varighet", "40 min"],
              ].map(([k, v]) => (
                <div key={k} style={{ border: "1px solid hsl(var(--border))", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", ...mute }}>{k}</div>
                  <div style={{ ...mono, fontSize: 20, fontWeight: 600, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: "20px 0 0", fontSize: 14, lineHeight: 1.5 }}>
              Mål: Carry 95 m ± 5 på 60 slag med 52-graderen. TrackMan-fila kobles automatisk når du starter økta
              fra denne skjermen.
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, ...mute }}>
              Planlagt av Anders Kristiansen · utkast lagret i går kl. 20:14
            </p>
          </div>
          <SheetFooter>
            <Button variant="secondary">Rediger</Button>
            <Button>Start økt</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** top + sm = maks 30 vh: søkefelt som glir ned fra toppen. */
export function ToppSm() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="top" size="sm">
          <SheetHeader>
            <SheetTitle>Søk</SheetTitle>
          </SheetHeader>
          <div style={{ ...kropp, padding: "16px 24px" }}>
            <Input placeholder="Søk etter spiller, økt eller test …" />
            <div style={{ fontSize: 12, marginTop: 8, ...mute }}>Tips: skriv «uke 38» for å hoppe rett til uka.</div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** right + xl (max-w-xl): bredt arbeidspanel, uten lukk-X fordi footeren eier lukkingen. */
export function HoyreXlUtenLukkeknapp() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="xl" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>TrackMan · driver, 16. september</SheetTitle>
            <SheetDescription>74 slag · Range, Gamle Fredrikstad GK</SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[
                ["Club Speed", "104,2 mph"],
                ["Ball Speed", "152,8 mph"],
                ["Carry", "231 m"],
                ["Attack Angle", "−1,8°"],
              ].map(([k, v]) => (
                <div key={k} style={{ border: "1px solid hsl(var(--border))", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", ...mute }}>{k}</div>
                  <div style={{ ...mono, fontSize: 20, fontWeight: 600, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: "20px 0 0", fontSize: 14, lineHeight: 1.5 }}>
              Smash Factor 1,47 i snitt. Attack Angle ligger fortsatt negativt; målet fra forrige økt var +1°.
            </p>
          </div>
          <SheetFooter>
            <Button variant="ghost-light">Lukk</Button>
            <Button>Importer 74 slag</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
