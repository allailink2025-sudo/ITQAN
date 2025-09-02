"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ArrowRight, ArrowLeft, Trophy, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { storage, generateId } from "@/lib/storage"
import type { Quiz, Answer, StudentResponse } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function StudentQuiz({ params }: { params: { classCode: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({})
  const [studentName, setStudentName] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [results, setResults] = useState<StudentResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const nameFromUrl = searchParams.get("name")

  useEffect(() => {
    const classCode = params.classCode.toUpperCase()

    if (nameFromUrl) {
      setStudentName(decodeURIComponent(nameFromUrl))
    }

    // Load quiz by class code
    const foundQuiz = storage.getQuizByClassCode(classCode)
    if (foundQuiz) {
      setQuiz(foundQuiz)
    } else {
      toast({
        title: "خطأ",
        description: "رمز الفصل غير صحيح أو النشاط غير متاح",
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [params.classCode, nameFromUrl, toast])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && !isCompleted && startTime) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, isCompleted, startTime])

  const startQuiz = () => {
    if (!studentName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسمك أولاً",
        variant: "destructive",
      })
      return
    }
    setIsStarted(true)
    setStartTime(new Date())
  }

  const handleAnswer = (questionId: string, answer: string | number | boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const submitQuiz = () => {
    if (!quiz || !startTime) return

    // Calculate results
    const processedAnswers: Answer[] = quiz.questions.map((question) => {
      const studentAnswer = answers[question.id]
      let isCorrect = false

      if (question.type === "multiple-choice") {
        isCorrect = studentAnswer === question.correctAnswer
      } else if (question.type === "true-false") {
        isCorrect = studentAnswer === question.correctAnswer
      } else if (question.type === "short-answer") {
        const correctAnswer = question.correctAnswer.toString().toLowerCase().trim()
        const studentAnswerStr = studentAnswer?.toString().toLowerCase().trim() || ""
        isCorrect = studentAnswerStr === correctAnswer
      }

      return {
        questionId: question.id,
        answer: studentAnswer || "",
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      }
    })

    const totalScore = processedAnswers.reduce((sum, answer) => sum + answer.pointsEarned, 0)
    const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0)

    const response: StudentResponse = {
      id: generateId(),
      quizId: quiz.id,
      studentName,
      answers: processedAnswers,
      score: totalScore,
      totalPoints,
      completedAt: new Date(),
      timeSpent,
    }

    // Save response
    storage.saveResponse(response)
    setResults(response)
    setIsCompleted(true)

    toast({
      title: "تم إرسال الإجابات",
      description: "شكراً لك! تم حفظ إجاباتك بنجاح",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل النشاط...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              خطأ في رمز الفصل
            </CardTitle>
            <CardDescription>رمز الفصل غير صحيح أو النشاط غير متاح حالياً</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted && results) {
    const percentage = Math.round((results.score / results.totalPoints) * 100)
    const passed = percentage >= 70

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                passed ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              {passed ? (
                <Trophy className="h-8 w-8 text-green-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <CardTitle className="text-2xl">{passed ? "أحسنت!" : "انتهيت من النشاط"}</CardTitle>
            <CardDescription>شكراً لك {studentName} على المشاركة في النشاط</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">{results.score}</p>
                <p className="text-sm text-gray-600">النقاط المحصلة</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-600">{results.totalPoints}</p>
                <p className="text-sm text-gray-600">إجمالي النقاط</p>
              </div>
              <div className={`rounded-lg p-4 ${passed ? "bg-green-50" : "bg-yellow-50"}`}>
                <p className={`text-2xl font-bold ${passed ? "text-green-600" : "text-yellow-600"}`}>{percentage}%</p>
                <p className="text-sm text-gray-600">النسبة المئوية</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">{formatTime(results.timeSpent)}</p>
                <p className="text-sm text-gray-600">الوقت المستغرق</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>النتيجة</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            {/* Performance Badge */}
            <div className="text-center">
              <Badge variant={passed ? "default" : "secondary"} className="text-lg px-4 py-2">
                {passed ? "نجح" : "يحتاج تحسين"}
              </Badge>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="font-semibold">تفاصيل الإجابات:</h3>
              {quiz.questions.map((question, index) => {
                const answer = results.answers.find((a) => a.questionId === question.id)
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">السؤال {index + 1}</p>
                      <Badge variant={answer?.isCorrect ? "default" : "destructive"}>
                        {answer?.isCorrect ? "صحيح" : "خطأ"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                    <div className="text-sm">
                      <p>
                        إجابتك: <span className="font-medium">{answer?.answer?.toString()}</span>
                      </p>
                      {!answer?.isCorrect && (
                        <p className="text-green-600">
                          الإجابة الصحيحة:{" "}
                          <span className="font-medium">
                            {question.type === "multiple-choice" && question.options
                              ? question.options[question.correctAnswer as number]
                              : question.correctAnswer?.toString()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <Button onClick={() => router.push("/")} className="w-full">
              العودة للصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{quiz.title}</CardTitle>
            <CardDescription className="text-center">{quiz.description || "اختبار تفاعلي"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">معلم النشاط: {quiz.teacherName}</p>
              <p className="text-sm text-gray-600">عدد الأسئلة: {quiz.questions.length}</p>
              <p className="text-sm text-gray-600">
                إجمالي النقاط: {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentName">اسم الطالب</Label>
              <Input
                id="studentName"
                placeholder="أدخل اسمك"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && startQuiz()}
              />
            </div>

            <Button onClick={startQuiz} className="w-full bg-green-600 hover:bg-green-700">
              ابدأ النشاط
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const answeredQuestions = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">الطالب: {studentName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatTime(timeSpent)}
              </div>
              <Badge variant="outline">
                {answeredQuestions} / {quiz.questions.length}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              السؤال {currentQuestionIndex + 1} من {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>السؤال {currentQuestionIndex + 1}</span>
              <Badge>{currentQuestion.points} نقطة</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{currentQuestion.question}</p>

            {/* Multiple Choice */}
            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleAnswer(currentQuestion.id, Number.parseInt(value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {currentQuestion.type === "true-false" && (
              <RadioGroup
                value={answers[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value === "true")}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="flex-1 cursor-pointer">
                    صح
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="flex-1 cursor-pointer">
                    خطأ
                  </Label>
                </div>
              </RadioGroup>
            )}

            {/* Short Answer */}
            {currentQuestion.type === "short-answer" && (
              <Input
                placeholder="أدخل إجابتك هنا..."
                value={answers[currentQuestion.id]?.toString() || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
                <ArrowRight className="h-4 w-4 mr-2" />
                السابق
              </Button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={submitQuiz}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={answeredQuestions < quiz.questions.length}
                >
                  إرسال الإجابات
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  التالي
                  <ArrowLeft className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
