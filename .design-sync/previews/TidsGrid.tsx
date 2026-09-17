import { TidsGrid } from "akgolf-hq-komponenter";

const UKE_38 = [
  { header: "Man 14", blokker: [{ fra: 7, til: 8.5, akse: "FYS", tittel: "Styrke", sub: "Treningslokalet" }, { fra: 16, til: 17.5, akse: "SLAG", tittel: "Putt 5–10 fot", sub: "40 putter" }] },
  { header: "Tir 15", blokker: [{ fra: 15.5, til: 17, akse: "TEK", tittel: "Teknikk driver", sub: "Lav hastighet" }] },
  { header: "Ons 16", idag: true, blokker: [{ fra: 9, til: 11, akse: "SLAG", tittel: "Innspill ~100 m", sub: "60 slag · Carry ± 5 m" }, { fra: 14, til: 16, akse: "SPILL", tittel: "Banespill 9 hull", sub: "GFGK" }] },
];

/** Tre dager 07–18, onsdag er i dag (prikk i hodet) og nå-linjen står kl. 12:30. */
export function TreDager() {
  return (
    <div style={{ maxWidth: 640 }}>
      <TidsGrid kolonner={UKE_38} fraTime={7} tilTime={18} naa={12.5} onBlokkKlikk={() => {}} />
    </div>
  );
}

/** Én dag 07–19 i smal kolonne: dagvisningen på telefon. */
export function EnDag() {
  return (
    <div style={{ maxWidth: 360 }}>
      <TidsGrid kolonner={[UKE_38[2]]} fraTime={7} tilTime={19} naa={12} />
    </div>
  );
}

/** Forrige uke uten nå-linje (null), tettere timer (48 px) og kortere døgn 08–17. */
export function UtenNaaLinje() {
  return (
    <div style={{ maxWidth: 520 }}>
      <TidsGrid
        kolonner={[
          { header: "Man 7", blokker: [{ fra: 8, til: 10, akse: "FYS", tittel: "Styrke", sub: "Treningslokalet" }] },
          { header: "Tir 8", blokker: [{ fra: 15, til: 16.5, akse: "SLAG", tittel: "Chip og pitch", sub: "Kortspillområdet" }] },
        ]}
        fraTime={8}
        tilTime={17}
        timeHoyde={48}
        naa={null}
      />
    </div>
  );
}
