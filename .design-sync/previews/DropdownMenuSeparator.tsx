import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "akgolf-hq-komponenter";

/** DropdownMenuSeparator: 1 px hårlinje (bg-border) med 4 px luft over og under, role="separator". */
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

/** Skiller grupper av like handlinger. */
export function MellomGrupper() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={knapp}>
            Ny
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max">
            <DropdownMenuLabel>Trening</DropdownMenuLabel>
            <DropdownMenuItem>Ny økt</DropdownMenuItem>
            <DropdownMenuItem>Ny styrkeøkt</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Konkurranse</DropdownMenuLabel>
            <DropdownMenuItem>Ny turnering</DropdownMenuItem>
            <DropdownMenuItem>Registrer runde</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Importer fra TrackMan …</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** Foran den destruktive handlingen — alltid. */
export function ForDestruktiv() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={knapp}>
            Økt
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max">
            <DropdownMenuItem>Rediger økt</DropdownMenuItem>
            <DropdownMenuItem>Flytt til onsdag</DropdownMenuItem>
            <DropdownMenuItem>Dupliser</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Slett økt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
