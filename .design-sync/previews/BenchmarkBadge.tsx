import { BenchmarkBadge } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" };

/** Coach-visning: aldersnivå i boksen, måling som etikett, percentil mot referansegruppen. */
export function Standard() {
  return <BenchmarkBadge nivaa="U18" percentil={72} sammenheng="av U18-spillere i basen" label="Club Speed" />;
}

/** To målinger side om side. */
export function ToMaalinger() {
  return (
    <div style={rad}>
      <BenchmarkBadge nivaa="U18" percentil={72} sammenheng="av U18-spillere i basen" label="Club Speed" />
      <BenchmarkBadge nivaa="U18" percentil={64} sammenheng="av U18-spillere i basen" label="Carry driver" />
    </div>
  );
}

/** Uten percentil: tankestrek og forklaring, aldri 0. */
export function UtenPercentil() {
  return <BenchmarkBadge nivaa="U16" percentil={null} sammenheng="(for få målinger)" label="Carry driver" />;
}
