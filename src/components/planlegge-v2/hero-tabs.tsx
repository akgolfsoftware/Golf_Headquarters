/**
 * Hero + plan-tabs som matcher docs/design-handoff/planlegge/*.html.
 * Brukes på alle 5 planlegge-tabs (arsplan/treningsplan/mal/turneringer/drills).
 */

import Link from "next/link";

type Tab = "arsplan" | "treningsplan" | "mal" | "turneringer" | "drills";

export function PlanleggeHeroTabs({
  activeTab,
  counts,
}: {
  activeTab: Tab;
  counts: { treningsplan?: number; mal?: number; turneringer?: number; drills?: number };
}) {
  const tabs: { id: Tab; icon: string; label: string; count?: number }[] = [
    { id: "arsplan", icon: "i-cal", label: "Årsplan" },
    { id: "treningsplan", icon: "i-dumbbell", label: "Treningsplan", count: counts.treningsplan },
    { id: "mal", icon: "i-target", label: "Mål", count: counts.mal },
    { id: "turneringer", icon: "i-trophy", label: "Turneringer", count: counts.turneringer },
    { id: "drills", icon: "i-route", label: "Drills", count: counts.drills },
  ];

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">PlayerHQ · Planlegge</div>
          <h1>
            Plan din <em>utvikling</em>
          </h1>
          <div className="sub">
            <strong style={{ color: "var(--ink)", fontWeight: 700 }}>Sesong 2026</strong>
            <span className="dot" />
            Du er i <strong style={{ color: "var(--forest)", fontWeight: 700 }}>Spesialisering · uke 3 av 6</strong>
            <span className="dot" />
            Neste turnering om <strong style={{ color: "var(--ink)", fontWeight: 700 }}>16 dager</strong>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-outline btn-sm">
            <svg fill="none" stroke="currentColor"><use href="#i-settings" /></svg>
            Periodisering
          </button>
          <button className="btn btn-lime">
            <svg fill="none" stroke="currentColor"><use href="#i-sparkles" /></svg>
            AI mål-bygger
          </button>
        </div>
      </section>

      <nav className="plan-tabs">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/portal/planlegge?tab=${t.id}`}
            className={`plan-tab${activeTab === t.id ? " active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <svg fill="none" stroke="currentColor"><use href={`#${t.icon}`} /></svg>
            {t.label}
            {typeof t.count === "number" && <span className="ct">{t.count}</span>}
          </Link>
        ))}
      </nav>
    </>
  );
}
