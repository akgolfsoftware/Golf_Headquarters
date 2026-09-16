import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "akgolf-hq-komponenter";

/** DropdownMenuLabel: 10 px mono, versaler, sporing 0.12em, dempet — overskrift for en gruppe rader. */
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

export function EnGruppe() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={knapp}>
            Handlinger
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max">
            <DropdownMenuLabel>Uke 38 · Øyvind Rohjan</DropdownMenuLabel>
            <DropdownMenuItem>Åpne i Workbench</DropdownMenuItem>
            <DropdownMenuItem>Kopier forrige uke</DropdownMenuItem>
            <DropdownMenuItem>Publiser</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** To grupper med hver sin label, skilt av separator. */
export function ToGrupper() {
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
            <DropdownMenuItem>Ny testdag</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Konkurranse</DropdownMenuLabel>
            <DropdownMenuItem>Ny turnering</DropdownMenuItem>
            <DropdownMenuItem>Registrer runde</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
