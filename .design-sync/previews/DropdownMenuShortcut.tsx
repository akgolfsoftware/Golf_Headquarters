import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Icon,
} from "akgolf-hq-komponenter";

/** DropdownMenuShortcut: mono 10 px, dempet, ml-auto — tastesnarvei helt til høyre i raden. Kun Mac-visningen. */
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

export function AlleMedSnarvei() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={knapp}>
            Økt
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max">
            <DropdownMenuItem>
              Ny økt
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Dupliser
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Publiser
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Slett
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** Blandet: bare de vanligste handlingene har snarvei; lengste rad setter menyens bredde. */
export function Blandet() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <DropdownMenuTrigger style={knapp}>
            Uke 38
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-max">
            <DropdownMenuLabel>Uke 38 · Øyvind Rohjan</DropdownMenuLabel>
            <DropdownMenuItem>
              Åpne i Workbench
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Kopier forrige uke</DropdownMenuItem>
            <DropdownMenuItem>
              Publiser
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Send påminnelse</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
