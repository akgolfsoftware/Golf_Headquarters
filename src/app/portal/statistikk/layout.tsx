export default function StatistikkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fane-navigasjon leveres av Statistikk-komponenten (SeksjonsTabs).
  // Ingen ekstra SubNav her — dobbel-nav mot fasit.
  return <>{children}</>;
}
