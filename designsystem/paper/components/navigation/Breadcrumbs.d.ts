export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface BreadcrumbsProps {
  /** Siste ledd rendres som aktiv side i --fg */
  items?: BreadcrumbItem[];
  dataOdId?: string;
}
