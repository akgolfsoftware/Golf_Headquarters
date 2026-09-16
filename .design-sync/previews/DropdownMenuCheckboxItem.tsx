import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "akgolf-hq-komponenter";

/** DropdownMenuCheckboxItem: menyrad med hake til venstre når checked; onCheckedChange får motsatt verdi. */
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
const ingen = () => {};

function Trigger({ tekst }: { tekst: string }) {
  return (
    <DropdownMenuTrigger style={knapp}>
      <Icon name="filter" size={14} />
      {tekst}
      <Icon name="chevron-down" size={14} />
    </DropdownMenuTrigger>
  );
}

export function Blandet() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger tekst="Vis: 2 valgt" />
          <DropdownMenuContent className="w-max">
            <DropdownMenuCheckboxItem checked onCheckedChange={ingen}>Utkast</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked onCheckedChange={ingen}>Publiserte</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Gjennomførte</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Avlyste</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function IngenValgt() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger tekst="Kategori" />
          <DropdownMenuContent className="w-max">
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Teknikk</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Kortspill</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Putting</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Banespill</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Styrke</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** Med label, deaktivert valg og «Nullstill» bak en separator. */
export function MedLabelOgNullstill() {
  return (
    <div style={scene}>
      <div style={anker}>
        <DropdownMenu open>
          <Trigger tekst="Kolonner" />
          <DropdownMenuContent className="w-max">
            <DropdownMenuLabel>Vis kolonner</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked onCheckedChange={ingen} disabled>Navn</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked onCheckedChange={ingen}>Neste økt</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked onCheckedChange={ingen}>Siste aktivitet</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Hcp</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false} onCheckedChange={ingen}>Pakke</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Nullstill til standard</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
