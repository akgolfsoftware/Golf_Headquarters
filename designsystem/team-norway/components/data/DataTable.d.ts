export interface DataTableColumn {
  key: string;
  label: string;
  /** 'right' gir mono-tall og høyrestilling — bruk for alle måltall. */
  align?: 'left' | 'right';
}
export interface DataTableProps {
  columns: DataTableColumn[];
  rows: Array<Record<string, React.ReactNode>>;
  /** Indeks på raden som markeres med rød kantstripe (typisk 'deg'). */
  highlightRow?: number;
  dense?: boolean;
  /** Vises når rows er tom. Streng gir én overskriftslinje; en node rendres under den. */
  empty?: string | React.ReactNode;
  /** Skjelettrader i tabellens egen rytme. Skjermene skal ikke tegne dette selv. */
  loading?: boolean;
}
export declare function DataTable(props: DataTableProps): JSX.Element;