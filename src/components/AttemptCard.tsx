import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, XCircle, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { ExamAttempt, Question } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Modal } from './ui/modal';
import { cn } from '@/utils/cn';

interface AttemptCardProps {
  attempt: ExamAttempt;
  questions: Question[];
  onRetake: () => void;
  onDelete: () => void;
}

export function AttemptCard({ attempt, questions, onRetake, onDelete }: AttemptCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuestionById = (id: string) => {
    return questions.find((q) => q.id === id);
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'hover:shadow-md transition-shadow',
            !attempt.isComplete && 'border-yellow-500/50 bg-yellow-500/5'
          )}
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      'text-2xl sm:text-3xl font-bold',
                      attempt.score >= 70
                        ? 'text-green-600 dark:text-green-400'
                        : attempt.score >= 50
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {attempt.score}%
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base sm:text-lg">
                        {attempt.results.filter((r) => r.isCorrect).length} / {attempt.totalQuestions} Correct
                      </CardTitle>
                      {!attempt.isComplete && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Incomplete
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="break-words">{formatDate(attempt.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                  className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px] sm:min-h-[32px]"
                >
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetake}
                  title="Retake with same questions"
                  className="flex-1 sm:flex-initial text-xs sm:text-sm min-h-[36px] sm:min-h-[32px]"
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Retake</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive min-h-[36px] sm:min-h-[32px] min-w-[36px] sm:min-w-[32px]"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Attempt Details"
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{attempt.score}%</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{formatDate(attempt.timestamp)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Questions & Answers</h3>
            {attempt.results.map((result, index) => {
              const question = getQuestionById(result.questionId);
              if (!question) return null;

              return (
                <motion.div
                  key={result.questionId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={
                      result.isCorrect
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-red-500/50 bg-red-500/5'
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-base flex-1">
                          {index + 1}. {question.question}
                        </CardTitle>
                        {result.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
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
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Attempt"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this attempt? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

