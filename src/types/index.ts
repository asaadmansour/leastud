export interface Question {
  id: string;
  question: string;
  answers: string[];
  correct: string;
}

export interface Exam {
  id: string;
  name: string;
  questions: Question[];
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  exams: Exam[];
  createdAt: string;
}

export interface QuizResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ImportData {
  subject: string;
  exam: string;
  questions: {
    question: string;
    answers: string[];
    correct: string;
  }[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  subjectId: string;
  timestamp: string;
  results: QuizResult[];
  score: number;
  totalQuestions: number;
  questionIds: string[]; // Store exact question IDs used in this attempt
  isComplete: boolean; // Whether the attempt was completed or exited early
}

