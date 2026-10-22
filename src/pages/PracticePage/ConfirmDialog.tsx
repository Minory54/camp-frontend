import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "../../components/Button";

type Props = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ title, children, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="practice-dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id={`${id}-title`}>{title}</h2>
      <div id={`${id}-description`}>{children}</div>
      <div className="practice-dialog__actions">
        <Button onClick={onCancel} small>
          Отмена
        </Button>
        <Button onClick={onConfirm} color="blue" small>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
