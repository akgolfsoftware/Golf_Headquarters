import { Avkryssing } from "akgolf-hq-komponenter";

export function Umerket() {
  return <Avkryssing label="Jeg godtar vilkårene for PlayerHQ" defaultChecked={false} />;
}

/** Avkrysset = fill-farge med hvit hake. */
export function Avkrysset() {
  return <Avkryssing label="Send meg ukesoppsummering på e-post" defaultChecked />;
}

/** Kontrollert med statisk verdi og no-op onChange. */
export function Kontrollert() {
  return <Avkryssing label="Husk meg på denne enheten" checked onChange={() => {}} />;
}

/** Samtykke per organisasjon — to trinn, slik det står i deling-innstillingene. */
export function Samtykkeliste() {
  return (
    <div style={{ display: "flex", flexDirection: "column", maxWidth: 420 }}>
      <Avkryssing label="Del tester, turneringer og statistikk med Team Norway" defaultChecked />
      <Avkryssing label="Del komplett profil: treningsplan, TrackMan og analyse" defaultChecked={false} />
      <Avkryssing label="Coach kan se turneringsresultater fra GolfBox" defaultChecked />
    </div>
  );
}
