"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Users, TrendingUp, Clock, CheckCircle, XCircle, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Quiz, StudentResponse } from "@/lib/types"

export default function QuizResults({ params }: { params: { quizId: string } }) {
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [responses, setResponses] = useState<StudentResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundQuiz = storage.getQuizzes().find((q) => q.id === params.quizId)
    const quizResponses = storage.getResponsesByQuizId(params.quizId)

    setQuiz(foundQuiz || null)
    setResponses(quizResponses)
    setLoading(false)
  }, [params.quizId])

  const getQuizStats = () => {
    if (responses.length === 0) return null

    const totalStudents = responses.length
    const averageScore = responses.reduce((sum, r) => sum + (r.score / r.totalPoints) * 100, 0) / totalStudents
    const passRate = (responses.filter((r) => r.score / r.totalPoints >= 0.7).length / totalStudents) * 100
    const averageTime = responses.reduce((sum, r) => sum + r.timeSpent, 0) / totalStudents

    return {
      totalStudents,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
      averageTime: Math.round(averageTime / 60), // in minutes
    }
  }

  const getQuestionAnalysis = () => {
    if (!quiz || responses.length === 0) return []

    return quiz.questions.map((question) => {
      const questionResponses = responses
        .map((r) => r.answers.find((a) => a.questionId === question.id))
        .filter(Boolean)

      const correctCount = questionResponses.filter((a) => a?.isCorrect).length
      const incorrectCount = questionResponses.length - correctCount
      const successRate = questionResponses.length > 0 ? (correctCount / questionResponses.length) * 100 : 0

      // For multiple choice, get distribution of answers
      const answerDistribution: Record<string, number> = {}
      if (question.type === "multiple-choice" && question.options) {
        question.options.forEach((_, index) => {
          answerDistribution[index.toString()] = questionResponses.filter((a) => a?.answer === index).length
        })
      }

      return {
        question,
        correctCount,
        incorrectCount,
        successRate: Math.round(successRate),
        answerDistribution,
      }
    })
  }

  const exportResults = () => {
    if (!quiz || responses.length === 0) return

    const csvContent = [
      // Header
      ["اسم الطالب", "النقاط المحصلة", "إجمالي النقاط", "النسبة المئوية", "الوقت المستغرق (دقيقة)", "تاريخ الإكمال"],
      // Data
      ...responses.map((response) => [
        response.studentName,
        response.score.toString(),
        response.totalPoints.toString(),
        Math.round((response.score / response.totalPoints) * 100).toString() + "%",
        Math.round(response.timeSpent / 60).toString(),
        new Date(response.completedAt).toLocaleDateString("ar"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${quiz.title}_results.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل النتائج...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>النشاط غير موجود</CardTitle>
            <CardDescription>لم يتم العثور على النشاط المطلوب</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/teacher")} className="w-full">
              العودة للوحة المعلم
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getQuizStats()
  const questionAnalysis = getQuestionAnalysis()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/teacher")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">نتائج النشاط</h1>
                <p className="text-sm text-gray-600">{quiz.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">رمز الفصل: {quiz.classCode}</Badge>
              {responses.length > 0 && (
                <Button variant="outline" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  تصدير النتائج
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {responses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إجابات بعد</h3>
              <p className="text-gray-600 mb-4">لم يقم أي طالب بحل النشاط حتى الآن</p>
              <p className="text-sm text-gray-500">
                شارك رمز الفصل <strong>{quiz.classCode}</strong> مع طلابك
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="students">الطلاب</TabsTrigger>
              <TabsTrigger value="questions">تحليل الأسئلة</TabsTrigger>
              <TabsTrigger value="detailed">تفاصيل الإجابات</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {stats && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد المشاركين</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">طالب</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">متوسط الدرجات</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.averageScore}%</div>
                        <Progress value={stats.averageScore} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.passRate}%</div>
                        <p className="text-xs text-muted-foreground">
                          {responses.filter((r) => r.score / r.totalPoints >= 0.7).length} من {stats.totalStudents}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">متوسط الوقت</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.averageTime}</div>
                        <p className="text-xs text-muted-foreground">دقيقة</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Score Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>توزيع الدرجات</CardTitle>
                      <CardDescription>توزيع الطلاب حسب النسب المئوية</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            range: "90-100%",
                            color: "bg-green-500",
                            count: responses.filter((r) => r.score / r.totalPoints >= 0.9).length,
                          },
                          {
                            range: "80-89%",
                            color: "bg-blue-500",
                            count: responses.filter(
                              (r) => r.score / r.totalPoints >= 0.8 && r.score / r.totalPoints < 0.9,
                            ).length,
                          },
                          {
                            range: "70-79%",
                            color: "bg-yellow-500",
                            count: responses.filter(
                              (r) => r.score / r.totalPoints >= 0.7 && r.score / r.totalPoints < 0.8,
                            ).length,
                          },
                          {
                            range: "60-69%",
                            color: "bg-orange-500",
                            count: responses.filter(
                              (r) => r.score / r.totalPoints >= 0.6 && r.score / r.totalPoints < 0.7,
                            ).length,
                          },
                          {
                            range: "أقل من 60%",
                            color: "bg-red-500",
                            count: responses.filter((r) => r.score / r.totalPoints < 0.6).length,
                          },
                        ].map((item) => (
                          <div key={item.range} className="flex items-center gap-4">
                            <div className="w-20 text-sm">{item.range}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-6">
                                  <div
                                    className={`${item.color} h-6 rounded-full flex items-center justify-center text-white text-xs font-medium`}
                                    style={{ width: `${(item.count / stats.totalStudents) * 100}%` }}
                                  >
                                    {item.count > 0 && item.count}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 w-12">
                                  {Math.round((item.count / stats.totalStudents) * 100)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>قائمة الطلاب والنتائج</CardTitle>
                  <CardDescription>تفاصيل أداء كل طالب</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {responses
                      .sort((a, b) => b.score - a.score)
                      .map((response, index) => {
                        const percentage = Math.round((response.score / response.totalPoints) * 100)
                        const passed = percentage >= 70
                        return (
                          <div key={response.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-gray-500">#{index + 1}</div>
                              <div>
                                <p className="font-medium">{response.studentName}</p>
                                <p className="text-sm text-gray-600">{Math.round(response.timeSpent / 60)} دقيقة</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-medium">
                                  {response.score} / {response.totalPoints}
                                </p>
                                <p className="text-sm text-gray-600">{percentage}%</p>
                              </div>
                              <Badge variant={passed ? "default" : "secondary"}>{passed ? "نجح" : "لم ينجح"}</Badge>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Questions Analysis Tab */}
            <TabsContent value="questions" className="space-y-6">
              <div className="grid gap-6">
                {questionAnalysis.map((analysis, index) => (
                  <Card key={analysis.question.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>السؤال {index + 1}</span>
                        <Badge variant={analysis.successRate >= 70 ? "default" : "destructive"}>
                          {analysis.successRate}% نجاح
                        </Badge>
                      </CardTitle>
                      <CardDescription>{analysis.question.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">إجابات صحيحة</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{analysis.correctCount}</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-3">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium">إجابات خاطئة</span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">{analysis.incorrectCount}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">معدل النجاح</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{analysis.successRate}%</div>
                          </div>
                        </div>

                        {/* Multiple choice answer distribution */}
                        {analysis.question.type === "multiple-choice" && analysis.question.options && (
                          <div className="space-y-2">
                            <h4 className="font-medium">توزيع الإجابات:</h4>
                            {analysis.question.options.map((option, optIndex) => {
                              const count = analysis.answerDistribution[optIndex.toString()] || 0
                              const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0
                              const isCorrect = analysis.question.correctAnswer === optIndex

                              return (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <div className="w-8 text-sm">{optIndex + 1}.</div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`text-sm ${isCorrect ? "font-medium text-green-600" : ""}`}>
                                        {option} {isCorrect && "(صحيح)"}
                                      </span>
                                      <span className="text-sm text-gray-600">{count} طالب</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${isCorrect ? "bg-green-500" : "bg-gray-400"}`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Detailed Answers Tab */}
            <TabsContent value="detailed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل إجابات الطلاب</CardTitle>
                  <CardDescription>عرض تفصيلي لإجابات كل طالب على كل سؤال</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {responses.map((response) => (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">{response.studentName}</h4>
                          <Badge variant={response.score / response.totalPoints >= 0.7 ? "default" : "secondary"}>
                            {Math.round((response.score / response.totalPoints) * 100)}%
                          </Badge>
                        </div>
                        <div className="grid gap-3">
                          {quiz.questions.map((question, qIndex) => {
                            const answer = response.answers.find((a) => a.questionId === question.id)
                            return (
                              <div
                                key={question.id}
                                className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                              >
                                <span>السؤال {qIndex + 1}</span>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {question.type === "multiple-choice" && question.options
                                      ? question.options[answer?.answer as number] || "لم يجب"
                                      : answer?.answer?.toString() || "لم يجب"}
                                  </span>
                                  <Badge variant={answer?.isCorrect ? "default" : "destructive"} size="sm">
                                    {answer?.isCorrect ? "صحيح" : "خطأ"}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
