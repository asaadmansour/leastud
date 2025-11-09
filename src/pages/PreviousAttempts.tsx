import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AttemptCard } from '@/components/AttemptCard';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';

export function PreviousAttempts() {
  const { subjectId, examId } = useParams<{ subjectId: string; examId: string }>();
  const navigate = useNavigate();
  const { getSubject, getExam, getAttemptsByExam, deleteAttempt } = useStore();

  const subject = subjectId ? getSubject(subjectId) : undefined;
  const exam = subjectId && examId ? getExam(subjectId, examId) : undefined;
  const attempts = examId ? getAttemptsByExam(examId) : [];

  const handleRetake = (attemptId?: string) => {
    if (subjectId && examId) {
      if (attemptId) {
        navigate(`/take-exam/${subjectId}/${examId}?retake=${attemptId}`);
      } else {
        navigate(`/take-exam/${subjectId}/${examId}`);
      }
    }
  };

  const handleDelete = (attemptId: string) => {
    deleteAttempt(attemptId);
  };

  if (!subject || !exam) {
    return (
      <div className="space-y-4">
        <BackButton />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Exam not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <BackButton to={`/?subject=${subjectId}`} />
          <div className="mt-3 sm:mt-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{exam.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {subject.name} • Previous Attempts
            </p>
          </div>
        </div>
        <Button onClick={() => handleRetake()} className="w-full sm:w-auto text-sm sm:text-base">
          <History className="h-4 w-4 mr-2" />
          New Attempt
        </Button>
      </div>

      {/* Attempts List */}
      {attempts.length > 0 ? (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <AttemptCard
              key={attempt.id}
              attempt={attempt}
              questions={exam.questions}
              onRetake={() => handleRetake(attempt.id)}
              onDelete={() => handleDelete(attempt.id)}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium mb-2">No previous attempts</p>
          <p className="text-muted-foreground mb-6">
            Take the exam to see your attempts here
          </p>
          <Button onClick={() => handleRetake()}>
            Take Exam
          </Button>
        </motion.div>
      )}
    </div>
  );
}

