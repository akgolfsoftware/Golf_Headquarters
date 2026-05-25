/**
 * Stats Icon — minimal stroked SVG (Lucide-inspired, original paths from design bundle)
 * Server component — no state, pure SVG output.
 */

export type StatsIconName =
  | "Flag"
  | "Trophy"
  | "Target"
  | "Zap"
  | "Sparkles"
  | "LineChart"
  | "Gauge"
  | "Crosshair"
  | "Users"
  | "MapPin"
  | "ArrowRight"
  | "ArrowDown"
  | "ChevronRight"
  | "ChevronLeft"
  | "ExternalLink"
  | "Circle"
  | "Dot"
  | "Wrench"
  | "Activity"
  | "Search"
  | "Menu"
  | "Sun"
  | "Play";

interface StatsIconProps {
  name: StatsIconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function StatsIcon({
  name,
  size = 20,
  stroke = 1.5,
  className = "",
  style,
}: StatsIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
  };

  switch (name) {
    case "Flag":
      return (
        <svg {...common}>
          <path d="M4 21V4" />
          <path d="M4 4h13l-2 4 2 4H4" />
        </svg>
      );
    case "Trophy":
      return (
        <svg {...common}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
          <path d="M8 6H5a3 3 0 0 0 3 3" />
          <path d="M16 6h3a3 3 0 0 1-3 3" />
          <path d="M10 17h4" />
          <path d="M12 13v4" />
          <path d="M9 21h6" />
        </svg>
      );
    case "Target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        </svg>
      );
    case "Zap":
      return (
        <svg {...common}>
          <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
        </svg>
      );
    case "Sparkles":
      return (
        <svg {...common}>
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      );
    case "LineChart":
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="m7 15 4-6 4 3 5-7" />
        </svg>
      );
    case "Gauge":
      return (
        <svg {...common}>
          <path d="M12 13 18 7" />
          <circle cx="12" cy="13" r="9" />
          <path d="M3 13a9 9 0 0 1 18 0" />
        </svg>
      );
    case "Crosshair":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "Users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <path d="M16 4a3.5 3.5 0 0 1 0 7" />
          <path d="M21 20c0-2.6-1.7-4.9-4-5.7" />
        </svg>
      );
    case "MapPin":
      return (
        <svg {...common}>
          <path d="M12 22s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "ArrowRight":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      );
    case "ArrowDown":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 13l7 7 7-7" />
        </svg>
      );
    case "ChevronRight":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "ChevronLeft":
      return (
        <svg {...common}>
          <path d="m15 6-6 6 6 6" />
        </svg>
      );
    case "ExternalLink":
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="M20 4 10 14" />
          <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case "Circle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "Dot":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
      );
    case "Wrench":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 1 5.4 5.4l-1.4-1.4-2.1 2.1-2-2 2.1-2.1-2-2Z" />
          <path d="m13 9-8 8a2.1 2.1 0 0 0 3 3l8-8" />
        </svg>
      );
    case "Activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>
      );
    case "Search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "Menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "Sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9 6.3 6.3M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1 6.3 17.7M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "Play":
      return (
        <svg {...common}>
          <path d="M6 4v16l14-8Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
