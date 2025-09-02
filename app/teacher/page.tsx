"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  BookOpen,
  Plus,
  Users,
  Eye,
  Copy,
  CheckCircle,
  TrendingUp,
  Monitor,
  UserX,
  Clock,
  Star,
  Zap,
  BarChart3,
  LogOut,
  Shield,
  Settings,
  Download,
  Palette,
  Timer,
  FileText,
  Moon,
  Sun,
  Database,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import type { Quiz, StudentResponse } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [responses, setResponses] = useState<StudentResponse[]>([])
  const [teacherName, setTeacherName] = useState("")
  const [isNameSet, setIsNameSet] = useState(false)
  const [activeStudents, setActiveStudents] = useState<{ [key: string]: any[] }>({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMethod, setAuthMethod] = useState("")

  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
    language: "ar",
    soundEffects: true,
    defaultQuizTimer: 30,
    questionShuffle: false,
    showCorrectAnswers: true,
    allowRetakes: false,
    exportFormat: "csv",
    theme: "blue",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const teacherAuth = localStorage.getItem("teacherAuth")
    if (teacherAuth) {
      try {
        const auth = JSON.parse(teacherAuth)
        if (auth.isAuthenticated) {
          setIsAuthenticated(true)
          setTeacherName(auth.name)
          setAuthMethod(auth.method)
          setIsNameSet(true)
          loadData()
          loadSettings()
        } else {
          router.push("/")
        }
      } catch (error) {
        router.push("/")
      }
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    if (isNameSet) {
      const interval = setInterval(() => {
        loadActiveStudents()
      }, 5000) // Refresh every 5 seconds

      return () => clearInterval(interval)
    }
  }, [isNameSet, quizzes])

  const loadData = () => {
    const allQuizzes = storage.getQuizzes()
    const allResponses = storage.getResponses()
    setQuizzes(allQuizzes)
    setResponses(allResponses)
    loadActiveStudents()
  }

  const loadActiveStudents = () => {
    const allQuizzes = storage.getQuizzes()
    const studentsData: { [key: string]: any[] } = {}

    allQuizzes.forEach((quiz) => {
      if (quiz.isActive) {
        studentsData[quiz.classCode] = storage.getActiveStudents(quiz.classCode)
      }
    })

    setActiveStudents(studentsData)
  }

  const handleLogout = () => {
    localStorage.removeItem("teacherAuth")
    localStorage.removeItem("teacher-name")
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح من لوحة المعلم",
    })
    router.push("/")
  }

  const copyClassCode = (classCode: string) => {
    navigator.clipboard.writeText(classCode)
    toast({
      title: "تم نسخ رمز الفصل",
      description: "يمكنك الآن مشاركة الرمز مع طلابك",
    })
  }

  const kickStudent = (classCode: string, studentName: string) => {
    storage.removeActiveStudent(classCode, studentName)
    loadActiveStudents()
    toast({
      title: "تم طرد الطالب",
      description: `تم طرد ${studentName} من الفصل`,
      variant: "destructive",
    })
  }

  const getQuizStats = (quizId: string) => {
    const quizResponses = responses.filter((r) => r.quizId === quizId)
    const totalStudents = quizResponses.length
    const averageScore =
      totalStudents > 0 ? quizResponses.reduce((sum, r) => sum + (r.score / r.totalPoints) * 100, 0) / totalStudents : 0

    return {
      totalStudents,
      averageScore: Math.round(averageScore),
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("teacherSettings")
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }
  }

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    localStorage.setItem("teacherSettings", JSON.stringify(newSettings))
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعداداتك بنجاح",
    })
  }

  const exportResults = (format: string) => {
    const data = responses.map((response) => {
      const quiz = quizzes.find((q) => q.id === response.quizId)
      return {
        studentName: response.studentName,
        quizTitle: quiz?.title || "غير معروف",
        score: response.score,
        totalPoints: response.totalPoints,
        percentage: Math.round((response.score / response.totalPoints) * 100),
        completedAt: new Date(response.completedAt).toLocaleDateString("ar"),
        timeSpent: Math.round(response.timeSpent / 60),
      }
    })

    if (format === "csv") {
      const csv = [
        "اسم الطالب,عنوان النشاط,النقاط,إجمالي النقاط,النسبة المئوية,تاريخ الإكمال,الوقت المستغرق (دقيقة)",
        ...data.map(
          (row) =>
            `${row.studentName},${row.quizTitle},${row.score},${row.totalPoints},${row.percentage}%,${row.completedAt},${row.timeSpent}`,
        ),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `نتائج_الطلاب_${new Date().toLocaleDateString("ar")}.csv`
      link.click()
    }

    toast({
      title: "تم تصدير النتائج",
      description: `تم تصدير ${data.length} نتيجة بصيغة ${format.toUpperCase()}`,
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p>جاري التحقق من صلاحية الوصول...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${settings.darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">لوحة المعلم المتطورة</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">مرحباً {teacherName}</p>
                  <Badge variant="outline" className="text-xs">
                    {authMethod === "master" && "رمز رئيسي"}
                    {authMethod === "school" && "رمز مدرسة"}
                    {authMethod === "personal" && "رمز شخصي"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push("/teacher/create")} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                إنشاء نشاط جديد
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="quizzes">الأنشطة</TabsTrigger>
            <TabsTrigger value="live">إدارة الفصل المباشر</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            <TabsTrigger value="coming-soon">ميزات قادمة</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الأنشطة</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quizzes.length}</div>
                  <p className="text-xs text-muted-foreground">{quizzes.filter((q) => q.isActive).length} نشط</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Set(responses.map((r) => r.studentName)).size}</div>
                  <p className="text-xs text-muted-foreground">طالب مختلف</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الطلاب المتصلون</CardTitle>
                  <Monitor className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(activeStudents).reduce((sum, students) => sum + students.length, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">متصل الآن</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الإجابات</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{responses.length}</div>
                  <p className="text-xs text-muted-foreground">إجابة مكتملة</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
                <CardDescription>آخر الأنشطة والإجابات</CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">لا توجد إجابات بعد</div>
                ) : (
                  <div className="space-y-4">
                    {responses
                      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                      .slice(0, 5)
                      .map((response) => {
                        const quiz = quizzes.find((q) => q.id === response.quizId)
                        return (
                          <div key={response.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{response.studentName}</p>
                              <p className="text-sm text-gray-600">{quiz?.title}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={response.score / response.totalPoints >= 0.7 ? "default" : "secondary"}>
                                {Math.round((response.score / response.totalPoints) * 100)}%
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(response.completedAt).toLocaleDateString("ar")}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أنشطة بعد</h3>
                  <p className="text-gray-600 mb-4">ابدأ بإنشاء نشاطك الأول</p>
                  <Button onClick={() => router.push("/teacher/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    إنشاء نشاط جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {quizzes.map((quiz) => {
                  const stats = getQuizStats(quiz.id)
                  return (
                    <Card key={quiz.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {quiz.title}
                              <Badge variant={quiz.isActive ? "default" : "secondary"}>
                                {quiz.isActive ? "نشط" : "غير نشط"}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{quiz.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => copyClassCode(quiz.classCode)}>
                              <Copy className="h-4 w-4 mr-1" />
                              {quiz.classCode}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/teacher/results/${quiz.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              عرض النتائج
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">عدد الأسئلة</p>
                            <p className="font-medium">{quiz.questions.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">عدد الطلاب</p>
                            <p className="font-medium">{stats.totalStudents}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">متوسط الدرجات</p>
                            <p className="font-medium">{stats.averageScore}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Live Tab */}
          <TabsContent value="live" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-green-600" />
                  إدارة الفصل المباشر
                </CardTitle>
                <CardDescription>مراقبة الطلاب المتصلين وإدارة الفصول النشطة</CardDescription>
              </CardHeader>
              <CardContent>
                {quizzes.filter((q) => q.isActive).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>لا توجد فصول نشطة حالياً</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizzes
                      .filter((q) => q.isActive)
                      .map((quiz) => {
                        const students = activeStudents[quiz.classCode] || []
                        return (
                          <Card key={quiz.id} className="border-l-4 border-l-green-500">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                  <CardDescription>رمز الفصل: {quiz.classCode}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <Users className="h-3 w-3 mr-1" />
                                    {students.length} متصل
                                  </Badge>
                                  <Button variant="outline" size="sm" onClick={() => copyClassCode(quiz.classCode)}>
                                    <Copy className="h-4 w-4 mr-1" />
                                    نسخ الرمز
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {students.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">لا يوجد طلاب متصلون حالياً</p>
                              ) : (
                                <div className="space-y-2">
                                  <h4 className="font-medium mb-3">الطلاب المتصلون:</h4>
                                  <div className="grid gap-2">
                                    {students.map((student, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                          <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-xs text-gray-500">
                                              انضم في {new Date(student.joinedAt).toLocaleTimeString("ar")}
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => kickStudent(quiz.classCode, student.name)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <UserX className="h-4 w-4 mr-1" />
                                          طرد
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  تحليل الأداء
                </CardTitle>
                <CardDescription>إحصائيات شاملة عن أداء الطلاب</CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">لا توجد بيانات للتحليل بعد</div>
                ) : (
                  <div className="space-y-6">
                    {quizzes.map((quiz) => {
                      const quizResponses = responses.filter((r) => r.quizId === quiz.id)
                      if (quizResponses.length === 0) return null

                      const stats = getQuizStats(quiz.id)
                      const passRate =
                        (quizResponses.filter((r) => r.score / r.totalPoints >= 0.7).length / quizResponses.length) *
                        100

                      return (
                        <div key={quiz.id} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-4">{quiz.title}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">عدد المشاركين</p>
                              <p className="text-lg font-bold">{stats.totalStudents}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">متوسط الدرجات</p>
                              <p className="text-lg font-bold">{stats.averageScore}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">معدل النجاح</p>
                              <p className="text-lg font-bold">{Math.round(passRate)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">متوسط الوقت</p>
                              <p className="text-lg font-bold">
                                {Math.round(
                                  quizResponses.reduce((sum, r) => sum + r.timeSpent, 0) / quizResponses.length / 60,
                                )}
                                د
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* General Settings */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    الإعدادات العامة
                  </CardTitle>
                  <CardDescription>تخصيص تجربة استخدام المنصة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">الوضع الليلي</Label>
                      <p className="text-sm text-muted-foreground">تفعيل المظهر الداكن</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <Switch
                        checked={settings.darkMode}
                        onCheckedChange={(checked) => saveSettings({ ...settings, darkMode: checked })}
                      />
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">الإشعارات</Label>
                      <p className="text-sm text-muted-foreground">تلقي إشعارات عند إجابة الطلاب</p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => saveSettings({ ...settings, notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">الحفظ التلقائي</Label>
                      <p className="text-sm text-muted-foreground">حفظ التغييرات تلقائياً</p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => saveSettings({ ...settings, autoSave: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">المؤثرات الصوتية</Label>
                      <p className="text-sm text-muted-foreground">تشغيل الأصوات عند الإجراءات</p>
                    </div>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => saveSettings({ ...settings, soundEffects: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">اللغة</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => saveSettings({ ...settings, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Settings */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    إعدادات الأنشطة
                  </CardTitle>
                  <CardDescription>تخصيص سلوك الأنشطة والاختبارات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base">الوقت الافتراضي للنشاط (دقيقة)</Label>
                    <div className="px-3">
                      <Slider
                        value={[settings.defaultQuizTimer]}
                        onValueChange={([value]) => saveSettings({ ...settings, defaultQuizTimer: value })}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>5 دقائق</span>
                        <span className="font-medium">{settings.defaultQuizTimer} دقيقة</span>
                        <span>120 دقيقة</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">خلط الأسئلة</Label>
                      <p className="text-sm text-muted-foreground">عرض الأسئلة بترتيب عشوائي</p>
                    </div>
                    <Switch
                      checked={settings.questionShuffle}
                      onCheckedChange={(checked) => saveSettings({ ...settings, questionShuffle: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">إظهار الإجابات الصحيحة</Label>
                      <p className="text-sm text-muted-foreground">عرض الإجابات الصحيحة بعد الانتهاء</p>
                    </div>
                    <Switch
                      checked={settings.showCorrectAnswers}
                      onCheckedChange={(checked) => saveSettings({ ...settings, showCorrectAnswers: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">السماح بإعادة المحاولة</Label>
                      <p className="text-sm text-muted-foreground">السماح للطلاب بإعادة النشاط</p>
                    </div>
                    <Switch
                      checked={settings.allowRetakes}
                      onCheckedChange={(checked) => saveSettings({ ...settings, allowRetakes: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base">صيغة التصدير الافتراضية</Label>
                    <Select
                      value={settings.exportFormat}
                      onValueChange={(value) => saveSettings({ ...settings, exportFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Export & Data Management */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    إدارة البيانات
                  </CardTitle>
                  <CardDescription>تصدير وإدارة بيانات الطلاب والنتائج</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => exportResults("csv")} className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    تصدير جميع النتائج (CSV)
                  </Button>

                  <Button onClick={() => exportResults("pdf")} className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    تصدير تقرير شامل (PDF)
                  </Button>

                  <Button
                    onClick={() => {
                      const backup = {
                        quizzes,
                        responses,
                        settings,
                        exportDate: new Date().toISOString(),
                      }
                      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
                      const link = document.createElement("a")
                      link.href = URL.createObjectURL(blob)
                      link.download = `نسخة_احتياطية_${new Date().toLocaleDateString("ar")}.json`
                      link.click()
                      toast({
                        title: "تم إنشاء النسخة الاحتياطية",
                        description: "تم حفظ جميع بياناتك بنجاح",
                      })
                    }}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    إنشاء نسخة احتياطية
                  </Button>
                </CardContent>
              </Card>

              {/* Theme Customization */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    تخصيص المظهر
                  </CardTitle>
                  <CardDescription>اختر الألوان والمظهر المفضل</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">نمط الألوان</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["blue", "purple", "green"].map((theme) => (
                        <Button
                          key={theme}
                          variant={settings.theme === theme ? "default" : "outline"}
                          onClick={() => saveSettings({ ...settings, theme })}
                          className="h-12"
                        >
                          <div
                            className={`w-4 h-4 rounded-full mr-2 ${
                              theme === "blue" ? "bg-blue-500" : theme === "purple" ? "bg-purple-500" : "bg-green-500"
                            }`}
                          />
                          {theme === "blue" ? "أزرق" : theme === "purple" ? "بنفسجي" : "أخضر"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <h4 className="font-medium mb-2">معاينة المظهر</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-primary"></div>
                      <div className="w-8 h-8 rounded bg-secondary"></div>
                      <div className="w-8 h-8 rounded bg-accent"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Coming Soon Tab */}
          <TabsContent value="coming-soon" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  ميزات قادمة قريباً
                </CardTitle>
                <CardDescription>المنصة قيد التطوير والإنشاء - ميزات جديدة ومثيرة في الطريق!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-900">رسومات بيانية تفاعلية</h4>
                      <p className="text-sm text-blue-700">مخططات شريطية ودائرية لعرض الدرجات والنتائج بشكل مرئي</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      قريباً
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                    <Zap className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-900">تصدير النتائج والإشعارات</h4>
                      <p className="text-sm text-green-700">تحميل النتائج بصيغ Excel/PDF وإرسال إشعارات فورية</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      قريباً
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-violet-50">
                    <Star className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-purple-900">نظام النقاط والشارات</h4>
                      <p className="text-sm text-purple-700">نظام تحفيزي للطلاب مع نقاط وشارات لتعزيز المشاركة</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      قريباً
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
                    <Clock className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-orange-900">تحليلات ذكية متقدمة</h4>
                      <p className="text-sm text-orange-700">تنبؤات الأداء والتنبيه المبكر عند الحاجة للتدخل</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      قريباً
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                    <Users className="h-5 w-5 text-cyan-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-cyan-900">إمكانيات التخصيص والأدوار</h4>
                      <p className="text-sm text-cyan-700">تخصيص الألوان، ترتيب العناصر، وإضافة أدوار مساعد المعلم</p>
                    </div>
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                      قريباً
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-pink-50 to-rose-50">
                    <Zap className="h-5 w-5 text-pink-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-pink-900">تعديل الأسئلة المُنشأة بالذكاء الاصطناعي</h4>
                      <p className="text-sm text-pink-700">
                        إمكانية تعديل وتخصيص الأسئلة التي تم إنشاؤها بالذكاء الاصطناعي
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                      قريباً
                    </Badge>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                  <h3 className="text-lg font-bold mb-2">🚀 المنصة قيد التطوير النشط</h3>
                  <p className="text-blue-100 mb-4">
                    نعمل بجد لتقديم أفضل تجربة تعليمية تفاعلية. ميزات جديدة تُضاف باستمرار!
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>آخر تحديث: اليوم</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
