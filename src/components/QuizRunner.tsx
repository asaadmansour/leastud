import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Question, QuizResult } from '@/types';
import { shuffle } from '@/utils/shuffle';
import { Button } from './ui/button';
import { QuizConfigModal } from './QuizConfigModal';
import { QuizTimer } from './QuizTimer';
import { QuizProgress } from './QuizProgress';
import { QuestionCard } from './QuestionCard';
import { ExitConfirmationModal } from './ExitConfirmationModal';

interface QuizRunnerProps {
  questions: Question[];
  examName: string;
  onComplete: (results: QuizResult[], questionIds: string[], isComplete: boolean) => void;
  onCancel: () => void;
  retakeQuestionIds?: string[]; // For retake: exact question IDs to use
  retakeMode?: boolean; // Skip config modal if true
}

export function QuizRunner({
  questions,
  examName,
  onComplete,
  onCancel,
  retakeQuestionIds,
  retakeMode = false,
}: QuizRunnerProps) {
  const [showConfig, setShowConfig] = useState(!retakeMode);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const retakeInitialized = useRef(false);

  const currentQuestion = shuffledQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allQuestionsAnswered = answeredCount === shuffledQuestions.length;

  // Initialize questions for retake mode - only run once when retake mode is enabled
  useEffect(() => {
    if (retakeMode && retakeQuestionIds && retakeQuestionIds.length > 0 && !retakeInitialized.current) {
      // Use exact questions from previous attempt in same order
      const retakeQuestions = retakeQuestionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is Question => q !== undefined);

      if (retakeQuestions.length > 0) {
        setShuffledQuestions(retakeQuestions);
        setTotalTime(retakeQuestions.length * 40);
        setShowConfig(false);
        retakeInitialized.current = true;
      }
    }
    
    // Reset initialization flag when retake mode is disabled
    if (!retakeMode) {
      retakeInitialized.current = false;
    }
  }, [retakeMode, retakeQuestionIds, questions]);

  const handleConfigStart = (questionCount: number) => {
    // Randomly select questions
    const selected = shuffle(questions).slice(0, questionCount);
    setShuffledQuestions(selected);
    setTotalTime(questionCount * 40);
    setShowConfig(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isTimeUp || isComplete) return;
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTimeUp = () => {
    setIsTimeUp(true);
    // Auto-submit after a brief moment
    setTimeout(() => {
      handleSubmit(true);
    }, 1000);
  };

  const handleSubmit = (completed: boolean = true) => {
    // Prevent multiple submissions
    if (isComplete) return;

    const results: QuizResult[] = shuffledQuestions.map((q) => {
      const userAnswer = answers[q.id] || '';
      const isCorrect = userAnswer === q.correct;
      return {
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correct,
        isCorrect,
      };
    });

    setIsComplete(true);
    const questionIds = shuffledQuestions.map((q) => q.id);
    
    // Call onComplete immediately - parent will handle showing results
    onComplete(results, questionIds, completed);
  };

  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleExitConfirm = () => {
    // Calculate partial score and save incomplete attempt
    handleSubmit(false);
  };

  // Handle tab visibility for pause/resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No questions available</p>
      </div>
    );
  }

  if (showConfig) {
    return (
      <QuizConfigModal
        isOpen={showConfig}
        totalQuestions={questions.length}
        onStart={handleConfigStart}
        onCancel={onCancel}
      />
    );
  }

  if (isComplete) {
    return null; // Results will be shown by parent
  }

  if (shuffledQuestions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold break-words">{examName}</h2>
            {retakeMode && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Retaking with same questions
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <QuizTimer
              totalSeconds={totalTime}
              onTimeUp={handleTimeUp}
              isPaused={isPaused}
            />
            <Button variant="outline" onClick={handleExitClick} className="flex-1 sm:flex-initial text-sm sm:text-base">
              Exit Quiz
            </Button>
          </div>
        </div>

        {/* Time's Up Alert */}
        {isTimeUp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Time's up! Quiz will be submitted automatically.</span>
          </motion.div>
        )}

        {/* Progress Bar */}
        <QuizProgress answered={answeredCount} total={shuffledQuestions.length} />

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswerSelect={handleAnswerSelect}
            questionNumber={currentIndex + 1}
            totalQuestions={shuffledQuestions.length}
            isDisabled={isTimeUp}
          />
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              handlePrevious();
            }}
            disabled={currentIndex === 0 || isTimeUp}
            type="button"
            className="flex-1 sm:flex-initial min-h-[44px] text-sm sm:text-base"
          >
            Previous
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            disabled={isTimeUp}
            type="button"
            className="flex-1 sm:flex-initial min-h-[44px] text-sm sm:text-base"
          >
            {currentIndex === shuffledQuestions.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </div>

        {/* Auto-submit when all answered */}
        {allQuestionsAnswered && !isTimeUp && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">
              All questions answered! Click Submit to finish.
            </p>
          </motion.div>
        )}
      </div>

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={showExitConfirm}
        onConfirm={handleExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
      />
    </>
  );
}
