/**
 * PH25AiCoach — Caddie-innstillinger i PlayerHQSkall.
 * Oversikt først. Aktivering er fortsatt av, og hjelp er veien videre.
 */

import { Check, Sparkles } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Ikon, Knapp, KnappLenke, StatusPille } from "@/components/precision/pa";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FAQ = [
  { q: "Hva kan Caddie ikke gjøre?", a: "Den erstatter ikke coach. Den foreslår basert på dine tall — du bestemmer." },
  { q: "Er AI-data privat?", a: "Ja. Dataene dine brukes bare til din egen assistent, ikke til å trene andres modell." },
  { q: "Erstatter Caddie Anders?", a: "Nei. Den er et ekstra lag mellom øktene — coach-beslutninger står fast." },
] as const;

const FEATURES = [
  "Analyserer SG-data og foreslår øvelser",
  "Ukentlig AI-rapport til deg og coach",
  "Svarer på golfspørsmål basert på dine data",
] as const;

export default async function AiCoachPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const ulest = await getUnreadNotifications(user.id, 1);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal/meg/innstillinger" className="ph-tilbake">Innstillinger</Link>
          <header>
            <p>Innstillinger</p>
            <h1>Caddie</h1>
            <p>Personlig assistent som leser dataene dine og foreslår neste steg.</p>
          </header>
          <StatusPille>Kommer snart</StatusPille>

          <section className="pa-card ph-kort">
            <p>Hva Caddie gjør</p>
            <small>Personlig · datadrevet · coach-assistent</small>
            <ul>
              {FEATURES.map((f) => (
                <li key={f}>
                  <Ikon icon={Check} size={16} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pa-card ph-kort">
            <p>Ofte stilte spørsmål</p>
            <ul>
              {FAQ.map((item) => (
                <li key={item.q}>
                  <span>
                    <strong>{item.q}</strong>
                    <small>{item.a}</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <Knapp fullWidth icon={Sparkles} disabled>
            Aktiver Caddie (kommer)
          </Knapp>
          <KnappLenke href="/portal/meg/help" variant="secondary" fullWidth>
            Les mer i hjelpesenteret →
          </KnappLenke>
        </div>
      </div>
    </PlayerHQSkall>
  );
}
