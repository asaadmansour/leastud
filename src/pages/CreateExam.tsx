import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Question } from '@/types';
import { QuestionFormModal } from '@/components/QuestionFormModal';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CreateExam() {
  const { subjectId, examId } = useParams<{ subjectId: string; examId: string }>();
  const navigate = useNavigate();
  const { getSubject, getExam, deleteQuestion } = useStore();
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const subject = subjectId ? getSubject(subjectId) : undefined;
  const exam = subjectId && examId ? getExam(subjectId, examId) : undefined;

  useEffect(() => {
    if (!subject || !exam) {
      navigate('/');
    }
  }, [subject, exam, navigate]);

  if (!subject || !exam) {
    return null;
  }

  const handleAddQuestion = () => {
    setEditingQuestion(undefined);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Delete this question?')) {
      if (subjectId && examId) {
        deleteQuestion(subjectId, examId, questionId);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <BackButton to={`/?subject=${subjectId}`} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{exam.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {subject.name} • {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">Questions</h2>
        <Button onClick={handleAddQuestion} className="w-full sm:w-auto text-sm sm:text-base">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {exam.questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg mb-2 break-words">
                      {index + 1}. {question.question}
                    </CardTitle>
                    <div className="space-y-1">
                      {question.answers.map((answer, ansIndex) => (
                        <div
                          key={ansIndex}
                          className={`text-sm p-2 rounded ${
                            answer === question.correct
                              ? 'bg-green-500/10 text-green-700 dark:text-green-400 font-medium'
                              : 'bg-muted'
                          }`}
                        >
                          {answer === question.correct && '✓ '}
                          {answer}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditQuestion(question)}
                      className="min-h-[40px] sm:min-h-[36px] min-w-[40px] sm:min-w-[36px] touch-manipulation"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive min-h-[40px] sm:min-h-[36px] min-w-[40px] sm:min-w-[36px] touch-manipulation"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {exam.questions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No questions yet. Add your first question to get started!</p>
          <Button onClick={handleAddQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      )}

      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(undefined);
        }}
        subjectId={subjectId!}
        examId={examId!}
        question={editingQuestion}
        onSave={() => {
          // Force re-render by updating state
        }}
      />
    </div>
  );
}

