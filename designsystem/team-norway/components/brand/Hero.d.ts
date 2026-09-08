export interface HeroMeta {
  label: string;
  value: string;
  /** Kildelinje for dette tallet. Format: «Målt dd.mm.åååå · protokoll vN · initialer». */
  source?: string;
}
export interface HeroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  /** Nøkkeltall i bunnen av heroen. */
  meta?: HeroMeta[];
  height?: number;
  align?: 'left' | 'center';
  /** Bildeadresse for profilsirkelen. Faller tilbake på avatarInitials når den mangler. */
  avatar?: string;
  /** Initialer i profilsirkelen når det ikke finnes bilde. */
  avatarInitials?: string;
  /** Diameter på profilsirkelen i px. Standard 96. */
  avatarSize?: number;
}
export declare function Hero(props: HeroProps): JSX.Element;