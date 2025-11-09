import { AlertTriangle } from 'lucide-react';
import { Modal } from './ui/modal';
import { Button } from './ui/button';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: ExitConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Exit Quiz">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to exit? Your current score will be saved as an incomplete attempt.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] touch-manipulation"
          >
            Exit Quiz
          </Button>
        </div>
      </div>
    </Modal>
  );
}


