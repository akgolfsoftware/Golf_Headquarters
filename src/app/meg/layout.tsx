// /meg — Meg-assistentens egen flate inni AK Golf HQ. Mørkt tema, låst til
// Anders (ADMIN). Egen toppnivå-rute (ikke /portal/meg, som er profil-siden).
export default function MegLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">{children}</div>
    </div>
  );
}
