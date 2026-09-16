import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "akgolf-hq-komponenter";

/** DropdownMenuItem: role="menuitem"-knapp, 14 px, hover på secondary; variant destructive og disabled. */
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

function Trigger({ tekst }: { tekst: string }) {
  return (
    <DropdownMenuTrigger style={knapp}>
      {tekst}
      <Icon name="chevron-down" size={14} />
    </DropdownMenuTrigger>
  );
}

export function Standard() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger tekst="Økt" />
          <DropdownMenuContent className="w-max">
            <DropdownMenuItem>Rediger økt</DropdownMenuItem>
            <DropdownMenuItem>Flytt til onsdag</DropdownMenuItem>
            <DropdownMenuItem>Dupliser</DropdownMenuItem>
            <DropdownMenuItem>Lagre som mal</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** disabled: 50 % opasitet, ingen klikk — her fordi uka ikke har utkast å publisere. */
export function Deaktivert() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger tekst="Uke 38" />
          <DropdownMenuContent className="w-max">
            <DropdownMenuItem>Åpne i Workbench</DropdownMenuItem>
            <DropdownMenuItem>Kopier forrige uke</DropdownMenuItem>
            <DropdownMenuItem disabled>Publiser (ingen utkast)</DropdownMenuItem>
            <DropdownMenuItem disabled>Send påminnelse (allerede sendt)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** variant="destructive": rød tekst, alltid sist og bak en separator. */
export function Destruktiv() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger tekst="Økt" />
          <DropdownMenuContent className="w-max">
            <DropdownMenuItem>Rediger økt</DropdownMenuItem>
            <DropdownMenuItem>Dupliser</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Avlys økt</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Slett økt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** Ikon foran teksten (gap 8 fra flex-raden). */
export function MedIkon() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger tekst="Øyvind Rohjan" />
          <DropdownMenuContent className="w-max">
            <DropdownMenuLabel>Spiller</DropdownMenuLabel>
            <DropdownMenuItem>
              <Icon name="calendar" size={16} />
              Åpne uke i Workbench
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="message-circle" size={16} />
              Send melding
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="target" size={16} />
              Registrer test
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="bar-chart" size={16} />
              Se analyse
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
