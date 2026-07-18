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

export type Kompetansemal = {
  id: string;
  classYear: string;
  curriculumCode: string;
  goalNumber: number;
  text: string;
};

export type Periode = {
  id: string;
  name: string;
  startDate: string; // ISO-dato, inkludert
  endDate: string; // ISO-dato, EKSKLUDERT
  tone: string | null;
  note: string | null;
  kompetansemal: Kompetansemal[];
};

export type Samling = {
  id: string;
  title: string;
  startAt: string; // ISO, inkl. klokkeslett
  endAt: string; // ISO, inkl. klokkeslett
  kind: "SAMLING" | "HELDAGSSAMLING";
  location: string | null;
};

// TIME | PROVE | HELDAGSPROVE | EKSAMEN | FERIE | SKOLETUR | ANNET
export type SkoleHendelseKategori =
  | "TIME"
  | "PROVE"
  | "HELDAGSPROVE"
  | "EKSAMEN"
  | "FERIE"
  | "SKOLETUR"
  | "ANNET";

export type SkoleHendelse = {
  id: string;
  classYear: string | null; // null = gjelder alle trinn
  date: string; // ISO-dato
  category: SkoleHendelseKategori;
  title: string;
  note: string | null;
};

export type Turnering = {
  id: string;
  navn: string;
  serie: string; // kort serie-etikett, f.eks. "Østlandstour" | "Srixon Tour" | "Garmin NC" | "Olyo"
  tone: string; // primary | accent | moss | gold | muted — matcher periode-tonene
  startDate: string; // ISO-dato
  endDate: string | null; // ISO-dato eller null
  slug: string | null; // for /turneringer/[slug]-lenke, null = ingen lenke
  location: string | null;
};

export type GruppeKalenderData = {
  gruppeId: string;
  gruppeNavn: string;
  faste: FastTid[];
  perioder: Periode[];
  samlinger: Samling[];
  skoleHendelser: SkoleHendelse[];
  turneringer: Turnering[];
};
