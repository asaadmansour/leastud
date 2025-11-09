# Leastud - Quiz Management Application

A modern, feature-rich quiz and exam management application built with React, TypeScript, and TailwindCSS.

## Features

### Core Functionality
- **Subject & Exam Management**: Create multiple subjects (e.g., Math, Science) with multiple exams each
- **Question Creation**: Add questions with multiple answer options and mark correct answers
- **JSON Import**: Bulk import questions via JSON format
- **Quiz Taking**: Take exams with shuffled questions and track responses
- **Results & Scoring**: View detailed results with score and correct/incorrect answers

### UI/UX
- Modern, minimal design with TailwindCSS
- Smooth animations with Framer Motion
- Dark mode support
- Responsive design
- Progress bar animation during quiz
- Clean sidebar navigation

### Technical Features
- TypeScript for type safety
- Zustand for state management
- LocalStorage persistence
- Modular component architecture
- shadcn/ui component library

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Modal, etc.)
│   ├── SubjectList.tsx
│   ├── ExamList.tsx
│   ├── QuestionFormModal.tsx
│   ├── QuizRunner.tsx
│   ├── ResultsView.tsx
│   └── Sidebar.tsx
├── pages/              # Main page components
│   ├── Dashboard.tsx
│   ├── CreateExam.tsx
│   └── TakeExam.tsx
├── store/              # Zustand state management
│   ├── useStore.ts
│   └── useTheme.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── shuffle.ts
│   ├── parser.ts
│   ├── validation.ts
│   └── cn.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Usage

### Creating a Subject
1. Click "Add Subject" on the dashboard
2. Enter a subject name (e.g., "Math")
3. Press Enter or click "Add"

### Creating an Exam
1. Select a subject
2. Click "Add Exam"
3. Enter an exam name
4. Click "Manage" to add questions

### Adding Questions

#### Manual Entry
1. Click "Add Question"
2. Enter question text
3. Add answer options (minimum 2)
4. Select the correct answer
5. Click "Add Question"

#### JSON Import
1. Click "Add Question" → "Import JSON"
2. Paste JSON in the format:
```json
{
  "subject": "Math",
  "exam": "Algebra Basics",
  "questions": [
    {
      "question": "What is 2 + 2?",
      "answers": ["3", "4", "5"],
      "correct": "4"
    }
  ]
}
```
3. Click "Import Questions"

### Taking an Exam
1. Select a subject and exam
2. Click "Take Exam"
3. Answer questions (order is shuffled)
4. Review results and score

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Routing
- **shadcn/ui** - UI components

## Build

```bash
npm run build
```

## License

MIT

