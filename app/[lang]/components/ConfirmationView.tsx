import Button from '@/components/Button';

interface ConfirmationViewProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
}

export default function ConfirmationView({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
}: ConfirmationViewProps) {
  return (
    <>
      <h2 className="text-lg md:text-xl font-semibold text-white drop-shadow-lg">{title}</h2>
      <p className="text-sm md:text-base text-zinc-300 text-center drop-shadow-lg">{message}</p>
      <div className="flex gap-2 md:gap-3">
        <Button variant="secondary" onClick={onCancel} className="px-4 md:px-6 text-sm">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} className="px-4 md:px-6 text-sm">
          {confirmLabel}
        </Button>
      </div>
    </>
  );
}
