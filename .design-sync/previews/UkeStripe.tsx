import { AvatarInit, Kort, Rad, UkeStripe } from "akgolf-hq-komponenter";

/**
 * Uke-for-uke fullføring som søyle-strip. Bånd: bad (rød) · warn · ok (grønn) · over (lime-aksent).
 * Tom uke (ingen plan) er et grått spor. Inneværende uke (U38) får kant.
 */
type Band = "bad" | "warn" | "ok" | "over";
function uke(label: string, done: number, planned: number, band: Band, isNow = false) {
  return { label, done, planned, fill: planned ? Math.min(1, done / planned) : 0, band, isNow };
}
const OYVIND = [
  uke("U27", 4, 5, "ok"),
  uke("U28", 2, 5, "bad"),
  uke("U29", 3, 5, "warn"),
  uke("U30", 5, 5, "ok"),
  uke("U31", 6, 5, "over"),
  uke("U32", 4, 4, "ok"),
  uke("U33", 1, 4, "bad"),
  uke("U34", 3, 4, "warn"),
  uke("U35", 4, 4, "ok"),
  uke("U36", 5, 4, "over"),
  uke("U37", 3, 5, "warn"),
  uke("U38", 3, 5, "warn", true),
];
const WANG = [
  uke("U27", 0, 0, "ok"),
  uke("U28", 0, 0, "ok"),
  uke("U29", 0, 0, "ok"),
  uke("U30", 0, 0, "ok"),
  uke("U31", 0, 0, "ok"),
  uke("U32", 0, 0, "ok"),
  uke("U33", 0, 0, "ok"),
  uke("U34", 28, 32, "ok"),
  uke("U35", 30, 32, "ok"),
  uke("U36", 24, 32, "warn"),
  uke("U37", 33, 32, "over"),
  uke("U38", 21, 32, "warn", true),
];
const GFGK = OYVIND.map((u) => ({ ...u, done: 0, planned: 0, fill: 0 }));
const kilde = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" };

/** Spillerpanel: tolv uker med etiketter, inneværende uke med kant. */
export function Spillerpanel() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Kort eyebrow="Etterlevelse · siste 12 uker" action={<span style={kilde}>plan mot gjennomført · 16.09.2026</span>}>
        <UkeStripe uker={OYVIND} />
      </Kort>
    </div>
  );
}

/** Kompakt: tynne søyler uten etiketter, som sparkline i stall-rader. */
export function Kompakt() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Kort pad="15px 17px" eyebrow="Stall · etterlevelse">
        <Rad
          leading={<AvatarInit navn="Øyvind Rohjan" size={36} />}
          title="Øyvind Rohjan"
          sub="Uke 38 · 3 av 5 økter"
          trailing={<UkeStripe uker={OYVIND} kompakt />}
        />
        <Rad
          leading={<AvatarInit navn="WANG Toppidrett" size={36} />}
          title="WANG Toppidrett · 8 spillere"
          sub="Uke 38 · 21 av 32 økter · plan fra uke 34"
          trailing={<UkeStripe uker={WANG} kompakt />}
        />
        <Rad
          leading={<AvatarInit navn="GFGK junior" size={36} />}
          title="GFGK junior · 12 spillere"
          sub="Ingen plan publisert ennå"
          trailing={<UkeStripe uker={GFGK} kompakt />}
          last
        />
      </Kort>
    </div>
  );
}

/** Ferieuker uten plan (grå spor) og høyere søyler via `height`. */
export function MedTommeUker() {
  const uker = [
    uke("U26", 4, 5, "ok"),
    uke("U27", 5, 5, "ok"),
    uke("U28", 0, 0, "ok"),
    uke("U29", 0, 0, "ok"),
    uke("U30", 0, 0, "ok"),
    uke("U31", 3, 4, "warn"),
    uke("U32", 4, 4, "ok"),
    uke("U33", 1, 4, "bad", true),
  ];
  return (
    <div style={{ maxWidth: 440 }}>
      <UkeStripe uker={uker} height={60} />
    </div>
  );
}
