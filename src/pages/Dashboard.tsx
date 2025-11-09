import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { SubjectList } from '@/components/SubjectList';
import { ExamList } from '@/components/ExamList';
import { BackButton } from '@/components/BackButton';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [searchParams] = useSearchParams();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>();
  const navigate = useNavigate();
  const { getSubject, getPopularSubjects, getUserSubjects } = useStore();

  const selectedSubject = selectedSubjectId ? getSubject(selectedSubjectId) : undefined;
  const popularSubjects = getPopularSubjects();
  const userSubjects = getUserSubjects();

  // Handle subject selection from URL
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      setSelectedSubjectId(subjectParam);
    }
  }, [searchParams]);

  const handleTakeExam = (examId: string) => {
    if (selectedSubjectId) {
      navigate(`/take-exam/${selectedSubjectId}/${examId}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Quiz Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create subjects, manage exams, and take quizzes
        </p>
      </motion.div>

      {!selectedSubjectId ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Popular Subjects Section */}
          {popularSubjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-semibold">Popular Subjects</h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Preloaded
                </span>
              </div>
              <SubjectList
                onSelectSubject={setSelectedSubjectId}
                selectedSubjectId={selectedSubjectId}
                subjects={popularSubjects}
                showActions={false}
              />
            </motion.div>
          )}

          {/* Regular Subjects Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3 sm:space-y-4"
          >
            <h2 className="text-xl sm:text-2xl font-semibold">My Subjects</h2>
            <SubjectList
              onSelectSubject={setSelectedSubjectId}
              selectedSubjectId={selectedSubjectId}
              subjects={userSubjects}
              showHeading={false}
            />
          </motion.div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <BackButton
              onClick={() => {
                setSelectedSubjectId(undefined);
                setSelectedExamId(undefined);
              }}
            />
            <h2 className="text-xl sm:text-2xl font-semibold break-words">{selectedSubject?.name}</h2>
          </div>
          <ExamList
            subjectId={selectedSubjectId}
            onSelectExam={(examId) => {
              setSelectedExamId(examId);
              navigate(`/create-exam/${selectedSubjectId}/${examId}`);
            }}
            onTakeExam={handleTakeExam}
            selectedExamId={selectedExamId}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
