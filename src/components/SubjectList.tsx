import { motion } from 'framer-motion';
import { Plus, BookOpen, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Subject } from '@/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { isPreloadedSubject } from '@/utils/preloadedData';

interface SubjectListProps {
  onSelectSubject: (subjectId: string) => void;
  selectedSubjectId?: string;
  subjects?: Subject[]; // Optional: if not provided, uses all subjects from store
  showActions?: boolean; // Optional: if false, hides edit/delete buttons (for preloaded subjects)
  showHeading?: boolean; // Optional: if false, hides the "Subjects" heading
}

export function SubjectList({ 
  onSelectSubject, 
  selectedSubjectId,
  subjects: providedSubjects,
  showActions = true,
  showHeading = true,
}: SubjectListProps) {
  const { subjects: storeSubjects, addSubject, deleteSubject, updateSubject } = useStore();
  const subjects = providedSubjects || storeSubjects;
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim());
      setNewSubjectName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateSubject(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  return (
    <div className={showHeading ? "space-y-4" : ""}>
      {showHeading && showActions && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Subjects</h2>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          )}
        </div>
      )}
      {!showHeading && showActions && !isAdding && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      )}

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <Input
            placeholder="Subject name (e.g., Math, Science)"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            autoFocus
          />
          <Button onClick={handleAdd}>Add</Button>
          <Button variant="outline" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </motion.div>
      )}

      <div className={`grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${!showHeading ? 'mt-0' : ''}`}>
        {subjects.map((subject) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedSubjectId === subject.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectSubject(subject.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  {editingId === subject.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(subject.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(subject.id)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="flex items-center gap-2 break-words">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="break-words">{subject.name}</span>
                      </CardTitle>
                      {showActions && !isPreloadedSubject(subject.id) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(subject.id, subject.name);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 text-destructive touch-manipulation"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${subject.name}"?`)) {
                                deleteSubject(subject.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {subject.exams.length} exam{subject.exams.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {subjects.length === 0 && !isAdding && showActions && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No subjects yet. Create your first subject to get started!</p>
        </div>
      )}
    </div>
  );
}

