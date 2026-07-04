import * as React from "react";
export interface NavItem { icon: string; label: string; active?: boolean; badge?: number; href?: string; }
export interface NavRailProps { items?: NavItem[]; bottomItems?: NavItem[]; logo?: React.ReactNode; wordmark?: string; expanded?: boolean; onSelect?: (item: NavItem) => void; className?: string; style?: React.CSSProperties; }
export declare function NavRail(props: NavRailProps): JSX.Element;
