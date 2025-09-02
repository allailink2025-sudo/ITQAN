"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, BarChart3, Zap, Sparkles, Bot, Rocket, Construction } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [classCode, setClassCode] = useState("")
  const [studentName, setStudentName] = useState("")
  const router = useRouter()

  const handleStudentJoin = () => {
    if (classCode.trim() && studentName.trim()) {
      router.push(`/quiz/${classCode}?name=${encodeURIComponent(studentName)}`)
    }
  }

  const handleTeacherAccess = () => {
    router.push("/teacher")
  }

  const handleAIQuizBuilder = () => {
    alert("ميزة إنشاء الاختبارات بالذكاء الاصطناعي قادمة قريباً!")
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Construction className="h-4 w-4" />
          <span>الموقع قيد التطوير والإنشاء - المزيد من المميزات قادمة قريباً</span>
        </div>
      </div>

      {/* Header */}
      <header className="glass-card border-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary p-2 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  منصة التعلم التفاعلي
                </h1>
                <p className="text-sm text-muted-foreground">مدعومة بالذكاء الاصطناعي</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              <Sparkles className="h-3 w-3 mr-1" />
              إصدار تجريبي
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              منصة تعليمية ذكية للمعلمين والطلاب
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            أنشئ أنشطة واختبارات تفاعلية بالذكاء الاصطناعي، شاركها مع طلابك، وتابع النتائج في الوقت الفعلي
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Student Access */}
          <Card className="glass-card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-right">
                <Users className="h-6 w-6 text-secondary" />
                <span>دخول الطلاب</span>
              </CardTitle>
              <CardDescription className="text-right">ادخل رمز الفصل واسمك للبدء في حل النشاط</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classCode" className="text-right block font-medium">
                  رمز الفصل
                </Label>
                <Input
                  id="classCode"
                  placeholder="أدخل رمز الفصل"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono bg-input/50 backdrop-blur-sm"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-right block font-medium">
                  اسم الطالب
                </Label>
                <Input
                  id="studentName"
                  placeholder="أدخل اسمك"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="bg-input/50 backdrop-blur-sm"
                />
              </div>
              <Button
                onClick={handleStudentJoin}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
                disabled={!classCode.trim() || !studentName.trim()}
              >
                ابدأ النشاط
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Access */}
          <Card className="glass-card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-right">
                <BookOpen className="h-6 w-6 text-primary" />
                <span>لوحة المعلم</span>
              </CardTitle>
              <CardDescription className="text-right">أنشئ أنشطة جديدة وتابع نتائج طلابك</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleTeacherAccess} className="w-full bg-primary hover:bg-primary/90 shadow-lg">
                دخول لوحة المعلم
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                قريباً
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-right">
                <Bot className="h-6 w-6 text-accent" />
                <span>منشئ الاختبارات الذكي</span>
              </CardTitle>
              <CardDescription className="text-right">أنشئ اختبارات تلقائياً باستخدام الذكاء الاصطناعي</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAIQuizBuilder} className="w-full gradient-primary text-white shadow-lg" disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                إنشاء بالذكاء الاصطناعي
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="text-center group">
            <div className="gradient-primary rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">سهولة الاستخدام</h3>
            <p className="text-muted-foreground text-sm">لا حاجة لتسجيل حسابات للطلاب، فقط اسم ورمز الفصل</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-secondary to-accent rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">تتبع النتائج</h3>
            <p className="text-muted-foreground text-sm">تقارير شاملة عن أداء الطلاب والإجابات الصحيحة والخاطئة</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">تفاعل فوري</h3>
            <p className="text-muted-foreground text-sm">مشاهدة النتائج والإجابات في الوقت الفعلي</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-accent to-secondary rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
              <Bot className="h-8 w-8 text-white" />
              <Badge className="absolute -top-1 -right-1 text-xs bg-accent text-accent-foreground">قريباً</Badge>
            </div>
            <h3 className="text-lg font-semibold mb-2">ذكاء اصطناعي</h3>
            <p className="text-muted-foreground text-sm">إنشاء أسئلة ذكية وتحليل متقدم للنتائج</p>
          </div>
        </div>

        <div className="glass-card p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">المميزات القادمة</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
              <Bot className="h-4 w-4 text-accent" />
              <span>مولد الأسئلة الذكي</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>تحليلات متقدمة</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span>تخصيص المحتوى</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
