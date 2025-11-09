import { motion } from 'framer-motion';
import { Plus, FileText, Trash2, Edit2, Play, History } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface ExamListProps {
  subjectId: string;
  onSelectExam: (examId: string) => void;
  onTakeExam: (examId: string) => void;
  selectedExamId?: string;
}

export function ExamList({ subjectId, onSelectExam, onTakeExam, selectedExamId }: ExamListProps) {
  const { getSubject, addExam, deleteExam, updateExam, getAttemptsByExam } = useStore();
  const navigate = useNavigate();
  const subject = getSubject(subjectId);
  const [isAdding, setIsAdding] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!subject) return null;

  const handleAdd = () => {
    if (newExamName.trim()) {
      addExam(subjectId, newExamName.trim());
      setNewExamName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateExam(subjectId, id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold break-words">Exams for {subject.name}</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Exam
          </Button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <Input
            placeholder="Exam name"
            value={newExamName}
            onChange={(e) => setNewExamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            autoFocus
          />
          <Button onClick={handleAdd}>Add</Button>
          <Button variant="outline" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </motion.div>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {subject.exams.map((exam) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`transition-all ${
                selectedExamId === exam.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  {editingId === exam.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(exam.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(exam.id)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="flex items-center gap-2 break-words">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="break-words">{exam.name}</span>
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                          onClick={() => navigate(`/previous-attempts/${subjectId}/${exam.id}`)}
                          title="View Previous Attempts"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                          onClick={() => handleEdit(exam.id, exam.name)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-8 sm:w-8 text-destructive touch-manipulation"
                          onClick={() => {
                            if (confirm(`Delete "${exam.name}"?`)) {
                              deleteExam(subjectId, exam.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}
                  </p>
                  {getAttemptsByExam(exam.id).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {getAttemptsByExam(exam.id).length} attempt{getAttemptsByExam(exam.id).length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-h-[40px] sm:min-h-[32px] text-xs sm:text-sm touch-manipulation"
                    onClick={() => onSelectExam(exam.id)}
                  >
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 min-h-[40px] sm:min-h-[32px] text-xs sm:text-sm touch-manipulation"
                    onClick={() => onTakeExam(exam.id)}
                    disabled={exam.questions.length === 0}
                  >
                    <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Take Exam</span>
                    <span className="sm:hidden">Take</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {subject.exams.length === 0 && !isAdding && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No exams yet. Create your first exam to get started!</p>
        </div>
      )}
    </div>
  );
}

