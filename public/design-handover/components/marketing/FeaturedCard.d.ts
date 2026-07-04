import * as React from "react";
import { ButtonVariant } from "../core/Button";

export interface FeaturedCardProps {
  /** Background photo URL. Without it, a forest surface is used. */
  image?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  ctaLabel?: React.ReactNode;
  ctaVariant?: ButtonVariant;
  onCta?: React.MouseEventHandler;
  href?: string;
  /** Min height in px. Default 340. */
  height?: number;
  /** Content placement. */
  align?: "bottom" | "center";
  className?: string;
  style?: React.CSSProperties;
}

/** Marketing hero card — photo under a forest scrim, eyebrow, title, CTA pill. */
export declare function FeaturedCard(props: FeaturedCardProps): JSX.Element;
