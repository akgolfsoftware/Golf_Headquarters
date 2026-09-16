import {
  Button,
  Checkbox,
  Icon,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from "akgolf-hq-komponenter";

/**
 * Sheet er rotkomponenten (kontekst + Esc/scroll-lås). Alt synlig kommer fra SheetContent, så hver celle
 * er hel komposisjon. Overlegget er fixed inset-0 → relativ beholder med fast høyde.
 */
const scene = { position: "relative" as const, height: 560 };
const mute = { color: "hsl(var(--muted-foreground))" };
const kropp = { flex: 1, overflowY: "auto" as const, padding: 24 };
const gruppe = { fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8, ...mute };

const KATEGORIER: [string, boolean][] = [
  ["Teknikk", true],
  ["Kortspill", true],
  ["Putting", false],
  ["Banespill", false],
  ["Styrke", false],
];

/** Filterpanel fra høyre: standardbruken i Stall og Workbench. */
export function FiltreHoyre() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="right" size="md">
          <SheetHeader>
            <SheetTitle>Filtre</SheetTitle>
            <SheetDescription>Stall · 14 spillere</SheetDescription>
          </SheetHeader>
          <div style={kropp}>
            <div style={gruppe}>Kategori</div>
            {KATEGORIER.map(([navn, valgt]) => (
              <label key={navn} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 14, cursor: "pointer" }}>
                <Checkbox checked={valgt} readOnly />
                {navn}
              </label>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid hsl(var(--border))", fontSize: 14 }}>
              <span>Kun spillere med utkast</span>
              <Switch checked readOnly />
            </div>
          </div>
          <SheetFooter>
            <Button variant="ghost-light">Nullstill</Button>
            <Button>Bruk 3 filtre</Button>
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
  ["calendar-check", "Booking", false],
  ["settings", "Innstillinger", false],
];

/** Navigasjonsskuff fra venstre på mobil. */
export function MenyVenstre() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="left" size="sm">
          <SheetHeader>
            <SheetTitle>PlayerHQ</SheetTitle>
            <SheetDescription>Øyvind Rohjan · FULL</SheetDescription>
          </SheetHeader>
          <nav style={{ ...kropp, padding: "12px 12px" }}>
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
          <SheetFooter>
            <Button variant="ghost-light" size="sm">Logg ut</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

const OKTTYPER: [string, string, string][] = [
  ["target", "Teknikk", "TrackMan-mål og P-posisjoner"],
  ["flag", "Kortspill", "Chip, pitch og bunker"],
  ["circle-dot", "Putting", "Speed control og linje"],
  ["map", "Banespill", "9 eller 18 hull med scorekort"],
  ["dumbbell", "Styrke", "Sett, reps og tonnasje"],
];

/** Bunnark: velg fra liste på mobil. */
export function VelgOktTypeBunn() {
  return (
    <div style={scene}>
      <Sheet open onOpenChange={() => {}}>
        <SheetContent side="bottom" size="lg">
          <SheetHeader>
            <SheetTitle>Velg økt-type</SheetTitle>
          </SheetHeader>
          <div style={{ ...kropp, padding: "8px 24px 16px" }}>
            {OKTTYPER.map(([ikon, navn, sub], i) => (
              <div
                key={navn}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: i < OKTTYPER.length - 1 ? "1px solid hsl(var(--border))" : "none",
                }}
              >
                <Icon name={ikon} size={20} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{navn}</div>
                  <div style={{ fontSize: 12, ...mute }}>{sub}</div>
                </div>
                <Icon name="chevron-right" size={16} style={mute} />
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
