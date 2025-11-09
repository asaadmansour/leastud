import { Question } from '@/types';

/**
 * Validates a question object
 */
export function validateQuestion(question: Partial<Question>): string | null {
  if (!question.question || question.question.trim() === '') {
    return 'Question text is required';
  }

  if (!question.answers || question.answers.length < 2) {
    return 'At least 2 answer options are required';
  }

  if (question.answers.some(answer => !answer || answer.trim() === '')) {
    return 'All answer options must be filled';
  }

  if (!question.correct || question.correct.trim() === '') {
    return 'Correct answer must be selected';
  }

  if (!question.answers.includes(question.correct)) {
    return 'Correct answer must be one of the answer options';
  }

  return null;
}

