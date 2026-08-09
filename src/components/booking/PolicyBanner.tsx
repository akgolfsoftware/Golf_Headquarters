/**
 * Paper policy banner — 24t avbestilling / ombooking (nb).
 * Bruker policyBannerTexts() så copy ikke divergierer fra server policy.
 */
import { policyBannerTexts } from "@/lib/booking/policy";
import { T } from "@/lib/v2/tokens";

export function PolicyBanner({
  variant = "cancel",
  className,
}: {
  variant?: "cancel" | "reschedule" | "both";
  className?: string;
}) {
  const t = policyBannerTexts();
  const lines =
    variant === "cancel"
      ? [t.cancel]
      : variant === "reschedule"
        ? [t.reschedule]
        : [t.cancel, t.reschedule];

  return (
    <aside
      data-od-id="booking-policy-banner"
      className={className}
      style={{
        border: `1px dashed ${T.border}`,
        background: T.panel2,
        borderRadius: 12,
        padding: "12px 14px",
        fontFamily: "Lora, Georgia, serif",
        fontSize: 13.5,
        lineHeight: 1.45,
        color: T.mut,
      }}
    >
      {lines.map((line) => (
        <p key={line} style={{ margin: "0 0 6px" }}>
          {line}
        </p>
      ))}
      <p style={{ margin: 0, fontFamily: "Poppins, system-ui, sans-serif", fontSize: 12 }}>
        Under 24 timer: avbestilling tillatt uten kredit/refusjon (unntak coach/admin).
      </p>
    </aside>
  );
}
