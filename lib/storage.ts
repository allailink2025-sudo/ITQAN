import type { Quiz, StudentResponse, ClassSession } from "./types"

const STORAGE_KEYS = {
  QUIZZES: "educational-platform-quizzes",
  RESPONSES: "educational-platform-responses",
  SESSIONS: "educational-platform-sessions",
}

export const storage = {
  // Quiz operations
  saveQuiz: (quiz: Quiz): void => {
    const quizzes = storage.getQuizzes()
    const existingIndex = quizzes.findIndex((q) => q.id === quiz.id)

    if (existingIndex >= 0) {
      quizzes[existingIndex] = quiz
    } else {
      quizzes.push(quiz)
    }

    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes))
  },

  getQuizzes: (): Quiz[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES)
    return stored ? JSON.parse(stored) : []
  },

  getQuizByClassCode: (classCode: string): Quiz | null => {
    const quizzes = storage.getQuizzes()
    return quizzes.find((q) => q.classCode === classCode && q.isActive) || null
  },

  // Student response operations
  saveResponse: (response: StudentResponse): void => {
    const responses = storage.getResponses()
    responses.push(response)
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses))
  },

  getResponses: (): StudentResponse[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.RESPONSES)
    return stored ? JSON.parse(stored) : []
  },

  getResponsesByQuizId: (quizId: string): StudentResponse[] => {
    const responses = storage.getResponses()
    return responses.filter((r) => r.quizId === quizId)
  },

  // Class session operations
  saveSession: (session: ClassSession): void => {
    const sessions = storage.getSessions()
    const existingIndex = sessions.findIndex((s) => s.classCode === session.classCode)

    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
  },

  getSessions: (): ClassSession[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    return stored ? JSON.parse(stored) : []
  },

  getSessionByClassCode: (classCode: string): ClassSession | null => {
    const sessions = storage.getSessions()
    return sessions.find((s) => s.classCode === classCode) || null
  },

  addActiveStudent: (classCode: string, studentName: string): void => {
    const session = storage.getSessionByClassCode(classCode) || {
      classCode,
      activeStudents: [],
      kickedStudents: [],
      createdAt: new Date().toISOString(),
    }

    if (!session.activeStudents.some((s) => s.name === studentName)) {
      session.activeStudents.push({
        name: studentName,
        joinedAt: new Date().toISOString(),
        status: "active",
      })
    }

    storage.saveSession(session)
  },

  removeActiveStudent: (classCode: string, studentName: string): void => {
    const session = storage.getSessionByClassCode(classCode)
    if (session) {
      session.activeStudents = session.activeStudents.filter((s) => s.name !== studentName)
      session.kickedStudents.push({
        name: studentName,
        kickedAt: new Date().toISOString(),
      })
      storage.saveSession(session)
    }
  },

  getActiveStudents: (classCode: string): any[] => {
    const session = storage.getSessionByClassCode(classCode)
    return session?.activeStudents || []
  },

  isStudentKicked: (classCode: string, studentName: string): boolean => {
    const session = storage.getSessionByClassCode(classCode)
    return session?.kickedStudents.some((s) => s.name === studentName) || false
  },
}

// Utility function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// Utility function to generate class codes
export const generateClassCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
