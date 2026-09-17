import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "akgolf-hq-komponenter";

/**
 * DropdownMenuContent = PopoverContent med role="menu"-liste: side (bottom/top/left/right) og align
 * (start/center/end) mot triggeren. Posisjoneres absolutt mot nærmeste posisjonerte forelder.
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

function Trigger() {
  return (
    <DropdownMenuTrigger style={knapp}>
      Uke 38
      <Icon name="chevron-down" size={14} />
    </DropdownMenuTrigger>
  );
}

function Valg() {
  return (
    <>
      <DropdownMenuLabel>Uke 38</DropdownMenuLabel>
      <DropdownMenuItem>Åpne i Workbench</DropdownMenuItem>
      <DropdownMenuItem>Kopier forrige uke</DropdownMenuItem>
      <DropdownMenuItem>Publiser</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">Slett utkast</DropdownMenuItem>
    </>
  );
}

/** Standard: under triggeren, venstrekant på linje. */
export function NedStart() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger />
          <DropdownMenuContent className="w-max" side="bottom" align="start">
            <Valg />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** align="end": høyrekant på linje med triggeren — for knapper ytterst til høyre. */
export function NedEnd() {
  return (
    <div style={{ ...scene, display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger />
          <DropdownMenuContent className="w-max" side="bottom" align="end">
            <Valg />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** side="top": åpner oppover når triggeren står nederst (bunn-dokk, mobil). */
export function OppStart() {
  return (
    <div style={scene}>
      <div style={{ ...anker, position: "absolute", left: 0, bottom: 0 }}>
        <DropdownMenu open>
          <Trigger />
          <DropdownMenuContent className="w-max" side="top" align="start">
            <Valg />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** side="right": til høyre for triggeren, toppkant på linje — for rail/sidemeny. */
export function HoyreStart() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger />
          <DropdownMenuContent className="w-max" side="right" align="start">
            <Valg />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
