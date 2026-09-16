import { Breadcrumb } from "akgolf-hq-komponenter";

/** To nivåer: forelder som lenke, siste ledd uthevet. Mono 11 px versaler med 0,08 em sperring. */
export function ToNivaa() {
  return <Breadcrumb items={[{ label: "Analyse", href: "/portal/analysere" }, { label: "TrackMan" }]} />;
}

/** backHref gir en tilbake-chevron foran stien (44 px treffmål på mobil). */
export function MedTilbake() {
  return (
    <Breadcrumb
      backHref="/admin/spillere"
      items={[
        { label: "Stall", href: "/admin/spillere" },
        { label: "Øyvind Rohjan", href: "/admin/spillere/oyvind-rohjan" },
        { label: "Tester" },
      ]}
    />
  );
}

/** Fire nivåer i Workbench. Stien brekker aldri; blir den for lang, ruller den horisontalt. */
export function Dypt() {
  return (
    <Breadcrumb
      items={[
        { label: "Workbench", href: "/admin/workbench" },
        { label: "WANG Toppidrett", href: "/admin/workbench/wang" },
        { label: "Uke 38", href: "/admin/workbench/wang/uke-38" },
        { label: "Torsdag 17. september" },
      ]}
    />
  );
}
