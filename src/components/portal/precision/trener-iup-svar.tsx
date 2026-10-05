"use client";
import type { IupBesvarelse } from "@/lib/iup/utviklingssjekk";
import type { IupSesongevaluering } from "@/lib/iup/sesongevaluering";
import { IupSvarFelt } from "./iup-evaluering";
/** Samme originalspørsmål som spilleren, alltid låst. Skrivehandlinger er ikke montert. */
export function TrenerIupSvar({ svar }: { svar: IupBesvarelse | IupSesongevaluering }) {
  return <IupSvarFelt svar={svar} laast onEndre={() => {}} />;
}
