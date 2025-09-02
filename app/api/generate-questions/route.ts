import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { topic, questionCount, questionType, difficulty, language } = await request.json()

    if (!topic) {
      return new Response("Topic is required", { status: 400 })
    }

    const systemPrompt = `أنت مساعد ذكي متخصص في إنشاء الأسئلة التعليمية. قم بإنشاء أسئلة تعليمية عالية الجودة باللغة العربية.

قواعد مهمة:
- اكتب الأسئلة والإجابات باللغة العربية فقط
- تأكد من أن الأسئلة واضحة ومناسبة للمستوى التعليمي
- للأسئلة متعددة الخيارات: قدم 4 خيارات مع إجابة واحدة صحيحة
- للأسئلة صح/خطأ: قدم عبارة واضحة
- للأسئلة المقالية: اطرح أسئلة تتطلب تفكير وشرح

تنسيق الإجابة يجب أن يكون JSON صالح بهذا الشكل:
{
  "questions": [
    {
      "question": "نص السؤال",
      "type": "multiple_choice" | "true_false" | "short_answer",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], // فقط للأسئلة متعددة الخيارات
      "correctAnswer": "الإجابة الصحيحة"
    }
  ]
}`

    const prompt = `قم بإنشاء ${questionCount} سؤال حول موضوع "${topic}" من نوع "${questionType}" بمستوى صعوبة "${difficulty}".

المتطلبات:
- الموضوع: ${topic}
- عدد الأسئلة: ${questionCount}
- نوع الأسئلة: ${questionType}
- مستوى الصعوبة: ${difficulty}
- اللغة: العربية

تأكد من أن الأسئلة متنوعة ومفيدة تعليمياً وتغطي جوانب مختلفة من الموضوع.`

    const result = streamText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: prompt,
      system: systemPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating questions:", error)
    return new Response("Failed to generate questions", { status: 500 })
  }
}
