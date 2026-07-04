import * as React from "react";
export interface BottomNavItem { icon: string; label: string; active?: boolean; badge?: boolean; href?: string; }
export interface BottomNavProps { items?: BottomNavItem[]; onSelect?: (item: BottomNavItem) => void; className?: string; style?: React.CSSProperties; }
export declare function BottomNav(props: BottomNavProps): JSX.Element;
