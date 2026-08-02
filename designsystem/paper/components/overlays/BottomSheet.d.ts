export interface BottomSheetProps {
  open?: boolean;
  title?: string;
  onClose?: () => void;
  dataOdId?: string;
  children?: React.ReactNode;
}
