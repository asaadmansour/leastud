import { motion } from 'framer-motion';
import { Progress } from './ui/progress';

interface QuizProgressProps {
  answered: number;
  total: number;
}

export function QuizProgress({ answered, total }: QuizProgressProps) {
  const progress = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span className="break-words">
          {answered} of {total} questions answered
        </span>
        <motion.span
          key={progress}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
      <Progress value={progress} />
    </div>
  );
}


