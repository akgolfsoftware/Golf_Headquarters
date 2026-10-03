import Link from "next/link";
import { Trophy } from "lucide-react";
import { StatusPille, TomTilstand } from "@/components/precision/pa";

/**
 * PlayerHQ · AI foreslår turneringer.
 * Tom = vei til turneringslista. Rangeringen kommer ferdig fra siden.
 */

export type TournamentStatusTone = "enrolled" | "recommended" | "stretch";

export type TournamentSuggestion = {
  id: string;
  href: string;
  day: string;
  month: string;
  badge: string;
  statusLabel: string;
  statusTone: TournamentStatusTone;
  name: string;
  venue: string | null;
  meta: string[];
  why: string;
};

export type ForeslaTurneringV2Data = {
  playerFirstName: string;
  hcpLabel: string;
  catalogCount: number;
  suggestions: TournamentSuggestion[];
};

const TONE: Record<TournamentStatusTone, "ok" | "live" | "warn"> = {
  enrolled: "ok",
  recommended: "live",
  stretch: "warn",
};

export function ForeslaTurneringV2({ data }: { data: ForeslaTurneringV2Data }) {
  const { hcpLabel, catalogCount, suggestions } = data;
  return (
    <div className="ph-flate">
      <header>
        <p>Turnering</p>
        <h1>Foreslå turnering</h1>
        <p>Vurdert mot handicapet ditt og turneringene du allerede er påmeldt.</p>
      </header>

      <section className="pa-card ph-kort">
        <p>Grunnlag</p>
        <strong>
          {catalogCount > 0
            ? `Vurdert mot ${catalogCount} kommende turneringer · HCP ${hcpLabel}`
            : "Ingen kommende turneringer i katalogen ennå."}
        </strong>
      </section>

      {suggestions.length === 0 ? (
        <section className="pa-card ph-kort">
          <TomTilstand
            icon={Trophy}
            title="Ingen forslag ennå"
            text="Når turneringer passer nivået ditt, dukker de opp her."
          />
          <Link href="/portal/tren/turneringer" className="pa-btn pa-btn--primary pa-btn--full">
            Se turneringer
          </Link>
        </section>
      ) : (
        <>
          <section className="pa-card ph-kort">
            <p>Forslag</p>
            <ul className="ph-rader">
              {suggestions.map((t) => (
                <li key={t.id}>
                  <Link href={t.href}>
                    <span>
                      <strong>{t.name}</strong>
                      <small>
                        {t.day} {t.month} · {t.badge}
                        {t.venue ? ` · ${t.venue}` : ""}
                        {t.meta.length > 0 ? ` · ${t.meta.join(" · ")}` : ""}
                      </small>
                      <small>{t.why}</small>
                    </span>
                    <StatusPille tone={TONE[t.statusTone]}>{t.statusLabel}</StatusPille>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <Link href="/portal/tren/turneringer" className="pa-btn pa-btn--secondary pa-btn--full">
            Se alle turneringene mine
          </Link>
        </>
      )}
    </div>
  );
}
