import { Kort, MiniSpark, Rad } from "akgolf-hq-komponenter";

const SG_OPP = [-1.4, -0.9, -1.1, -0.3, 0.2, -0.4, 0.6, 0.4, 1.0, 1.2];
const SG_NED = [0.8, 0.5, 0.6, 0.1, -0.2, 0.1, -0.4, -0.6];
const tall = (c: string) => ({ fontFamily: "var(--tl-font-mono)", fontSize: 12.5, fontWeight: 700, color: c, fontVariantNumeric: "tabular-nums" as const });

/** Retningen dømmer fargen — siste mot første. SG opp = grønn. Aldri lime. */
export function Stigende() {
  return <MiniSpark verdier={SG_OPP} />;
}

export function Fallende() {
  return <MiniSpark verdier={SG_NED} />;
}

/** Større flate for kort-hoder. */
export function Stor() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
      <MiniSpark verdier={SG_OPP} width={160} height={40} />
      <MiniSpark verdier={SG_NED} width={100} height={30} />
    </div>
  );
}

/** Under to punkter → tekst, aldri en tom strek. */
export function ForFaaData() {
  return <MiniSpark verdier={[0.4]} />;
}

/** Slik den brukes: i listerader, med tallet ved siden av. */
export function IListe() {
  const spillere = [
    { navn: "Øyvind Rohjan", sg: SG_OPP, siste: "+1,2", c: "var(--tl-ok)" },
    { navn: "Emma Berg", sg: [0.1, 0.3, 0.2, 0.5, 0.4, 0.6], siste: "+0,6", c: "var(--tl-ok)" },
    { navn: "Jonas Lie", sg: SG_NED, siste: "−0,6", c: "var(--tl-danger)" },
    { navn: "Sara Holm", sg: [0.2], siste: "—", c: "var(--tl-mute)" },
  ];
  return (
    <Kort eyebrow="SG-trend · stallen" action={<span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>siste 10 runder · mot Broadie scratch</span>}>
      {spillere.map((s, i) => (
        <Rad
          key={s.navn}
          title={s.navn}
          sub={s.sg.length < 2 ? "1 runde registrert" : `${s.sg.length} runder`}
          meta={<MiniSpark verdier={s.sg} />}
          trailing={<span style={tall(s.c)}>{s.siste}</span>}
          last={i === spillere.length - 1}
        />
      ))}
    </Kort>
  );
}
