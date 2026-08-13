export default function MalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ingen ekstra SubNav her — dobbel-nav mot fasit (samme grep som
  // statistikk/varsler-layoutene). Rutene under er redirects/v2-flater.
  return <>{children}</>;
}
