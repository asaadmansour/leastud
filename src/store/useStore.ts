import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Exam, Question, ExamAttempt, QuizResult } from '@/types';
import { loadPreloadedSubjects, isPreloadedSubject, isPreloadedExam } from '@/utils/preloadedData';

interface StoreState {
  subjects: Subject[];
  previousAttempts: ExamAttempt[];
  // Store user-added questions for preloaded exams separately
  userQuestionsForPreloaded: Record<string, Question[]>; // key: `${subjectId}-${examId}`
  addSubject: (name: string) => void;
  updateSubject: (id: string, name: string) => void;
  deleteSubject: (id: string) => void;
  addExam: (subjectId: string, name: string) => void;
  updateExam: (subjectId: string, examId: string, name: string) => void;
  deleteExam: (subjectId: string, examId: string) => void;
  addQuestion: (subjectId: string, examId: string, question: Question) => void;
  updateQuestion: (subjectId: string, examId: string, questionId: string, question: Question) => void;
  deleteQuestion: (subjectId: string, examId: string, questionId: string) => void;
  getSubject: (id: string) => Subject | undefined;
  getExam: (subjectId: string, examId: string) => Exam | undefined;
  getAllSubjects: () => Subject[]; // Returns merged preloaded + user subjects
  getPopularSubjects: () => Subject[]; // Returns only preloaded subjects
  getUserSubjects: () => Subject[]; // Returns only user-created subjects
  addAttempt: (attempt: ExamAttempt) => void;
  deleteAttempt: (attemptId: string) => void;
  getAttemptsByExam: (examId: string) => ExamAttempt[];
  initializePreloaded: () => void; // Initialize preloaded subjects
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
        subjects: [],
        userQuestionsForPreloaded: {},

        addSubject: (name) =>
        set((state) => ({
          subjects: [
            ...state.subjects,
            {
              id: `subject-${Date.now()}-${Math.random()}`,
              name,
              exams: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateSubject: (id, name) => {
        // Allow updating preloaded subjects (name can be changed)
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, name } : s
          ),
        }));
      },

      deleteSubject: (id) => {
        // Prevent deletion of preloaded subjects (they'll be restored on next init anyway)
        if (isPreloadedSubject(id)) {
          // Just remove from store, but it will be restored on next initialization
          set((state) => ({
            subjects: state.subjects.filter((s) => s.id !== id),
          }));
        } else {
          set((state) => ({
            subjects: state.subjects.filter((s) => s.id !== id),
          }));
        }
      },

      addExam: (subjectId, name) => {
        // If adding to a preloaded subject, ensure it exists in the store
        if (isPreloadedSubject(subjectId)) {
          const existingSubject = get().subjects.find((s) => s.id === subjectId);
          if (!existingSubject) {
            // Add preloaded subject to store if it doesn't exist
            const preloadedSubjects = loadPreloadedSubjects();
            const preloadedSubject = preloadedSubjects.find((s) => s.id === subjectId);
            if (preloadedSubject) {
              set((state) => ({
                subjects: [
                  ...state.subjects,
                  {
                    ...preloadedSubject,
                    exams: [
                      ...preloadedSubject.exams,
                      {
                        id: `exam-${Date.now()}-${Math.random()}`,
                        name,
                        questions: [],
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  },
                ],
              }));
              return;
            }
          }
        }
        
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  exams: [
                    ...s.exams,
                    {
                      id: `exam-${Date.now()}-${Math.random()}`,
                      name,
                      questions: [],
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : s
          ),
        }));
      },

