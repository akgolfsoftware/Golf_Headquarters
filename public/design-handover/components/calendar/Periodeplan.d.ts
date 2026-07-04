import * as React from "react";
export type LFase = "Base" | "Forberedelse" | "Spesialisering" | "Taper" | "Peak";
export interface Phase { label: LFase; startWeek: number; durationWeeks: number; }
export interface Tournament { name?: string; week: number; prio: "A" | "B" | "C"; }
export interface PeriodeplanProps { phases?: Phase[]; tournaments?: Tournament[]; totalWeeks?: number; months?: string[]; className?: string; style?: React.CSSProperties; }
export declare function Periodeplan(props: PeriodeplanProps): JSX.Element;
