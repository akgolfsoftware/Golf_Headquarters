import * as React from "react";

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /** Glyph name from the inlined Lucide-geometry set (see ICON_NAMES). */
  name: string;
  /** Pixel size (width = height). Default 20. */
  size?: number;
  /** Stroke width. Brand default 1.5. */
  stroke?: number;
}

/** Lucide-geometry icon at 1.5px stroke — the brand's only icon system. */
export declare function Icon(props: IconProps): JSX.Element;

/** Names available in the inlined glyph set. */
export declare const ICON_NAMES: string[];
