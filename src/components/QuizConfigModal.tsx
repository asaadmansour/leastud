import { useState } from 'react';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface QuizConfigModalProps {
  isOpen: boolean;
  totalQuestions: number;
  onStart: (questionCount: number) => void;
  onCancel: () => void;
}

export function QuizConfigModal({
  isOpen,
  totalQuestions,
  onStart,
  onCancel,
}: QuizConfigModalProps) {
  const [questionCount, setQuestionCount] = useState(totalQuestions);

  const handleStart = () => {
    const count = Math.min(Math.max(1, questionCount), totalQuestions);
    onStart(count);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Configure Quiz">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Number of Questions
          </label>
          <p className="text-sm text-muted-foreground mb-4">
            Select how many questions you want to answer (out of {totalQuestions} available)
          </p>
          <Input
            type="number"
            min="1"
            max={totalQuestions}
            value={questionCount}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value)) {
                setQuestionCount(Math.min(Math.max(1, value), totalQuestions));
              }
            }}
            className="w-full"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[5, 10, totalQuestions].filter((n) => n <= totalQuestions).map((n) => (
              <Button
                key={n}
                variant={questionCount === n ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuestionCount(n)}
                className="min-h-[40px] sm:min-h-[32px] flex-1 sm:flex-initial touch-manipulation"
              >
                {n === totalQuestions ? 'All' : n}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-1">Time Limit</p>
          <p className="text-sm text-muted-foreground">
            {Math.floor((questionCount * 40) / 60)} minutes{' '}
            {(questionCount * 40) % 60} seconds ({questionCount * 40} seconds total)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            40 seconds per question
          </p>
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
            onClick={handleStart}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] touch-manipulation"
          >
            Start Quiz
          </Button>
        </div>
      </div>
    </Modal>
  );
}

