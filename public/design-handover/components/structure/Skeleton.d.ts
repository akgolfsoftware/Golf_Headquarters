import * as React from "react";
export type SkeletonVariant = "text" | "title" | "circle" | "card";
export interface SkeletonProps { variant?: SkeletonVariant; width?: number | string; height?: number | string; style?: React.CSSProperties; className?: string; }
export declare function Skeleton(props: SkeletonProps): JSX.Element;
export interface SkeletonRowProps { lines?: number; style?: React.CSSProperties; }
export declare function SkeletonRow(props: SkeletonRowProps): JSX.Element;
