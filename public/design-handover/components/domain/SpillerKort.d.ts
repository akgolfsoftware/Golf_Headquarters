import * as React from "react";
export interface SpillerKortProps { name: string; hcp?: string | number; kategori?: string; tier?: string; sg?: string | number; sgDelta?: string; runder?: number; adherence?: number; avatarSrc?: string; onClick?: () => void; className?: string; style?: React.CSSProperties; }
export declare function SpillerKort(props: SpillerKortProps): JSX.Element;
