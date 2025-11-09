import { Subject, Exam, Question, ImportData } from '@/types';
import { importDataToQuestions } from './parser';

// XX: Place your preloaded JSON data here
// Format: Array of { subject, exam, questions[] }
// The data is loaded from the JSON file at build time
import preloadedDataJson from '@/data/preloadedData.json';

const PRELOADED_JSON_DATA = preloadedDataJson as ImportData[];

/**
 * Converts preloaded JSON data to Subject structure
 */
export function loadPreloadedSubjects(): Subject[] {
  const subjectMap = new Map<string, Subject>();

  PRELOADED_JSON_DATA.forEach((data: ImportData) => {
    const subjectName = data.subject;
    const examName = data.exam;
    
    // Generate consistent IDs for preloaded subjects
    const subjectId = `preloaded-subject-${subjectName.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        id: subjectId,
        name: subjectName,
        exams: [],
        createdAt: new Date().toISOString(),
      });
    }

    const subject = subjectMap.get(subjectId)!;
    const examId = `preloaded-exam-${subjectId}-${examName.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Convert questions to Question format with IDs
    const questions: Question[] = importDataToQuestions({
      subject: subjectName,
      exam: examName,
      questions: data.questions,
    });

    const exam: Exam = {
      id: examId,
      name: examName,
      questions,
      createdAt: new Date().toISOString(),
    };

    subject.exams.push(exam);
  });

  return Array.from(subjectMap.values());
}

/**
 * Check if a subject ID is a preloaded subject
 */
export function isPreloadedSubject(subjectId: string): boolean {
  return subjectId.startsWith('preloaded-subject-');
}

/**
 * Check if an exam ID is a preloaded exam
 */
export function isPreloadedExam(examId: string): boolean {
  return examId.startsWith('preloaded-exam-');
}

