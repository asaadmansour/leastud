import { ImportData } from '@/types';
import { Question } from '@/types';

/**
 * Parses JSON string into ImportData format
 */
export function parseJSONInput(jsonString: string): ImportData {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate structure
    if (!data.subject || !data.exam || !Array.isArray(data.questions)) {
      throw new Error('Invalid JSON structure. Expected: { subject, exam, questions[] }');
    }

    // Validate each question
    for (const q of data.questions) {
      if (!q.question || !Array.isArray(q.answers) || !q.correct) {
        throw new Error('Each question must have: question, answers[], and correct');
      }
      if (!q.answers.includes(q.correct)) {
        throw new Error(`Correct answer "${q.correct}" must be in answers array`);
      }
    }

    return data as ImportData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

/**
 * Converts ImportData to Question array with IDs
 */
export function importDataToQuestions(data: ImportData): Question[] {
  return data.questions.map((q, index) => ({
    id: `imported-${Date.now()}-${index}`,
    question: q.question,
    answers: q.answers,
    correct: q.correct,
  }));
}

