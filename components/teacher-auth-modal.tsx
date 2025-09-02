"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Key, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface TeacherAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeacherAuthModal({ open, onOpenChange }: TeacherAuthModalProps) {
  const [teacherCode, setTeacherCode] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const TEACHER_ACCESS_CODE = "TEACHER2025"

  const handleTeacherAuth = () => {
    if (teacherCode === TEACHER_ACCESS_CODE && teacherName.trim()) {
      setLoading(true)

      const teacherAuth = {
        isAuthenticated: true,
        name: teacherName,
        timestamp: Date.now(),
      }

      localStorage.setItem("teacherAuth", JSON.stringify(teacherAuth))

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${teacherName}، يمكنك الآن الوصول لجميع ميزات المعلم`,
      })

      setTimeout(() => {
        setLoading(false)
        onOpenChange(false)
        router.push("/teacher")
      }, 1000)
    } else {
      toast({
        title: "خطأ في المصادقة",
        description: "رمز المعلم أو الاسم غير صحيح",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Shield className="h-5 w-5 text-primary" />
            دخول المعلم
          </DialogTitle>
          <DialogDescription className="text-right">أدخل رمز المعلم للوصول إلى لوحة التحكم</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <Key className="h-4 w-4 text-primary" />
              مصادقة المعلم
            </CardTitle>
            <CardDescription className="text-right">أدخل اسمك ورمز المعلم المقدم من الإدارة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherName" className="text-right block">
                اسم المعلم
              </Label>
              <Input
                id="teacherName"
                placeholder="أدخل اسمك"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherCode" className="text-right block">
                رمز المعلم
              </Label>
              <Input
                id="teacherCode"
                placeholder="أدخل رمز المعلم"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                className="font-mono text-center"
              />
            </div>
            <Button
              onClick={handleTeacherAuth}
              className="w-full"
              disabled={loading || !teacherCode.trim() || !teacherName.trim()}
            >
              دخول لوحة المعلم
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">للحصول على رمز المعلم:</p>
            <p>تواصل مع إدارة المنصة للحصول على رمز الدخول الخاص بالمعلمين</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
