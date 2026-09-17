import { VarselRad, Kort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };

/** Varselliste: to uleste (fet tittel, prikk på ikonet) over to leste. */
export function Liste() {
  return (
    <div style={boks}>
      <Kort eyebrow="Varsler" pad="15px 17px">
        <div>
          <VarselRad
            icon="message-circle"
            tittel="Anders Kristiansen kommenterte økten din"
            sub="«Bra tempo i P4 — hold lav hastighet en uke til.»"
            tid="12 min"
            ulest
          />
          <VarselRad
            icon="calendar"
            tittel="Torsdagsøkten er flyttet til 16:30"
            sub="Privattime — nærspill · Gamle Fredrikstad GK"
            tid="2 t"
            ulest
          />
          <VarselRad
            icon="check-circle"
            tittel="Uke 39 er publisert"
            sub="5 økter · 2 gruppeøkter med WANG Toppidrett"
            tid="I går"
            ulest={false}
          />
          <VarselRad
            icon="credit-card"
            tittel="Faktura F-2026-131 forfaller om 3 dager"
            sub="Performance — september · 1 200 kr"
            tid="I går"
            ulest={false}
            last
          />
        </div>
      </Kort>
    </div>
  );
}

/** Ett lest varsel alene: normal vekt, ingen prikk, ingen skillelinje. */
export function Lest() {
  return (
    <div style={boks}>
      <Kort pad="8px 17px">
        <div>
          <VarselRad icon="bell" tittel="Testdag lørdag — møt 09:00 på GFGK" sub="Fra Anders Kristiansen til WANG-gruppa" tid="3 d" ulest={false} last />
        </div>
      </Kort>
    </div>
  );
}
