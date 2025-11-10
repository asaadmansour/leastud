import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Dashboard } from './pages/Dashboard';
import { CreateExam } from './pages/CreateExam';
import { TakeExam } from './pages/TakeExam';
import { PreviousAttempts } from './pages/PreviousAttempts';
import { Sidebar } from './components/Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get basename from environment or use default
  const basename = import.meta.env.BASE_URL || '/leastud';

  return (
    <BrowserRouter basename={basename}>
      <div className="flex min-h-screen bg-background">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-30 bg-card border-b px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold">Leastud</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create-exam/:subjectId/:examId" element={<CreateExam />} />
                <Route path="/take-exam/:subjectId/:examId" element={<TakeExam />} />
                <Route path="/previous-attempts/:subjectId/:examId" element={<PreviousAttempts />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

