"use client";

import { ArrowLeft } from "lucide-react";
import { KnappLenke } from "@/components/precision/pa";
import { ScorekortKlient } from "@/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/scorekort-klient";
import type { ScorekortSpec } from "@/lib/portal-tester/protocol";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/precision-player-coach-upgrade.css";

interface PH15TestGjennomforProps {
  testId: string; testNavn: string; beskrivelse: string | null; scoringRule: string; omraade: string;
  sist: { score: number; dato: string } | null; spec: ScorekortSpec; protocol: unknown;
  gjenopptak: { sessionId: string; verdier: Record<number, Record<string, string | boolean>> } | null;
}

/** Hele protokollen og den eksisterende scorings-/gjenopptaksflyten i Precision-fokusrammen. */
export function PH15TestGjennomfor({ testNavn, ...props }: PH15TestGjennomforProps) {
  return <div className="pa-root ph15-full" data-theme="night"><div className="ph15-full__innhold">
    <KnappLenke variant="ghost" icon={ArrowLeft} href={`/portal/tren/tester/${encodeURIComponent(props.testId)}`}>Til testen</KnappLenke>
    <header><span className="ph15-full__kontekst">Test · {props.omraade} · {props.spec.forsok.length} forsøk</span><h1>{testNavn}</h1><p>Før verdiene fra testen. Resultatet lagres når alle forsøk er ferdige.</p></header>
    <ScorekortKlient {...props} />
  </div></div>;
}
