"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Save, Eye, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { storage, generateId, generateClassCode } from "@/lib/storage"
import type { Quiz, Question } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { AIQuestionGenerator } from "@/components/ai-question-generator"

export default function CreateQuiz() {
  const router = useRouter()
  const { toast } = useToast()

  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: "",
    description: "",
    questions: [],
    isActive: true,
  })

  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "multiple-choice",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 1,
  })

  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const handleAIQuestionsGenerated = (aiQuestions: any[]) => {
    const convertedQuestions: Question[] = aiQuestions.map((aiQ) => ({
      id: generateId(),
      type:
        aiQ.type === "multiple_choice" ? "multiple-choice" : aiQ.type === "true_false" ? "true-false" : "short-answer",
      question: aiQ.question,
      options: aiQ.options,
      correctAnswer: aiQ.type === "multiple_choice" ? aiQ.options?.indexOf(aiQ.correctAnswer) || 0 : aiQ.correctAnswer,
      points: 1,
    }))

    setQuiz((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), ...convertedQuestions],
    }))

    setShowAIGenerator(false)

    toast({
      title: "تم إضافة الأسئلة بنجاح!",
      description: `تم إضافة ${convertedQuestions.length} سؤال من الذكاء الاصطناعي`,
    })
  }

  const addQuestion = () => {
    if (!currentQuestion.question?.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص السؤال",
        variant: "destructive",
      })
      return
    }

    if (
      currentQuestion.type === "multiple-choice" &&
      (!currentQuestion.options || currentQuestion.options.some((opt) => !opt.trim()))
    ) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال جميع الخيارات",
        variant: "destructive",
      })
      return
    }

    const newQuestion: Question = {
      id: generateId(),
      type: currentQuestion.type as Question["type"],
      question: currentQuestion.question!,
      options: currentQuestion.type === "multiple-choice" ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.correctAnswer!,
      points: currentQuestion.points || 1,
    }

    setQuiz((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion],
    }))

    setCurrentQuestion({
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    })

    toast({
      title: "تم إضافة السؤال",
      description: "تم إضافة السؤال بنجاح",
    })
  }

  const removeQuestion = (questionId: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions?.filter((q) => q.id !== questionId) || [],
    }))
  }

  const updateQuestionOption = (index: number, value: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? value : opt)) || [],
    }))
  }

  const saveQuiz = () => {
    if (!quiz.title?.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان النشاط",
        variant: "destructive",
      })
      return
    }

    if (!quiz.questions?.length) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة سؤال واحد على الأقل",
        variant: "destructive",
      })
      return
    }

    const teacherName = localStorage.getItem("teacher-name") || "معلم"
    const classCode = generateClassCode()

    const newQuiz: Quiz = {
      id: generateId(),
      title: quiz.title!,
      description: quiz.description || "",
      classCode,
      teacherName,
      questions: quiz.questions!,
      createdAt: new Date(),
      isActive: quiz.isActive || true,
    }

    storage.saveQuiz(newQuiz)

    toast({
      title: "تم حفظ النشاط",
      description: `رمز الفصل: ${classCode}`,
    })

    router.push("/teacher")
  }

  const previewQuiz = () => {
    if (!quiz.questions?.length) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة سؤال واحد على الأقل للمعاينة",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "معاينة النشاط",
      description: "ستتم إضافة المعاينة قريباً",
    })
  }

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
              <h1 className="text-2xl font-bold text-gray-900">إنشاء نشاط جديد</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={previewQuiz}>
                <Eye className="h-4 w-4 mr-2" />
                معاينة
              </Button>
              <Button onClick={saveQuiz} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                حفظ النشاط
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات النشاط</CardTitle>
              <CardDescription>أدخل العنوان والوصف للنشاط</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان النشاط *</Label>
                <Input
                  id="title"
                  placeholder="مثال: اختبار الرياضيات - الوحدة الأولى"
                  value={quiz.title || ""}
                  onChange={(e) => setQuiz((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">وصف النشاط</Label>
                <Textarea
                  id="description"
                  placeholder="وصف مختصر عن محتوى النشاط..."
                  value={quiz.description || ""}
                  onChange={(e) => setQuiz((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {showAIGenerator ? (
            <AIQuestionGenerator onQuestionsGenerated={handleAIQuestionsGenerated} />
          ) : (
            <Card className="border-2 border-dashed border-cyan-200 bg-gradient-to-r from-cyan-50 to-emerald-50">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  إنشاء أسئلة بالذكاء الاصطناعي
                </h3>
                <p className="text-gray-600 text-center mb-4 max-w-md">
                  وفر وقتك واستخدم قوة الذكاء الاصطناعي لإنشاء أسئلة متنوعة وعالية الجودة تلقائياً
                </p>
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  جرب الذكاء الاصطناعي
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Question */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة سؤال يدوياً</CardTitle>
              <CardDescription>اختر نوع السؤال وأدخل التفاصيل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>نوع السؤال</Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value: Question["type"]) =>
                    setCurrentQuestion((prev) => ({
                      ...prev,
                      type: value,
                      options: value === "multiple-choice" ? ["", "", "", ""] : undefined,
                      correctAnswer: value === "true-false" ? true : 0,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">اختيار من متعدد</SelectItem>
                    <SelectItem value="true-false">صح أم خطأ</SelectItem>
                    <SelectItem value="short-answer">إجابة قصيرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">نص السؤال *</Label>
                <Textarea
                  id="question"
                  placeholder="أدخل نص السؤال هنا..."
                  value={currentQuestion.question || ""}
                  onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, question: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Multiple Choice Options */}
              {currentQuestion.type === "multiple-choice" && (
                <div className="space-y-3">
                  <Label>الخيارات</Label>
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                          className="text-green-600"
                        />
                        <Input
                          placeholder={`الخيار ${index + 1}`}
                          value={option}
                          onChange={(e) => updateQuestionOption(index, e.target.value)}
                        />
                      </div>
                      <Badge variant={currentQuestion.correctAnswer === index ? "default" : "secondary"}>
                        {currentQuestion.correctAnswer === index ? "صحيح" : `${index + 1}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.type === "true-false" && (
                <div className="space-y-2">
                  <Label>الإجابة الصحيحة</Label>
                  <Select
                    value={currentQuestion.correctAnswer?.toString()}
                    onValueChange={(value) =>
                      setCurrentQuestion((prev) => ({ ...prev, correctAnswer: value === "true" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">صح</SelectItem>
                      <SelectItem value="false">خطأ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Short Answer */}
              {currentQuestion.type === "short-answer" && (
                <div className="space-y-2">
                  <Label htmlFor="shortAnswer">الإجابة الصحيحة</Label>
                  <Input
                    id="shortAnswer"
                    placeholder="أدخل الإجابة الصحيحة..."
                    value={currentQuestion.correctAnswer?.toString() || ""}
                    onChange={(e) => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="points">النقاط</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="10"
                  value={currentQuestion.points || 1}
                  onChange={(e) =>
                    setCurrentQuestion((prev) => ({ ...prev, points: Number.parseInt(e.target.value) || 1 }))
                  }
                  className="w-24"
                />
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                إضافة السؤال
              </Button>
            </CardContent>
          </Card>

          {/* Questions List */}
          {quiz.questions && quiz.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الأسئلة المضافة ({quiz.questions.length})</CardTitle>
                <CardDescription>يمكنك مراجعة وحذف الأسئلة من هنا</CardDescription>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    💡 مزية التعديل على الأسئلة التي تم إنشاؤها قادمة قريباً
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">السؤال {index + 1}</Badge>
                            <Badge variant="secondary">
                              {question.type === "multiple-choice"
                                ? "اختيار من متعدد"
                                : question.type === "true-false"
                                  ? "صح أم خطأ"
                                  : "إجابة قصيرة"}
                            </Badge>
                            <Badge>{question.points} نقطة</Badge>
                          </div>
                          <p className="font-medium mb-2">{question.question}</p>

                          {question.type === "multiple-choice" && question.options && (
                            <div className="space-y-1 text-sm">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`flex items-center gap-2 ${
                                    question.correctAnswer === optIndex ? "text-green-600 font-medium" : "text-gray-600"
                                  }`}
                                >
                                  <span>{optIndex + 1}.</span>
                                  <span>{option}</span>
                                  {question.correctAnswer === optIndex && <Badge size="sm">صحيح</Badge>}
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === "true-false" && (
                            <p className="text-sm text-green-600 font-medium">
                              الإجابة الصحيحة: {question.correctAnswer ? "صح" : "خطأ"}
                            </p>
                          )}

                          {question.type === "short-answer" && (
                            <p className="text-sm text-green-600 font-medium">
                              الإجابة الصحيحة: {question.correctAnswer}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
