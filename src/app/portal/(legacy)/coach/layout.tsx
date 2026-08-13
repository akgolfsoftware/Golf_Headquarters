export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ingen ekstra SubNav her — dobbel-nav mot fasit. Alle page.tsx under
  // (legacy)/coach er rene redirects til /portal/coach-v2-flatene.
  return <>{children}</>;
}
