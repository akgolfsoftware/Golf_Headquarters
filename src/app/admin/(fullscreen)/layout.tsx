/**
 * AgencyOS fullskjerm — uten AX-01-rail/dock. Auth arves fra /admin/layout.
 * Live-tavla er artefakt, aldri fane (AG-09b).
 */
import { TL } from "@/lib/v2/train-lock";

export default function AdminFullscreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: TL.scene,
        color: TL.text,
        fontFamily: TL.font.sans,
        padding: "16px 16px calc(16px + env(safe-area-inset-bottom))",
        paddingTop: "calc(16px + env(safe-area-inset-top))",
      }}
    >
      {children}
    </div>
  );
}
