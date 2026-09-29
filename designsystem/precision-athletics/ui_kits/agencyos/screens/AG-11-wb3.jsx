/* AG-11 Workbench for coach — runde 29. Samme Workbench som spilleren, pluss velgere for Gruppe og Spiller (søk, Forrige/Neste, sist brukte), A3-snarveier og B4 (skjult ved lansering). */
(() => {
const S = window.AG_SCREENS, C = (p) => <window.WB3_Workbench kit={window.AGQ} coach {...p} />;
S["AG-11"] = { id: "AG-11", name: "Workbench (coach)", route: "/admin/workbench/[playerId]", Component: C };
S["AG-11-GRUPPE"] = { id: "AG-11-GRUPPE", parent: "AG-11", name: "Workbench · gruppe (grunnmur)", route: "/admin/grupper/[id]/workbench", Component: (p) => <C {...p} mode0="gruppe" /> };
S["AG-11-AR"] = { id: "AG-11-AR", parent: "AG-11", name: "Workbench · årsplan", route: "/admin/workbench/[playerId]?niva=ar", Component: (p) => <C {...p} level0="ar" /> };
S["AG-11-OKT"] = { id: "AG-11-OKT", parent: "AG-11", name: "Workbench · økt og øvelsesbank", route: "/admin/workbench/[playerId]?niva=okt", Component: (p) => <C {...p} level0="okt" side0="bank" /> };
S["AG-11-MAL"] = { id: "AG-11-MAL", parent: "AG-11", name: "Workbench · målsetninger", route: "/admin/workbench/[playerId]?niva=malsetninger", Component: (p) => <C {...p} level0="mal" side0="mal" /> };
S["AG-11-FYS"] = { id: "AG-11-FYS", parent: "AG-11", name: "Workbench · sidefelt fysisk program", route: "/admin/workbench/[playerId]?side=fys", Component: (p) => <C {...p} side0="fys" /> };
S["AG-11-NY"] = { id: "AG-11-NY", parent: "AG-11-AR", name: "Workbench · opprett årsplan", route: "/admin/workbench/[playerId]?niva=ar&ny=1", Component: (p) => <C {...p} level0="ar" wiz0 /> };
S["AG-11-GRUPPE-AR"] = { id: "AG-11-GRUPPE-AR", parent: "AG-11-GRUPPE", name: "Workbench · gruppas årsplan", route: "/admin/grupper/[id]/workbench?niva=ar", Component: (p) => <C {...p} mode0="gruppe" level0="ar" /> };
S["AG-11-PER"] = { id: "AG-11-PER", parent: "AG-11-AR", name: "Workbench · periode", route: "/admin/workbench/[playerId]?niva=periode", Component: (p) => <C {...p} level0="periode" /> };
S["AG-11-PERSKJEMA"] = { id: "AG-11-PERSKJEMA", parent: "AG-11-PER", name: "Workbench · periodeskjema (coach)", route: "/admin/workbench/[playerId]?niva=periode&rediger=t1", Component: (p) => <C {...p} level0="periode" pf0="t1" /> };
S["AG-11-MND"] = { id: "AG-11-MND", parent: "AG-11-AR", name: "Workbench · måned", route: "/admin/workbench/[playerId]?niva=maned", Component: (p) => <C {...p} level0="mnd" /> };
S["AG-11-MNDSKJEMA"] = { id: "AG-11-MNDSKJEMA", parent: "AG-11-MND", name: "Workbench · månedsskjema (coach)", route: "/admin/workbench/[playerId]?niva=maned&rediger=1", Component: (p) => <C {...p} level0="mnd" mf0 /> };
})();
