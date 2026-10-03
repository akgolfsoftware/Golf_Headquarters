/**
 * Leaderboard — snitt-SG siste 30 dager, topp 25.
 * Gruppe- og kategori-faner styres av URL. Globalt er merket låst.
 */

import Link from "next/link";
import { Lock, Trophy } from "lucide-react";
import { fmtSg } from "@/lib/v2/format";
import { TomTilstand } from "@/components/precision/pa";

export type LeaderboardTab = "venner" | "klubb" | "globalt";
export type LeaderboardSgTab = "totalt" | "approach" | "short-game" | "putting";

export type LeaderboardRad = {
  id: string;
  rank: number;
  navn: string;
  sub: string;
  hcp: string;
  sg: number | null;
  runder: number;
  meg: boolean;
  medalje?: "gull" | "solv" | "bronse";
};

export type LeaderboardV2Data = {
  fornavn: string;
  minRank: number | null;
  total: number;
  tab: LeaderboardTab;
  sgTab: LeaderboardSgTab;
  rader: LeaderboardRad[];
  meg: LeaderboardRad | null;
};

const TABS: { key: LeaderboardTab; label: string; laast?: boolean }[] = [
  { key: "venner", label: "Venner" },
  { key: "klubb", label: "Klubb" },
  { key: "globalt", label: "Globalt", laast: true },
];

const SG_TABS: { key: LeaderboardSgTab; label: string }[] = [
  { key: "totalt", label: "Totalt" },
  { key: "approach", label: "Innspill" },
  { key: "short-game", label: "Nærspill" },
  { key: "putting", label: "Putting" },
];

const SG_LABEL: Record<LeaderboardSgTab, string> = {
  totalt: "Snitt SG",
  approach: "SG APP",
  "short-game": "SG ARG",
  putting: "SG PUTT",
};

const MEDALJE: Record<NonNullable<LeaderboardRad["medalje"]>, string> = {
  gull: "Gull",
  solv: "Sølv",
  bronse: "Bronse",
};

export function LeaderboardV2({ data }: { data: LeaderboardV2Data }) {
  const { fornavn, minRank, total, tab, sgTab, rader, meg } = data;

  return (
    <div className="ph-flate">
      <header>
        <p>Mål · Leaderboard · siste 30 dager</p>
        <h1>
          {minRank != null
            ? `Din plassering, ${fornavn}`
            : `Hvordan står du, ${fornavn}`}
        </h1>
        <p>
          {minRank != null ? `#${minRank} av ${total}. ` : null}
          Pro · siste 30 dager · neste oppdatering søndag 23:59
        </p>
      </header>

      <div className="ph-valg" role="group" aria-label="Gruppe">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/portal/mal/leaderboard?tab=${t.key}&sg=${sgTab}`}
            aria-current={t.key === tab ? "page" : undefined}
            aria-label={t.laast ? `${t.label}, låst` : undefined}
          >
            {t.label}
            {t.laast ? <Lock size={14} aria-hidden /> : null}
          </Link>
        ))}
      </div>

      {meg && (
        <div className="ph-kpi">
          <p className="pa-card">
            <span>Rang</span>
            <strong>
              #{meg.rank} / {total}
            </strong>
          </p>
          <p className="pa-card">
            <span>{SG_LABEL[sgTab]}</span>
            <strong>{meg.sg != null ? fmtSg(meg.sg) : "—"}</strong>
          </p>
          <p className="pa-card">
            <span>Runder</span>
            <strong>{meg.runder}</strong>
          </p>
          <p className="pa-card">
            <span>HCP</span>
            <strong>{meg.hcp}</strong>
          </p>
        </div>
      )}

      <p>Kategori</p>
      <div className="ph-valg" role="group" aria-label="Kategori">
        {SG_TABS.map((t) => (
          <Link
            key={t.key}
            href={`/portal/mal/leaderboard?tab=${tab}&sg=${t.key}`}
            aria-current={t.key === sgTab ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {rader.length === 0 ? (
        <>
          <TomTilstand
            icon={Trophy}
            title="Ingen rangering ennå"
            text="Registrer runder med SG — da dukker plasseringen din opp her."
          />
          <Link href="/portal/runde/live" className="pa-btn pa-btn--primary pa-btn--full">
            Start live-føring
          </Link>
        </>
      ) : (
        <section className="pa-card ph-kort">
          <p>Rangering · {SG_LABEL[sgTab]}</p>
          <ul className="ph-rader">
            {rader.map((r) => (
              <li key={r.id}>
                <Link href={`/portal/spiller/${r.id}`}>
                  <span>
                    <strong>
                      {r.navn}
                      {r.meg ? " · Deg" : ""}
                    </strong>
                    <small>
                      #{r.rank}
                      {r.medalje ? ` · ${MEDALJE[r.medalje]}` : ""}
                      {" · "}
                      {r.sub}
                      {" · HCP "}
                      {r.hcp}
                      {" · "}
                      {r.runder} runder
                    </small>
                  </span>
                  <b>{r.sg != null ? fmtSg(r.sg) : "—"}</b>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rader.length > 0 && (
        <p>
          Viser 1–{rader.length} av {total} medlemmer
        </p>
      )}
    </div>
  );
}
