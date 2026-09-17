import {
  AvatarInit,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Rad,
} from "akgolf-hq-komponenter";

/**
 * DropdownMenuTrigger er PopoverTrigger: en native <button class="inline-flex"> med aria-expanded/-controls.
 * Ustilt med vilje — appen gir den buttonClasses(); her inline stil med samme mål (36 px, radius 12).
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

function Handlinger() {
  return (
    <DropdownMenuContent className="w-max" align="start">
      <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
      <DropdownMenuItem>Åpne uke i Workbench</DropdownMenuItem>
      <DropdownMenuItem>Send melding</DropdownMenuItem>
      <DropdownMenuItem>Registrer test</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">Fjern fra stall</DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export function IkonKnapp() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={ikonKnapp} aria-label="Flere handlinger">
            <Icon name="more-horizontal" size={16} />
          </DropdownMenuTrigger>
          <Handlinger />
        </DropdownMenu>
      </div>
    </div>
  );
}

export function TekstMedChevron() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={knapp}>
            Sorter: neste økt
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max" align="start">
            <DropdownMenuItem>Neste økt</DropdownMenuItem>
            <DropdownMenuItem>Siste aktivitet</DropdownMenuItem>
            <DropdownMenuItem>Navn A–Å</DropdownMenuItem>
            <DropdownMenuItem>Trenger deg først</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** I en stall-rad: triggeren ligger i trailing, menyen høyrejustert. */
export function IStallRad() {
  return (
    <div style={scene}>
      <div style={{ maxWidth: 480, padding: "0 12px", border: "1px solid hsl(var(--border))", borderRadius: 16 }}>
        <Rad
          leading={<AvatarInit navn="Øyvind Rohjan" size={34} />}
          title="Øyvind Rohjan"
          sub="Neste økt torsdag 16:00 · siste aktivitet i går"
          trailing={
            <div style={anker}>
              <DropdownMenu open>
                <DropdownMenuTrigger style={ikonKnapp} aria-label="Flere handlinger">
                  <Icon name="more-horizontal" size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-max" align="end">
                  <DropdownMenuLabel>Øyvind Rohjan</DropdownMenuLabel>
                  <DropdownMenuItem>Åpne uke i Workbench</DropdownMenuItem>
                  <DropdownMenuItem>Send melding</DropdownMenuItem>
                  <DropdownMenuItem>Registrer test</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Fjern fra stall</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
          last
        />
      </div>
    </div>
  );
}
