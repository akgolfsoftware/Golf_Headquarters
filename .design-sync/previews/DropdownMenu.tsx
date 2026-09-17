import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Kort,
} from "akgolf-hq-komponenter";

/**
 * DropdownMenu er Popover-roten: `open`/`defaultOpen` styrer menyen, så den kan vises åpen statisk.
 * Menyen posisjoneres absolutt mot nærmeste posisjonerte forelder → alltid en relativ inline-anker rundt.
 * Bredden til en absolutt meny klemmes av ankerets bredde, så `className="w-max"` lar lengste rad bestemme.
 * Triggeren er en ustilt <button>; i appen får den buttonClasses(), her inline stil med samme mål.
 */
const scene = { position: "relative" as const, height: 400 };
const anker = { position: "relative" as const, display: "inline-block" };
const knapp = {
  fontFamily: "var(--font-poppins)",
  fontWeight: 700,
  fontSize: 13,
  height: 36,
  padding: "0 14px",
  gap: 6,
  alignItems: "center",
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
} as const;
const ikonKnapp = { ...knapp, width: 36, padding: 0, justifyContent: "center" } as const;

export function Apen() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={knapp}>
            Handlinger
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max" align="start">
            <DropdownMenuLabel>Uke 38</DropdownMenuLabel>
            <DropdownMenuItem>Åpne i Workbench</DropdownMenuItem>
            <DropdownMenuItem>Kopier forrige uke</DropdownMenuItem>
            <DropdownMenuItem>Publiser til Øyvind Rohjan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Slett utkast</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** open={false}: bare triggeren rendres. */
export function Lukket() {
  return (
    <div style={{ ...scene, height: 80 }}>
      <div style={anker}>
        <DropdownMenu open={false}>
          <DropdownMenuTrigger style={knapp}>
            Handlinger
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max" align="start">
            <DropdownMenuItem>Åpne i Workbench</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** Slik den står i appen: «…»-knapp i kortets handlingsspor, meny høyrejustert over innholdet. */
export function IKortHandling() {
  return (
    <div style={scene}>
      <div style={{ maxWidth: 440 }}>
        <Kort
          eyebrow="Neste økt · torsdag"
          action={
            <div style={anker}>
              <DropdownMenu open>
                <DropdownMenuTrigger style={ikonKnapp} aria-label="Flere handlinger">
                  <Icon name="more-horizontal" size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-max" align="end">
                  <DropdownMenuItem>Rediger økt</DropdownMenuItem>
                  <DropdownMenuItem>Flytt til onsdag</DropdownMenuItem>
                  <DropdownMenuItem>Dupliser</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Avlys</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        >
          <div style={{ fontSize: 15, fontWeight: 600 }}>Wedge 80–120 m</div>
          <div style={{ fontSize: 13, marginTop: 4, color: "hsl(var(--muted-foreground))" }}>
            16:00–17:30 · Range, Gamle Fredrikstad GK · 60 slag
          </div>
          <div style={{ fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
            Carry-mål 95 m ± 5 med 52-graderen. TrackMan-fila kobles automatisk.
          </div>
        </Kort>
      </div>
    </div>
  );
}
