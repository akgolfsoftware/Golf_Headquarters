"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * @deprecated Bruk `Dialog`-komponentene fra `@/components/ui` direkte
 * for ny kode. `Modal` er beholdt som thin wrapper rundt `Dialog` for de
 * 7 eksisterende call-sitene — adferden er identisk.
 *
 * Migrering til ny composable API:
 *
 *   // Før
 *   <Modal open={open} onClose={close} title="Ny plan" size="md" footer={<Buttons />}>
 *     <Content />
 *   </Modal>
 *
 *   // Etter
 *   <Dialog open={open} onOpenChange={(o) => !o && close()}>
 *     <DialogContent size="md">
 *       <DialogHeader>
 *         <DialogTitle>Ny plan</DialogTitle>
 *       </DialogHeader>
 *       <DialogBody><Content /></DialogBody>
 *       <DialogFooter><Buttons /></DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 */

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size={size} className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <DialogBody>{children}</DialogBody>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
