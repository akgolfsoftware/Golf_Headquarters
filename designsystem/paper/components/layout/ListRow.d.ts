/**
 * Plattformens mest gjenbrukte rad (~30 skjermer). Rendres som <li> og
 * MÅ ligge i en ListGroup — skillelinjene eies av gruppen, aldri av raden.
 *
 * Erstatter StatusCircleRow (nå leading="status") og den håndrullede
 * stall-raden. 36px-rutenettet holder på tvers av alle leading-varianter.
 *
 * Bindende: raden er interaktiv ELLER halen er det, aldri begge.
 */
export interface ListRowBadge {
  text?: string;
  kind?: "status" | "tag";
  tone?: "up" | "warn" | "info" | "mut" | "ny";
  dot?: boolean;
}
export interface ListRowProps {
  title: string;
  /** Undertekst: kontekst, tidspunkt, avviksforklaring */
  meta?: React.ReactNode;
  /** Merke rett etter tittelen — kategori (kind="tag") eller tilstand */
  titleBadge?: ListRowBadge;
  /** Lukket union — ingen vilkårlige noder */
  leading?: "avatar" | "status" | "icon" | "none";
  /** leading="avatar": sendes videre til Avatar (name, initials, src, size, tone) */
  avatar?: { name?: string; initials?: string; src?: string; size?: "sm" | "md" | "lg"; tone?: "soft" | "ink" | "outline" };
  /** leading="status": statussirkelen fra StatusCircleRow */
  status?: "done" | "active" | "todo";
  /** leading="icon": ett <Icon /> */
  icon?: React.ReactNode;
  /** Lukket union — ingen vilkårlige noder */
  trailing?: "chevron" | "value" | "badge" | "toggle" | "action" | "none";
  /** trailing="value": mono, tabular-nums */
  value?: string | number;
  /** trailing="badge" */
  badge?: ListRowBadge;
  /** trailing="toggle" — gjør raden ikke-interaktiv */
  toggleChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  /** trailing="action" — én ghost-knapp, gjør raden ikke-interaktiv */
  actionLabel?: string;
  onAction?: () => void;
  /** Gjør HELE raden til <a>. Ulovlig sammen med trailing toggle/action. */
  href?: string;
  /** Gjør HELE raden til <button>. Ulovlig sammen med trailing toggle/action. */
  onClick?: () => void;
  /** data-od-id. Interaktiv rad får automatisk cta--prefiks. */
  dataOdId?: string;
  /** Må matche ListGroups `as`. "div" gir role="listitem" i stedet for <li>. */
  as?: "li" | "div";
}
