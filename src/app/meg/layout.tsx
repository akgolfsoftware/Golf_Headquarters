// /meg — Meg-assistentens egen flate inni AK Golf HQ. Mørk som default (marketing-regelen i layout.tsx), låst til
// Anders (ADMIN). Egen toppnivå-rute (ikke /portal/meg, som er profil-siden).
//
// Full-bleed siden Jarvis-skallet (MegApp) selv eier topplinje/tråd/
// artefaktpanel-gridet — samme mønster som KonsollChat i AgencyOS. Den
// gamle sentrerte max-w-2xl-kolonnen passet den forrige, enkle
// brief/ventende/logg-siden, ikke det nye chat+panel-skallet.
export default function MegLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
