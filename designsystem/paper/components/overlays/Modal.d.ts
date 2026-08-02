export interface ModalProps {
  open?: boolean;
  title?: string;
  /** Knapperad, typisk <Button variant="ghost"> + <Button> */
  actions?: React.ReactNode;
  /** Kalles ved klikk på scrim */
  onClose?: () => void;
  dataOdId?: string;
  children?: React.ReactNode;
}
