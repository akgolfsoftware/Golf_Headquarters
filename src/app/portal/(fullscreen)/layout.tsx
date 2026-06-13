// Fullscreen layout for Live Session og andre tapper-moduser.
// Overstyrer PortalShell — ingen sidebar, ingen header.
// Auth-sjekk skjer i hver page.tsx via requirePortalUser.

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-foreground">{children}</div>;
}
