import { SpillerTilstand } from "akgolf-hq-komponenter";

/** Coachens 5-sekunderssvar: avatar, navn, tilstand, sist aktiv, SG-trend og ett flagg. */
export function Standard() {
  return <SpillerTilstand navn="Øyvind Rohjan" tilstand="varsel" sgTrend="−0,3" sisteAktivitet="2 t siden" flagg="ACWR 1,46" />;
}

/** De fire tilstandene stablet: god · stabil · varsel · risiko. */
export function Tilstander() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <SpillerTilstand navn="Emma Berg" tilstand="god" sgTrend="+0,6" sisteAktivitet="i dag" flagg={null} />
      <SpillerTilstand navn="Jonas Lie" tilstand="stabil" sgTrend="+0,1" sisteAktivitet="i går" flagg={null} />
      <SpillerTilstand navn="Øyvind Rohjan" tilstand="varsel" sgTrend="−0,3" sisteAktivitet="2 t siden" flagg="ACWR 1,46" />
      <SpillerTilstand navn="Sara Holm" tilstand="risiko" sgTrend="−1,1" sisteAktivitet="9 dager siden" flagg="Ikke åpnet appen" />
    </div>
  );
}

/** Egen formtekst i stedet for standardordet, og klikkbar rad. */
export function MedFormTekst() {
  return <SpillerTilstand navn="Øyvind Rohjan" tilstand="god" formTekst="Toppform før NM" sgTrend="+1,2" sisteAktivitet="i dag" flagg={null} onClick={() => {}} />;
}

/** Ny spiller: ingen aktivitet, ingen trend, ingen flagg. */
export function NySpiller() {
  return <SpillerTilstand navn="Mats Rønning" tilstand="stabil" sgTrend={null} sisteAktivitet={null} flagg={null} />;
}
