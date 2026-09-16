import { IntervallBlokk, Kort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };
const kolonne = { display: "flex", flexDirection: "column" as const, gap: 8, maxWidth: 440 };
const kilde = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" };

/** 4 × 4 min i S4: kondisjonsøktens byggekloss, med dupliser-knapp til høyre. */
export function Standard() {
  return (
    <div style={boks}>
      <IntervallBlokk serier={4} minutter={4} sone="S4" pause="2 min pause" navn="Hovedaktivitet" />
    </div>
  );
}

/** Sonen farger stripen og chipen: S1 rolig, S3 terskel, S5 maks. Aldri lime — soner er data. */
export function Soner() {
  return (
    <div style={kolonne}>
      <IntervallBlokk serier={1} minutter={20} sone="S1" pause="Ingen pause" navn="Rolig jogg" />
      <IntervallBlokk serier={3} minutter={8} sone="S3" pause="3 min pause" navn="Terskeldrag" />
      <IntervallBlokk serier={8} minutter={1} sone="S5" pause="1 min pause" navn="Sprint" />
    </div>
  );
}

/** Slik blokkene står i en kondisjonsøkt: oppvarming, hovedaktivitet, nedjogg. */
export function Kondisjonsokt() {
  return (
    <div style={boks}>
      <Kort eyebrow="Kondisjon · intervaller" action={<span style={kilde}>40 min totalt</span>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <IntervallBlokk serier={1} minutter={10} sone="S1" pause="Ingen pause" navn="Oppvarming" />
          <IntervallBlokk serier={4} minutter={4} sone="S4" pause="3 min pause" navn="Hovedaktivitet" />
          <IntervallBlokk serier={1} minutter={8} sone="S1" pause="Ingen pause" navn="Nedjogg" />
        </div>
      </Kort>
    </div>
  );
}
