// Delt mellom server (henting) og klient (visning) — kun serialiserbare felter.
// Datoer som ISO-strenger, ikke Date, så de kan sendes trygt fra server-component
// til client-component uten Next.js-serialiseringsoverraskelser.

export type FastTid = {
  id: string;
  weekday: number; // 0=man .. 6=søn
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  title: string;
};

export type Periode = {
  id: string;
  name: string;
  startDate: string; // ISO-dato, inkludert
  endDate: string; // ISO-dato, EKSKLUDERT
  tone: string | null;
  note: string | null;
};

export type GruppeKalenderData = {
  gruppeId: string;
  gruppeNavn: string;
  faste: FastTid[];
  perioder: Periode[];
};
