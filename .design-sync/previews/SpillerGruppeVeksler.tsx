import { Knapp, SpillerGruppeVeksler } from "akgolf-hq-komponenter";

/** Coach-toppbaren i Workbench: Spiller|Gruppe-pille og søkbart valg. Spiller valgt = avatar med initialer. */
export function Spiller() {
  return <SpillerGruppeVeksler modus="spiller" valgt="Øyvind Rohjan" />;
}

/** Gruppe valgt: gruppeikon i stedet for avatar, gruppenavn med antall spillere. */
export function Gruppe() {
  return <SpillerGruppeVeksler modus="gruppe" gruppe="WANG VG2 · 8 spillere" />;
}

/** Slik den står i toppbaren på Mac: veksleren til venstre, ukehandlingene til høyre. */
export function IToppbar() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", maxWidth: 760 }}>
      <SpillerGruppeVeksler modus="spiller" valgt="Øyvind Rohjan" />
      <div style={{ display: "flex", gap: 8 }}>
        <Knapp ghost icon="copy">Kopier forrige uke</Knapp>
        <Knapp>Publiser uke 38</Knapp>
      </div>
    </div>
  );
}
