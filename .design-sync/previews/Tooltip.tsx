import { Button, Icon, Tooltip } from "akgolf-hq-komponenter";

const hjelpKnapp = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  padding: 0,
  border: 0,
  borderRadius: 999,
  background: "transparent",
  color: "hsl(var(--muted-foreground))",
  cursor: "help",
};

/**
 * Åpen tilstand vist via den ekte fokus-veien: utløseren har autoFocus, og Tooltip viser innholdet
 * over den (side=top) etter delay. Mørk boks (bg-foreground), 12 px tekst i bakgrunnsfargen.
 */
export function Aapen() {
  return (
    <div style={{ padding: "48px 24px 8px", display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        <span>Smash Factor</span>
        <Tooltip content="Ball Speed delt på Club Speed — 1,50 er teoretisk maks med driver" delay={0}>
          <button type="button" aria-label="Hva er Smash Factor?" style={hjelpKnapp} autoFocus>
            <Icon name="help-circle" size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

/** side="bottom": tipset under utløseren. */
export function Under() {
  return (
    <div style={{ padding: "8px 24px 56px" }}>
      <Tooltip content="Kopierer forrige uke inn i uke 39" side="bottom" delay={0}>
        <Button variant="secondary" size="sm" autoFocus>Kopier forrige uke</Button>
      </Tooltip>
    </div>
  );
}

/** side="right": tipset til høyre for utløseren — for ikonknapper i en rail. */
export function TilHoyre() {
  return (
    <div style={{ padding: "8px 8px 8px 24px" }}>
      <Tooltip content="Workbench" side="right" delay={0}>
        <Button variant="ghost-light" size="sm" aria-label="Workbench" autoFocus>
          <Icon name="calendar" size={18} />
        </Button>
      </Tooltip>
    </div>
  );
}

/** Lukket: slik den står i ro — bare utløseren. Tipset kommer på hover eller tastaturfokus etter 200 ms. */
export function Lukket() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
      <span>Attack Angle</span>
      <Tooltip content="Køllehodets vinkel mot bakken i treffet — positiv er oppover">
        <button type="button" aria-label="Hva er Attack Angle?" style={hjelpKnapp}>
          <Icon name="help-circle" size={16} />
        </button>
      </Tooltip>
    </div>
  );
}
