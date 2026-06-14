// Lyst, chrome-løst fullskjerm-lag for test-gjennomføring (scorekort).
// Overstyrer PortalShell — ingen sidebar/header — men beholder PlayerHQ lyst
// (låst regel: PlayerHQ alltid lyst). Skiller seg fra (fullscreen) som er mørkt
// for live-økt-tapperen. Auth skjer i hver page.tsx via requirePortalUser.

export default function FullscreenTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-background">{children}</div>;
}
