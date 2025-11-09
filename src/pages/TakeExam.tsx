import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { QuizResult } from '@/types';
import { QuizRunner } from '@/components/QuizRunner';
import { ResultsView } from '@/components/ResultsView';

export function TakeExam() {
  const { subjectId, examId } = useParams<{ subjectId: string; examId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getSubject, getExam, addAttempt, previousAttempts } = useStore();
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);
  const [retakeQuestionIds, setRetakeQuestionIds] = useState<string[] | undefined>();
  const retakeProcessed = useRef<string | null>(null);

  const subject = subjectId ? getSubject(subjectId) : undefined;
  // Always get fresh exam to ensure questions are loaded (important for preloaded exams)
  const exam = subjectId && examId ? getExam(subjectId, examId) : undefined;

  // Check if this is a retake from a previous attempt - only run when searchParams change
  useEffect(() => {
    const attemptId = searchParams.get('retake');
    
    // Only process retake if we haven't processed this attemptId yet and we don't have results
    if (attemptId && examId && results === null && retakeProcessed.current !== attemptId) {
      const attempt = previousAttempts.find((a) => a.id === attemptId && a.examId === examId);
      if (attempt && attempt.questionIds) {
        setRetakeQuestionIds(attempt.questionIds);
        setIsRetaking(true);
        retakeProcessed.current = attemptId;
      }
    } else if (!attemptId) {
      // Clear retake state if no retake parameter
      if (isRetaking && results === null) {
        setIsRetaking(false);
        setRetakeQuestionIds(undefined);
      }
      retakeProcessed.current = null;
    }
  }, [searchParams, examId, results, isRetaking, previousAttempts]);

  // Clean up URL when retake is complete (but don't do it immediately to avoid race conditions)
  useEffect(() => {
    if (results !== null && !isRetaking && searchParams.get('retake')) {
      // Use setTimeout to ensure state is fully updated before URL change
      const timer = setTimeout(() => {
        const newUrl = `/take-exam/${subjectId}/${examId}`;
        window.history.replaceState({}, '', newUrl);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [results, isRetaking, searchParams, subjectId, examId]);

  useEffect(() => {
    // Don't redirect if we have results (we might be showing results view)
    if ((!subject || !exam) && results === null) {
      navigate('/');
    }
  }, [subject, exam, navigate, results]);

  useEffect(() => {
    if (isRetaking && !retakeQuestionIds) {
      // Reset retake state if no question IDs found
      setIsRetaking(false);
    }
  }, [isRetaking, retakeQuestionIds]);

  const handleComplete = (
    quizResults: QuizResult[],
    questionIds: string[],
    isComplete: boolean
  ) => {
    // Save attempt to store first
    if (subjectId && examId) {
      const answeredResults = quizResults.filter((r) => r.userAnswer !== '');
      const correctCount = answeredResults.filter((r) => r.isCorrect).length;
      const totalQuestions = quizResults.length;
      // Score should be based on total questions, not just answered questions
      const score = totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

      addAttempt({
        id: `attempt-${Date.now()}-${Math.random()}`,
        examId,
        subjectId,
        timestamp: new Date().toISOString(),
        results: quizResults,
        score,
        totalQuestions: quizResults.length,
        questionIds,
        isComplete,
      });
    }

    // Reset retake state and set results
    setIsRetaking(false);
    setRetakeQuestionIds(undefined);
    retakeProcessed.current = null; // Reset the processed flag
    // Set results immediately to trigger results view
    setResults(quizResults);
  };

  const handleRetake = () => {
    // Reset all state before starting retake
    setResults(null);
    setIsRetaking(false);
    setRetakeQuestionIds(undefined);
    // Navigate to clean URL first, then set retake state
    navigate(`/take-exam/${subjectId}/${examId}`, { replace: true });
    // Use setTimeout to ensure navigation completes before setting retake state
    setTimeout(() => {
      // Get the most recent attempt for this exam to retake with same questions
      const recentAttempt = previousAttempts
        .filter((a) => a.examId === examId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (recentAttempt && recentAttempt.questionIds) {
        setRetakeQuestionIds(recentAttempt.questionIds);
        setIsRetaking(true);
        // Update URL with retake parameter
        navigate(`/take-exam/${subjectId}/${examId}?retake=${recentAttempt.id}`, { replace: true });
      } else {
        // If no previous attempt, just start a new quiz
        setIsRetaking(false);
      }
    }, 100);
  };

  const handleFinish = () => {
    navigate('/');
  };

  // Show results if we have them and we're not currently retaking
  // This MUST be checked first, before checking subject/exam, to show results after submission
  if (results !== null && !isRetaking) {
    // Re-fetch exam to ensure it's available (important for preloaded exams)
    const currentExam = subjectId && examId ? getExam(subjectId, examId) : undefined;
    
    if (currentExam && currentExam.questions.length > 0) {
      // Check if this was a complete attempt
      const isComplete = results.every((r) => r.userAnswer !== '');
      
      return (
        <ResultsView
          questions={currentExam.questions}
          results={results}
          examName={currentExam.name}
          onRetake={handleRetake}
          onFinish={handleFinish}
          isComplete={isComplete}
        />
      );
    }
    
    // If exam not available yet, try to get it from subject
    if (subject && subject.exams.length > 0) {
      const examFromSubject = subject.exams.find((e) => e.id === examId);
      if (examFromSubject && examFromSubject.questions.length > 0) {
        const isComplete = results.every((r) => r.userAnswer !== '');
        return (
          <ResultsView
            questions={examFromSubject.questions}
            results={results}
            examName={examFromSubject.name}
            onRetake={handleRetake}
            onFinish={handleFinish}
            isComplete={isComplete}
          />
        );
      }
    }
    
    // If exam still not available, show loading
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  // If no subject or exam, show nothing (redirect will happen via useEffect)
  // But only redirect if we don't have results
  if ((!subject || !exam) && results === null) {
    return null;
  }

  if (!exam) {
    return null;
  }

  return (
    <QuizRunner
      questions={exam.questions}
      examName={exam.name}
      onComplete={handleComplete}
      onCancel={handleFinish}
      retakeQuestionIds={retakeQuestionIds}
      retakeMode={isRetaking && retakeQuestionIds !== undefined}
    />
  );
}
