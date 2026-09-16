import { FokusSpillerBlokk } from "akgolf-hq-komponenter";

const boks = { maxWidth: 520 };

/** Spilleren coachen bør se på nå: hvorfor i klarspråk, tre tall, én handling. */
export function Standard() {
  return (
    <div style={boks}>
      <FokusSpillerBlokk
        navn="Øyvind Rohjan"
        kategori="E · Regional U18"
        hvorfor="SG nærspill har falt 0,8 siste 3 uker, og planetterlevelsen er nede på 60 %. Verdt en prat før Srixon Tour 5."
        tall={[
          { l: "SG totalt", v: "+1,8" },
          { l: "SG nærspill", v: "−0,8" },
          { l: "Etterlevelse", v: "60 %" },
        ]}
        cta="Åpne Workbench"
      />
    </div>
  );
}

/** To tall og en annen handling: spilleren som har blitt borte. */
export function ToTall() {
  return (
    <div style={boks}>
      <FokusSpillerBlokk
        navn="Jonas Bergli"
        kategori="G · Klubbspiller junior"
        hvorfor="Har ikke åpnet appen på 12 dager, og to økter er hoppet over uten årsak."
        tall={[
          { l: "Sist aktiv", v: "12 d" },
          { l: "Hoppet over", v: "2" },
        ]}
        cta="Send melding"
      />
    </div>
  );
}
