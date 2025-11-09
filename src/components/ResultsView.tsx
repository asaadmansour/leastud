import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RotateCcw, AlertCircle, History } from 'lucide-react';
import { Question, QuizResult } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useNavigate, useParams } from 'react-router-dom';

interface ResultsViewProps {
  questions: Question[];
  results: QuizResult[];
  examName: string;
  onRetake: () => void;
  onFinish: () => void;
  isComplete?: boolean;
}

export function ResultsView({
  questions,
  results,
  examName,
  onRetake,
  onFinish,
  isComplete = true,
}: ResultsViewProps) {
  const navigate = useNavigate();
  const { subjectId, examId } = useParams<{ subjectId: string; examId: string }>();
  const answeredResults = results.filter((r) => r.userAnswer !== '');
  const correctCount = answeredResults.filter((r) => r.isCorrect).length;
  const totalAnswered = answeredResults.length;
  const totalQuestions = results.length;
  // Score should be based on total questions, not just answered questions
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const getQuestionById = (id: string) => {
    return questions.find((q) => q.id === id);
  };

  const handleViewPreviousAttempts = () => {
    if (subjectId && examId) {
      navigate(`/previous-attempts/${subjectId}/${examId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words px-2">{examName}</h2>
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-700 dark:text-yellow-400 p-2 sm:p-3 rounded-lg flex items-center justify-center gap-2 max-w-md mx-auto text-sm sm:text-base"
          >
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-medium">Incomplete Attempt</span>
          </motion.div>
        )}
        <div className="inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold"
          >
            {score}%
          </motion.div>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
          You got {correctCount} out of {totalQuestions} questions correct
          {!isComplete && ` (${totalQuestions - totalAnswered} unanswered)`}
        </p>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => {
          const question = getQuestionById(result.questionId);
          if (!question) return null;

          return (
            <motion.div
              key={result.questionId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={result.isCorrect ? 'border-green-500/50' : 'border-red-500/50'}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base sm:text-lg flex-1 break-words">{question.question}</CardTitle>
                    {result.isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Your answer:
                    </p>
                    <p
                      className={`p-2 rounded ${
                        result.isCorrect
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'bg-red-500/10 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {result.userAnswer || 'No answer provided'}
                    </p>
                  </div>
                  {!result.isCorrect && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Correct answer:
                      </p>
                      <p className="p-2 rounded bg-green-500/10 text-green-700 dark:text-green-400">
                        {result.correctAnswer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            onRetake();
          }}
          type="button"
          className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake Exam
        </Button>
        {subjectId && examId && (
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              handleViewPreviousAttempts();
            }}
            type="button"
            className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
          >
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View Previous Attempts</span>
            <span className="sm:hidden">Previous Attempts</span>
          </Button>
        )}
        <Button
          onClick={(e) => {
            e.preventDefault();
            onFinish();
          }}
          type="button"
          className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
        >
          Finish
        </Button>
      </div>
    </motion.div>
  );
}

