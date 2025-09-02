export interface Quiz {
  id: string
  title: string
  description: string
  classCode: string
  teacherName: string
  questions: Question[]
  createdAt: Date
  isActive: boolean
}

export interface Question {
  id: string
  type: "multiple-choice" | "true-false" | "short-answer"
  question: string
  options?: string[] // For multiple choice
  correctAnswer: string | number // Index for MC, boolean for T/F, string for short answer
  points: number
}

export interface StudentResponse {
  id: string
  quizId: string
  studentName: string
  answers: Answer[]
  score: number
  totalPoints: number
  completedAt: Date
  timeSpent: number // in seconds
}

export interface Answer {
  questionId: string
  answer: string | number | boolean
  isCorrect: boolean
  pointsEarned: number
}

export interface ClassSession {
  classCode: string
  quizId: string
  teacherName: string
  createdAt: Date
  responses: StudentResponse[]
}
