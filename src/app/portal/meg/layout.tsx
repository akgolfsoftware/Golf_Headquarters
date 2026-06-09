/**
 * Meg-layout. Ingen fane-nav (SubNav) — fasiten (MeScreen) har Meg som én
 * scroll-side der undersidene nås via KONTO-lenkelista. Undersidene rendres
 * som egne sider (children) uten fane-rad.
 */
export default function MegLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
