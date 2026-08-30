export interface SectionHeaderProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Løpenummer, vises rødt som (01). */
  index?: string;
  action?: React.ReactNode;
  onDark?: boolean;
}
export declare function SectionHeader(props: SectionHeaderProps): JSX.Element;