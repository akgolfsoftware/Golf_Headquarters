import * as React from "react";
export interface AvatarProps { src?: string; name?: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; style?: React.CSSProperties; className?: string; }
export declare function Avatar(props: AvatarProps): JSX.Element;
export interface AvatarGroupProps { avatars?: AvatarProps[]; max?: number; size?: "xs" | "sm" | "md" | "lg" | "xl"; }
export declare function AvatarGroup(props: AvatarGroupProps): JSX.Element;
