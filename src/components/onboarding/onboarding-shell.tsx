import { AkGolfLogo } from "@/components/shared/ak-golf-logo";
import "./onboarding.css";

type Props = {
  children: React.ReactNode;
};

export function OnboardingShell({ children }: Props) {
  return (
    <div className="ob-shell">
      <div className="ob-header-bar">
        <AkGolfLogo variant="white" width={72} />
        <div />
      </div>
      <div className="ob-content">{children}</div>
    </div>
  );
}
