import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Start,
  head: () => ({
    meta: [{ title: "AK Golf HQ" }, { name: "theme-color", content: "#E6E3DD" }],
  }),
});

const PRODUCTS = [
  {
    to: "/admin",
    search: { skjerm: "workbench" as const, rolle: "COACH" as const, tilstand: "normal" as const },
    kicker: "Coach",
    title: "AgencyOS",
    lead: "Workbench uke 38 · Nora Berg. Fasit.",
  },
  {
    to: "/portal",
    search: { skjerm: "i-dag" as const, rolle: "SP" as const, tilstand: "normal" as const },
    kicker: "Spiller",
    title: "PlayerHQ",
    lead: "I dag, plan, live. Demo som Mina. FO har ikke Live.",
  },
  {
    to: "/wang",
    search: { skjerm: "oversikt" as const, rolle: "SS" as const },
    kicker: "Skole",
    title: "WANG Toppidrett",
    lead: "Navy/teal. SS, trener, spiller, foresatt.",
  },
  {
    to: "/team-norway",
    search: { skjerm: "oversikt" as const, rolle: "SS" as const, tilstand: "suksess" as const },
    kicker: "Landslag",
    title: "Team Norway",
    lead: "Claw: navy og rød. 22+ skjermer. FO har ikke Live.",
  },
] as const;

function Start() {
  return (
    <div className="min-h-dvh bg-flate px-4 py-12 text-ink">
      <div className="mx-auto flex max-w-lg flex-col gap-8">
        <div className="flex items-center gap-3">
          <img src="/ak-golf-logo.svg" alt="" className="h-9 w-10" />
          <div>
            <p className="m-0 font-display text-xs font-semibold uppercase tracking-[0.14em] text-grafitt-500">
              AK Golf
            </p>
            <h1 className="m-0 font-display text-3xl font-semibold">Velg flate</h1>
          </div>
        </div>
        <p className="m-0 text-sm text-grafitt-600">
          Innlogging er demo-rolle i hver flate. URL er ikke eneste sannhet — FO stenges i koden.
        </p>
        <div className="flex flex-col gap-3">
          {PRODUCTS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              search={p.search}
              className="flex min-h-11 flex-col gap-1 rounded-md border border-sand-400 bg-hevet px-4 py-4"
            >
              <span className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-grafitt-500">
                {p.kicker}
              </span>
              <span className="font-display text-xl font-semibold">{p.title}</span>
              <span className="text-sm text-grafitt-600">{p.lead}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
