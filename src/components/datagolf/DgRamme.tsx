/**
 * Felles ramme for Data Golf-komponentene: tittel, kilde, tilstander og lisensmerket.
 * Brukes inni <div className="agn-s"> (Precision-tokens). Se visning.ts for reglene.
 *
 * «ingen-tilgang» viser ingenting, ikke engang et hint om at data finnes.
 */
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Feil, Laster, Seksjon, Tom } from "@/components/admin/agencyos-ny/ny";
import { DG_INTERN_MERKE, type DgVisning } from "@/lib/datagolf/visning";
import "@/styles/datagolf-komponenter.css";

export type DgRammeProps = {
  tittel: string;
  /** Kilde og dato, f.eks. «Data Golf · runder 2017–2026». */
  kilde?: ReactNode;
  tilstand: DgVisning<unknown>["tilstand"];
  tomTittel?: string;
  tomTekst?: string;
  /** Høyder på lasteskjelettet. */
  lasteHoyder?: number[];
  children?: ReactNode;
};

export function DgMerke() {
  return <p className="dgk-merke"><Lock className="dgk-ikon" aria-hidden /><span>{DG_INTERN_MERKE}</span> <span>Powered by <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer">Data Golf</a></span></p>;
}

export function DgRamme({ tittel, kilde, tilstand, tomTittel = "Ingen data", tomTekst, lasteHoyder, children }: DgRammeProps) {
  if (tilstand === "ingen-tilgang") return null;
  return <Seksjon tittel={tittel} kilde={kilde}>
    <div className="dgk" data-tilstand={tilstand}>
      {tilstand === "laster" && <Laster tekst="Henter …" hoyder={lasteHoyder ?? [140, 56, 56]} />}
      {tilstand === "tom" && <Tom tittel={tomTittel} tekst={tomTekst ?? "Det finnes ingen tall for dette utvalget i Data Golf-kilden. Ingenting er estimert."} />}
      {tilstand === "ikke-konfigurert" && <Tom tittel="Datasettet er ikke satt opp" tekst="Tabellen finnes ikke i databasen ennå. Når synkjobben har kjørt, vises tallene her." />}
      {tilstand === "feil" && <Feil tittel="Kunne ikke hente Data Golf-tallene" tekst="Ingenting er endret. Last siden på nytt, eller prøv igjen om litt." />}
      {tilstand === "klar" && children}
      <DgMerke />
    </div>
  </Seksjon>;
}
