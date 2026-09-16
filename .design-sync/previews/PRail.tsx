import { Kort, PRail } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560, paddingTop: 18 };
const kilde = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" };

const P4_AKTIV = [
  { p: "P1", status: "done" as const }, { p: "P2", status: "done" as const }, { p: "P3", status: "done" as const },
  { p: "P4", status: "active" as const, fokus: true }, { p: "P5", status: "pending" as const },
  { p: "P6", status: "pending" as const }, { p: "P7", status: "pending" as const }, { p: "P8", status: "pending" as const },
  { p: "P9", status: "pending" as const }, { p: "P10", status: "pending" as const },
];
const P2_AKTIV = P4_AKTIV.map((x, i) => ({ p: x.p, status: i < 1 ? ("done" as const) : i === 1 ? ("active" as const) : ("pending" as const) }));
const P9_AKTIV = P4_AKTIV.map((x, i) => ({ p: x.p, status: i < 8 ? ("done" as const) : i === 8 ? ("active" as const) : ("pending" as const) }));

/** P1–P10 som skinne: ferdige med hake, «Nå» over den aktive, resten dempet. */
export function Standard() {
  return (
    <div style={boks}>
      <PRail posisjoner={P4_AKTIV} />
    </div>
  );
}

/** kompakt: 26 px-sirkler uten etiketter — til kortoverskrifter og lister. */
export function Kompakt() {
  return (
    <div style={{ maxWidth: 440 }}>
      <PRail posisjoner={P4_AKTIV} kompakt />
    </div>
  );
}

/** Tidlig i planen: bare P1 ferdig, P2 aktiv. */
export function TidligIPlanen() {
  return (
    <div style={boks}>
      <PRail posisjoner={P2_AKTIV} />
    </div>
  );
}

/** Sent i planen, inne i et kort med kilde: P9 aktiv, forbindelseslinjene fylles bak den. */
export function IKort() {
  return (
    <div style={{ maxWidth: 560 }}>
      <Kort eyebrow="Teknisk plan · Øyvind Rohjan" action={<span style={kilde}>8 av 10 posisjoner · 12.09.2026</span>}>
        <div style={{ paddingTop: 18 }}>
          <PRail posisjoner={P9_AKTIV} />
        </div>
      </Kort>
    </div>
  );
}
