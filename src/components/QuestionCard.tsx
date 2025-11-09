import { motion } from 'framer-motion';
import { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | undefined;
  onAnswerSelect: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
  isDisabled?: boolean;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionNumber,
  totalQuestions,
  isDisabled = false,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
          <p className="text-base sm:text-lg mt-2 break-words">{question.question}</p>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            return (
              <motion.button
                key={index}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                disabled={isDisabled}
                className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all min-h-[56px] sm:min-h-[64px] flex items-center ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 active:bg-accent'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer touch-manipulation'}`}
                onClick={() => !isDisabled && onAnswerSelect(answer)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-white"
                      />
                    )}
                  </div>
                  <span className="text-sm sm:text-base break-words">{answer}</span>
                </div>
              </motion.button>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}


