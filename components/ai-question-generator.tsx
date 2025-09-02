"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Brain, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  question: string
  type: "multiple_choice" | "true_false" | "short_answer"
  options?: string[]
  correctAnswer: string
}

interface AIQuestionGeneratorProps {
  onQuestionsGenerated: (questions: Question[]) => void
}

export function AIQuestionGenerator({ onQuestionsGenerated }: AIQuestionGeneratorProps) {
  const [topic, setTopic] = useState("")
  const [questionCount, setQuestionCount] = useState("5")
  const [questionType, setQuestionType] = useState("multiple_choice")
  const [difficulty, setDifficulty] = useState("متوسط")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال موضوع الأسئلة",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedText("")

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          questionCount: Number.parseInt(questionCount),
          questionType,
          difficulty,
          language: "arabic",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          setGeneratedText(fullResponse)
        }
      }

      // Parse the generated JSON
      try {
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const questionsData = JSON.parse(jsonMatch[0])
          if (questionsData.questions && Array.isArray(questionsData.questions)) {
            onQuestionsGenerated(questionsData.questions)
            toast({
              title: "تم إنشاء الأسئلة بنجاح!",
              description: `تم إنشاء ${questionsData.questions.length} سؤال بواسطة الذكاء الاصطناعي`,
            })
          }
        }
      } catch (parseError) {
        console.error("Error parsing generated questions:", parseError)
        toast({
          title: "خطأ في معالجة الأسئلة",
          description: "تم إنشاء الأسئلة ولكن حدث خطأ في معالجتها. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating questions:", error)
      toast({
        title: "خطأ في إنشاء الأسئلة",
        description: "حدث خطأ أثناء إنشاء الأسئلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <Sparkles className="h-5 w-5 text-cyan-500" />
        </div>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
          مولد الأسئلة بالذكاء الاصطناعي
        </CardTitle>
        <CardDescription>استخدم قوة الذكاء الاصطناعي لإنشاء أسئلة تعليمية متنوعة وعالية الجودة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">موضوع الأسئلة</Label>
          <Input
            id="topic"
            placeholder="مثال: الرياضيات، التاريخ، العلوم..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="text-right"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="count">عدد الأسئلة</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 أسئلة</SelectItem>
                <SelectItem value="5">5 أسئلة</SelectItem>
                <SelectItem value="10">10 أسئلة</SelectItem>
                <SelectItem value="15">15 سؤال</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">نوع الأسئلة</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">اختيار متعدد</SelectItem>
                <SelectItem value="true_false">صح أو خطأ</SelectItem>
                <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">مستوى الصعوبة</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="سهل">سهل</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="صعب">صعب</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري إنشاء الأسئلة...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              إنشاء الأسئلة بالذكاء الاصطناعي
            </>
          )}
        </Button>

        {generatedText && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium">معاينة الأسئلة المُنشأة:</Label>
            <div className="mt-2 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">{generatedText}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
