"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Key, Users, BookOpen, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface TeacherAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeacherAuthModal({ open, onOpenChange }: TeacherAuthModalProps) {
  const [masterCode, setMasterCode] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [schoolCode, setSchoolCode] = useState("")
  const [personalCode, setPersonalCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const MASTER_TEACHER_CODE = "TEACHER2025"
  const VALID_SCHOOL_CODES = ["SCHOOL123", "EDU2025", "LEARN456"]
  const VALID_PERSONAL_CODES = ["MATH001", "SCI002", "ARAB003", "ENG004", "HIST005"]

  const handleMasterCodeAuth = () => {
    if (masterCode === MASTER_TEACHER_CODE && teacherName.trim()) {
      authenticateTeacher("master", teacherName)
    } else {
      toast({
        title: "خطأ في المصادقة",
        description: "رمز المعلم الرئيسي أو الاسم غير صحيح",
        variant: "destructive",
      })
    }
  }

  const handleSchoolCodeAuth = () => {
    if (VALID_SCHOOL_CODES.includes(schoolCode) && teacherName.trim()) {
      authenticateTeacher("school", teacherName, schoolCode)
    } else {
      toast({
        title: "خطأ في المصادقة",
        description: "رمز المدرسة أو الاسم غير صحيح",
        variant: "destructive",
      })
    }
  }

  const handlePersonalCodeAuth = () => {
    if (VALID_PERSONAL_CODES.includes(personalCode) && teacherName.trim()) {
      authenticateTeacher("personal", teacherName, personalCode)
    } else {
      toast({
        title: "خطأ في المصادقة",
        description: "الرمز الشخصي أو الاسم غير صحيح",
        variant: "destructive",
      })
    }
  }

  const authenticateTeacher = (method: string, name: string, code?: string) => {
    setLoading(true)

    const teacherAuth = {
      isAuthenticated: true,
      name: name,
      method: method,
      code: code,
      timestamp: Date.now(),
    }

    localStorage.setItem("teacherAuth", JSON.stringify(teacherAuth))

    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: `مرحباً ${name}، يمكنك الآن الوصول لجميع ميزات المعلم`,
    })

    setTimeout(() => {
      setLoading(false)
      onOpenChange(false)
      router.push("/teacher")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Shield className="h-5 w-5 text-primary" />
            مصادقة المعلم
          </DialogTitle>
          <DialogDescription className="text-right">اختر إحدى طرق المصادقة للوصول إلى لوحة المعلم</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="master" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="master">الرمز الرئيسي</TabsTrigger>
            <TabsTrigger value="school">رمز المدرسة</TabsTrigger>
            <TabsTrigger value="personal">رمز شخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="master" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Key className="h-4 w-4 text-primary" />
                  الرمز الرئيسي للمعلمين
                </CardTitle>
                <CardDescription className="text-right">رمز موحد لجميع المعلمين في المنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherName1" className="text-right block">
                    اسم المعلم
                  </Label>
                  <Input
                    id="teacherName1"
                    placeholder="أدخل اسمك"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="masterCode" className="text-right block">
                    الرمز الرئيسي
                  </Label>
                  <Input
                    id="masterCode"
                    placeholder="أدخل الرمز الرئيسي"
                    value={masterCode}
                    onChange={(e) => setMasterCode(e.target.value.toUpperCase())}
                    className="font-mono text-center"
                  />
                </div>
                <Button
                  onClick={handleMasterCodeAuth}
                  className="w-full"
                  disabled={loading || !masterCode.trim() || !teacherName.trim()}
                >
                  دخول بالرمز الرئيسي
                </Button>
                <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
                  💡 الرمز الرئيسي: TEACHER2025
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="school" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Users className="h-4 w-4 text-secondary" />
                  رمز المدرسة
                </CardTitle>
                <CardDescription className="text-right">رمز خاص بمدرستك أو مؤسستك التعليمية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherName2" className="text-right block">
                    اسم المعلم
                  </Label>
                  <Input
                    id="teacherName2"
                    placeholder="أدخل اسمك"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode" className="text-right block">
                    رمز المدرسة
                  </Label>
                  <Input
                    id="schoolCode"
                    placeholder="أدخل رمز المدرسة"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    className="font-mono text-center"
                  />
                </div>
                <Button
                  onClick={handleSchoolCodeAuth}
                  className="w-full bg-secondary hover:bg-secondary/90"
                  disabled={loading || !schoolCode.trim() || !teacherName.trim()}
                >
                  دخول برمز المدرسة
                </Button>
                <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
                  💡 أرمزة المدارس: SCHOOL123, EDU2025, LEARN456
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <BookOpen className="h-4 w-4 text-accent" />
                  الرمز الشخصي
                </CardTitle>
                <CardDescription className="text-right">رمز خاص بك كمعلم أو بمادتك الدراسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacherName3" className="text-right block">
                    اسم المعلم
                  </Label>
                  <Input
                    id="teacherName3"
                    placeholder="أدخل اسمك"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalCode" className="text-right block">
                    الرمز الشخصي
                  </Label>
                  <Input
                    id="personalCode"
                    placeholder="أدخل رمزك الشخصي"
                    value={personalCode}
                    onChange={(e) => setPersonalCode(e.target.value.toUpperCase())}
                    className="font-mono text-center"
                  />
                </div>
                <Button
                  onClick={handlePersonalCodeAuth}
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={loading || !personalCode.trim() || !teacherName.trim()}
                >
                  دخول بالرمز الشخصي
                </Button>
                <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
                  💡 أرمزة شخصية: MATH001, SCI002, ARAB003, ENG004, HIST005
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <p className="font-medium mb-1">ملاحظة أمنية:</p>
            <p>هذه الأرمزة مؤقتة لأغراض التجريب. في النسخة النهائية سيتم استخدام نظام مصادقة أكثر تقدماً.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
