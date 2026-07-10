/**
 * /stats/quiz — Golf-statistikk quiz (viralt, Buzzfeed-stil)
 * Metadata-export fra Server Component, all interaktivitet i QuizShell.
 */

import type { Metadata } from "next";
import "@/app/(marketing)/(mlegacy)/stats/stats.css";
import "./quiz.css";
import { QuizShell } from "./quiz-shell";
import { StatsLegacyShell } from "@/components/marketing/v2/stats-ramme";

export const metadata: Metadata = {
  title: "Golf-statistikk quiz | AK Golf Stats",
  description: "Test golfkunnskapen din. 10 spørsmål om PGA Tour-statistikk. Del resultatet med vennene dine.",
  openGraph: {
    title: "Golf-statistikk quiz | AK Golf Stats",
    description: "Hvor mye vet du om proffene? 10 spørsmål · 3 minutter · Del resultatet.",
    url: "https://akgolf.no/stats/quiz",
  },
};

export default function QuizPage() {
  return (
    <StatsLegacyShell>
    <main className="stats-quiz-wrap">
      <QuizShell />
    </main>
    </StatsLegacyShell>
  );
}