      updateExam: (subjectId, examId, name) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  exams: s.exams.map((e) =>
                    e.id === examId ? { ...e, name } : e
                  ),
                }
              : s
          ),
        })),

      deleteExam: (subjectId, examId) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  exams: s.exams.filter((e) => e.id !== examId),
                }
              : s
          ),
        })),

      addQuestion: (subjectId, examId, question) => {
        if (isPreloadedSubject(subjectId) && isPreloadedExam(examId)) {
          // For preloaded exams, store user questions separately
          const key = `${subjectId}-${examId}`;
          set((state) => ({
            userQuestionsForPreloaded: {
              ...state.userQuestionsForPreloaded,
              [key]: [...(state.userQuestionsForPreloaded[key] || []), question],
            },
            // Also add to the subject for immediate UI update
            subjects: state.subjects.map((s) =>
              s.id === subjectId
                ? {
                    ...s,
                    exams: s.exams.map((e) =>
                      e.id === examId
                        ? {
                            ...e,
                            questions: [...e.questions, question],
                          }
                        : e
                    ),
                  }
                : s
            ),
          }));
        } else {
          // Normal subjects - add directly
          set((state) => ({
            subjects: state.subjects.map((s) =>
              s.id === subjectId
                ? {
                    ...s,
                    exams: s.exams.map((e) =>
                      e.id === examId
                        ? {
                            ...e,
                            questions: [...e.questions, question],
                          }
                        : e
                    ),
                  }
                : s
            ),
          }));
        }
      },

      updateQuestion: (subjectId, examId, questionId, question) => {
        if (isPreloadedSubject(subjectId) && isPreloadedExam(examId)) {
          // For preloaded exams, check if it's a user question or preloaded question
          const key = `${subjectId}-${examId}`;
          const userQuestions = get().userQuestionsForPreloaded[key] || [];
          const isUserQuestion = userQuestions.some((q) => q.id === questionId);
          
          if (isUserQuestion) {
            // Update in user questions
            set((state) => ({
              userQuestionsForPreloaded: {
                ...state.userQuestionsForPreloaded,
                [key]: state.userQuestionsForPreloaded[key]?.map((q) =>
                  q.id === questionId ? question : q
                ) || [],
              },
              // Also update in subjects for immediate UI update
              subjects: state.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      exams: s.exams.map((e) =>
                        e.id === examId
                          ? {
                              ...e,
                              questions: e.questions.map((q) =>
                                q.id === questionId ? question : q
                              ),
                            }
                          : e
                      ),
                    }
                  : s
              ),
            }));
          } else {
            // Update preloaded question (allow editing preloaded questions)
            set((state) => ({
              subjects: state.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      exams: s.exams.map((e) =>
                        e.id === examId
                          ? {
                              ...e,
                              questions: e.questions.map((q) =>
                                q.id === questionId ? question : q
                              ),
                            }
                          : e
                      ),
                    }
                  : s
              ),
            }));
          }
        } else {
          // Normal subjects
          set((state) => ({
            subjects: state.subjects.map((s) =>
              s.id === subjectId
                ? {
                    ...s,
                    exams: s.exams.map((e) =>
                      e.id === examId
                        ? {
                            ...e,
                            questions: e.questions.map((q) =>
                              q.id === questionId ? question : q
                            ),
                          }
                        : e
                    ),
                  }
                : s
            ),
          }));
        }
      },

      deleteQuestion: (subjectId, examId, questionId) => {
        if (isPreloadedSubject(subjectId) && isPreloadedExam(examId)) {
          // For preloaded exams, check if it's a user question
          const key = `${subjectId}-${examId}`;
          const userQuestions = get().userQuestionsForPreloaded[key] || [];
          const isUserQuestion = userQuestions.some((q) => q.id === questionId);
          
          if (isUserQuestion) {
            // Delete from user questions
            set((state) => ({
              userQuestionsForPreloaded: {
                ...state.userQuestionsForPreloaded,
                [key]: state.userQuestionsForPreloaded[key]?.filter(
                  (q) => q.id !== questionId
                ) || [],
              },
              // Also remove from subjects for immediate UI update
              subjects: state.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      exams: s.exams.map((e) =>
                        e.id === examId
                          ? {
                              ...e,
                              questions: e.questions.filter((q) => q.id !== questionId),
                            }
                          : e
                      ),
                    }
                  : s
              ),
            }));
          } else {
            // Allow deletion of preloaded questions (they can be edited/deleted)
            set((state) => ({
              subjects: state.subjects.map((s) =>
                s.id === subjectId
                  ? {
                      ...s,
                      exams: s.exams.map((e) =>
                        e.id === examId
                          ? {
                              ...e,
                              questions: e.questions.filter((q) => q.id !== questionId),
                            }
                          : e
                      ),
                    }
                  : s
              ),
            }));
          }
        } else {
          // Normal subjects
          set((state) => ({
            subjects: state.subjects.map((s) =>
              s.id === subjectId
                ? {
                    ...s,
                    exams: s.exams.map((e) =>
                      e.id === examId
                        ? {
                            ...e,
                            questions: e.questions.filter((q) => q.id !== questionId),
                          }
                        : e
                    ),
                  }
                : s
            ),
          }));
        }
      },

      getSubject: (id) => {
        // Check both user subjects and preloaded subjects
        const userSubject = get().subjects.find((s) => s.id === id);
        if (userSubject) return userSubject;
        
        // Check preloaded subjects
        if (isPreloadedSubject(id)) {
          const preloadedSubjects = loadPreloadedSubjects();
          const preloadedSubject = preloadedSubjects.find((s) => s.id === id);
          if (preloadedSubject) {
            // Merge with any user modifications
            const existing = get().subjects.find((s) => s.id === id);
            if (existing) {
              const mergedExams = preloadedSubject.exams.map((preloadedExam) => {
                const existingExam = existing.exams.find((e) => e.id === preloadedExam.id);
                if (existingExam) {
                  const key = `${preloadedSubject.id}-${preloadedExam.id}`;
                  const userQuestions = get().userQuestionsForPreloaded[key] || [];
                  const preloadedQuestionIds = new Set(preloadedExam.questions.map((q) => q.id));
                  const mergedQuestions = [
                    ...preloadedExam.questions,
                    ...userQuestions.filter((q) => !preloadedQuestionIds.has(q.id)),
                  ];
                  return { ...existingExam, questions: mergedQuestions };
                }
                return preloadedExam;
              });
              return { ...existing, exams: mergedExams };
            }
            return preloadedSubject;
          }
        }
        
        return undefined;
      },

      getExam: (subjectId, examId) => {
        const subject = get().getSubject(subjectId);
        const exam = subject?.exams.find((e) => e.id === examId);
        
        // For preloaded exams, merge user questions
        if (exam && isPreloadedSubject(subjectId) && isPreloadedExam(examId)) {
          const key = `${subjectId}-${examId}`;
          const userQuestions = get().userQuestionsForPreloaded[key] || [];
          const preloadedQuestionIds = new Set(exam.questions.map((q) => q.id));
          const mergedQuestions = [
            ...exam.questions,
            ...userQuestions.filter((q) => !preloadedQuestionIds.has(q.id)),
          ];
          return { ...exam, questions: mergedQuestions };
        }
        
        return exam;
      },

      getAllSubjects: () => {
        const state = get();
        const preloadedSubjects = loadPreloadedSubjects();
        const userSubjects = state.subjects.filter((s) => !isPreloadedSubject(s.id));
        
        // Merge preloaded subjects with user subjects
        const merged = [...preloadedSubjects];
        
        preloadedSubjects.forEach((preloadedSubject) => {
          const existing = state.subjects.find((s) => s.id === preloadedSubject.id);
          if (existing) {
            // Merge exams and questions
            const mergedExams = preloadedSubject.exams.map((preloadedExam) => {
              const existingExam = existing.exams.find((e) => e.id === preloadedExam.id);
              if (existingExam) {
                const key = `${preloadedSubject.id}-${preloadedExam.id}`;
                const userQuestions = state.userQuestionsForPreloaded[key] || [];
                const preloadedQuestionIds = new Set(preloadedExam.questions.map((q) => q.id));
                const mergedQuestions = [
                  ...preloadedExam.questions,
                  ...userQuestions.filter((q) => !preloadedQuestionIds.has(q.id)),
                ];
                return { ...existingExam, questions: mergedQuestions };
              }
              return preloadedExam;
            });
            
            const index = merged.findIndex((s) => s.id === preloadedSubject.id);
            if (index !== -1) {
              merged[index] = { ...existing, exams: mergedExams };
            }
          }
        });
        
        return [...merged, ...userSubjects];
      },

      getPopularSubjects: () => {
        const state = get();
        const preloadedSubjects = loadPreloadedSubjects();
        
        // Merge with any user modifications
        return preloadedSubjects.map((preloadedSubject) => {
          const existing = state.subjects.find((s) => s.id === preloadedSubject.id);
          if (existing) {
            const mergedExams = preloadedSubject.exams.map((preloadedExam) => {
              const existingExam = existing.exams.find((e) => e.id === preloadedExam.id);
              if (existingExam) {
                const key = `${preloadedSubject.id}-${preloadedExam.id}`;
                const userQuestions = state.userQuestionsForPreloaded[key] || [];
                const preloadedQuestionIds = new Set(preloadedExam.questions.map((q) => q.id));
                const mergedQuestions = [
                  ...preloadedExam.questions,
                  ...userQuestions.filter((q) => !preloadedQuestionIds.has(q.id)),
                ];
                return { ...existingExam, questions: mergedQuestions };
              }
              return preloadedExam;
            });
            return { ...existing, exams: mergedExams };
          }
          return preloadedSubject;
        });
      },

      getUserSubjects: () => {
        return get().subjects.filter((s) => !isPreloadedSubject(s.id));
      },

      initializePreloaded: () => {
        const preloadedSubjects = loadPreloadedSubjects();
        const currentSubjects = get().subjects;
        
        // Merge preloaded subjects with existing subjects
        // If preloaded subject doesn't exist, add it
        // If it exists, merge exams and questions
        const mergedSubjects = [...currentSubjects];
        
        preloadedSubjects.forEach((preloadedSubject) => {
          const existingIndex = mergedSubjects.findIndex((s) => s.id === preloadedSubject.id);
          
          if (existingIndex === -1) {
            // Add new preloaded subject
            mergedSubjects.push(preloadedSubject);
          } else {
            // Merge exams
            const existingSubject = mergedSubjects[existingIndex];
            preloadedSubject.exams.forEach((preloadedExam) => {
              const existingExamIndex = existingSubject.exams.findIndex(
                (e) => e.id === preloadedExam.id
              );
              
              if (existingExamIndex === -1) {
                // Add new preloaded exam
                existingSubject.exams.push(preloadedExam);
              } else {
                // Merge questions - keep preloaded questions, append user questions
                const existingExam = existingSubject.exams[existingExamIndex];
                const userQuestionsKey = `${preloadedSubject.id}-${preloadedExam.id}`;
                const userQuestions = get().userQuestionsForPreloaded[userQuestionsKey] || [];
                
                // Merge: preloaded questions first, then user questions
                const preloadedQuestionIds = new Set(preloadedExam.questions.map((q) => q.id));
                const mergedQuestions = [
                  ...preloadedExam.questions,
                  ...userQuestions.filter((q) => !preloadedQuestionIds.has(q.id)),
                ];
                
                existingExam.questions = mergedQuestions;
              }
            });
          }
        });
        
        set({ subjects: mergedSubjects });
      },

      previousAttempts: [],

      addAttempt: (attempt) =>
        set((state) => ({
          previousAttempts: [...state.previousAttempts, attempt],
        })),

      deleteAttempt: (attemptId) =>
        set((state) => ({
          previousAttempts: state.previousAttempts.filter((a) => a.id !== attemptId),
        })),

      getAttemptsByExam: (examId) => {
        return get().previousAttempts
          .filter((a) => a.examId === examId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
    }),
    {
      name: 'leastud-storage',
      onRehydrateStorage: () => (state) => {
        // Initialize preloaded subjects after rehydration
        if (state) {
          state.initializePreloaded();
        } else {
          // Also initialize on first load (when state is null)
          setTimeout(() => {
            useStore.getState().initializePreloaded();
          }, 0);
        }
      },
    }
  )
);

// Initialize preloaded subjects will be called via onRehydrateStorage

