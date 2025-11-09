import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Question } from '@/types';
import { validateQuestion } from '@/utils/validation';
import { parseJSONInput, importDataToQuestions } from '@/utils/parser';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '@/store/useStore';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  examId: string;
  question?: Question;
  onSave: () => void;
}

export function QuestionFormModal({
  isOpen,
  onClose,
  subjectId,
  examId,
  question,
  onSave,
}: QuestionFormModalProps) {
  const { addQuestion, updateQuestion } = useStore();
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    if (question) {
      setQuestionText(question.question);
      setAnswers([...question.answers]);
      setCorrectAnswer(question.correct);
    } else {
      resetForm();
    }
  }, [question, isOpen]);

  const resetForm = () => {
    setQuestionText('');
    setAnswers(['', '']);
    setCorrectAnswer('');
    setError(null);
    setShowJsonInput(false);
    setJsonInput('');
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, '']);
  };

  const handleRemoveAnswer = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    if (correctAnswer === answers[index]) {
      setCorrectAnswer('');
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleImportJSON = () => {
    try {
      const data = parseJSONInput(jsonInput);
      const importedQuestions = importDataToQuestions(data);
      
      if (importedQuestions.length === 0) {
        setError('No valid questions found in JSON');
        return;
      }

      // Import all questions
      importedQuestions.forEach((q) => {
        addQuestion(subjectId, examId, q);
      });

      setShowJsonInput(false);
      setJsonInput('');
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON');
    }
  };

  const handleSave = () => {
    const questionData: Question = {
      id: question?.id || `question-${Date.now()}-${Math.random()}`,
      question: questionText,
      answers: answers.filter((a) => a.trim() !== ''),
      correct: correctAnswer,
    };

    const validationError = validateQuestion(questionData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    if (question) {
      updateQuestion(subjectId, examId, question.id, questionData);
    } else {
      addQuestion(subjectId, examId, questionData);
    }

    resetForm();
    onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={question ? 'Edit Question' : 'Add Question'}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm">
            {error}
          </div>
        )}

        {!showJsonInput ? (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Question</label>
              <Input
                placeholder="Enter your question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Answers</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJsonInput(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON
                </Button>
              </div>
              <div className="space-y-2">
                {answers.map((answer, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Answer ${index + 1}`}
                      value={answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAnswer(index)}
                      disabled={answers.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAnswer}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Answer
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Correct Answer</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="">Select correct answer</option>
                {answers
                  .filter((a) => a.trim() !== '')
                  .map((answer, index) => (
                    <option key={index} value={answer}>
                      {answer}
                    </option>
                  ))}
              </select>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Import JSON</label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowJsonInput(false);
                  setJsonInput('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <textarea
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`{\n  "subject": "Math",\n  "exam": "Algebra Basics",\n  "questions": [\n    {\n      "question": "What is 2 + 2?",\n      "answers": ["3", "4", "5"],\n      "correct": "4"\n    }\n  ]\n}`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <Button onClick={handleImportJSON} className="w-full">
              Import Questions
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] touch-manipulation"
          >
            Cancel
          </Button>
          {!showJsonInput && (
            <Button 
              onClick={handleSave}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] touch-manipulation"
            >
              {question ? 'Update' : 'Add'} Question
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

