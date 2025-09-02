"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Crown, User } from "lucide-react"
import { storage } from "@/lib/storage"
import type { Quiz } from "@/lib/types"

interface TeacherCollaborationPanelProps {
  classCode: string
  currentTeacher: string
}

export function TeacherCollaborationPanel({ classCode, currentTeacher }: TeacherCollaborationPanelProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [newTeacherName, setNewTeacherName] = useState("")
  const [isAddingTeacher, setIsAddingTeacher] = useState(false)

  useEffect(() => {
    const loadQuiz = () => {
      const foundQuiz = storage.getQuizByClassCode(classCode)
      setQuiz(foundQuiz)
    }

    loadQuiz()
    const interval = setInterval(loadQuiz, 2000)
    return () => clearInterval(interval)
  }, [classCode])

  const handleAddTeacher = () => {
    if (newTeacherName.trim() && quiz) {
      const success = storage.addTeacherToQuiz(classCode, newTeacherName.trim())
      if (success) {
        storage.addTeacherToSession(classCode, newTeacherName.trim())
        setNewTeacherName("")
        setIsAddingTeacher(false)
        // Reload quiz data
        const updatedQuiz = storage.getQuizByClassCode(classCode)
        setQuiz(updatedQuiz)
      }
    }
  }

  if (!quiz) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          المعلمون المتعاونون ({quiz.teachers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Teachers */}
          <div className="grid gap-2">
            {quiz.teachers.map((teacher, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {teacher.role === "creator" ? (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <User className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="font-medium">{teacher.name}</span>
                  {teacher.name === currentTeacher && (
                    <Badge variant="secondary" className="text-xs">
                      أنت
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={teacher.role === "creator" ? "default" : "outline"}>
                    {teacher.role === "creator" ? "منشئ" : "متعاون"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    انضم {new Date(teacher.joinedAt).toLocaleDateString("ar")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Teacher */}
          {!isAddingTeacher ? (
            <Button onClick={() => setIsAddingTeacher(true)} variant="outline" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              إضافة معلم جديد
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="اسم المعلم الجديد"
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTeacher()}
              />
              <Button onClick={handleAddTeacher} disabled={!newTeacherName.trim()}>
                إضافة
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingTeacher(false)
                  setNewTeacherName("")
                }}
              >
                إلغاء
              </Button>
            </div>
          )}

          {/* Class Code Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>كود الفصل الموحد:</strong> {classCode}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              يمكن لجميع المعلمين استخدام نفس الكود لإدارة هذا الفصل
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
