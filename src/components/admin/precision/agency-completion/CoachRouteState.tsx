"use client";
import { CircleAlert } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp, KnappLenke, LasterTilstand } from "@/components/precision/pa";
import { CoachContent } from "./CoachContent";
export function CoachLoading({ text }: { text: string }) { return <AgencyOSSkall navn="Coach"><CoachContent><LasterTilstand text={text} /></CoachContent></AgencyOSSkall>; }
export function CoachError({ reset, title, href }: { reset: () => void; title: string; href: string }) {
  return <AgencyOSSkall navn="Coach"><CoachContent><FeilTilstand icon={CircleAlert} title={title} text="Innholdet kunne ikke hentes. Prøv igjen eller gå tilbake." retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} /><KnappLenke variant="ghost" href={href}>Tilbake</KnappLenke></CoachContent></AgencyOSSkall>;
}
