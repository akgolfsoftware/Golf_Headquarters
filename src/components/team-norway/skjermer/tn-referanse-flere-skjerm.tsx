import { notFound } from "next/navigation";

import { innloggetKanSeDataGolf } from "@/lib/auth/datagolf-tilgang";
import { hentTnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { hentWagrRefDato, hentWagrRefKort, hentWagrRefValg, parseWagrIder, sokWagrRef } from "@/lib/domain/tn-referanse-wagr";
import { hentSkjermbruker } from "./felles";
import { TnReferanseManglerVisning, TnReferanseSammenlignVisning, TnReferanseSokVisning } from "./tn-referanse-flere-visning";

/** Trener eller ADMIN i Team Norway. Spillere er sendt til PlayerHQ før dette (§TEAM NORWAY ER BARE FOR TRENERE). */
async function trenerkontekst() {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();
  return { brukerNavn: bruker.name, kontekst, visDataGolf: await innloggetKanSeDataGolf() };
}

export async function TnReferanseSammenlignSkjerm({ id }: { id: string | string[] | undefined }) {
  const felles = await trenerkontekst();
  const [valg, kort, dato] = await Promise.all([hentWagrRefValg(), hentWagrRefKort(parseWagrIder(id)), hentWagrRefDato()]);
  return <TnReferanseSammenlignVisning {...felles} valg={valg} kort={kort} dato={dato} />;
}

export async function TnReferanseSokSkjerm({ q }: { q: string | string[] | undefined }) {
  const felles = await trenerkontekst();
  const sok = (Array.isArray(q) ? q[0] : q)?.slice(0, 60) ?? "";
  const [treff, dato] = await Promise.all([sokWagrRef(sok), hentWagrRefDato()]);
  return <TnReferanseSokVisning {...felles} sok={sok} treff={treff} dato={dato} />;
}

export async function TnReferanseManglerSkjerm({ fane }: { fane: "norsk-golf" | "hcp" }) {
  const felles = await trenerkontekst();
  return <TnReferanseManglerVisning {...felles} fane={fane} />;
}
