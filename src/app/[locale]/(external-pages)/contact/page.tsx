import { T } from "@/components/ui/Typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "اتصل بنا - نائبك",
  description: "تواصل معنا في منصة نائبك - نحن هنا لخدمتك",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl" dir="rtl">
      <div className="text-center mb-12">
        <T.H1 className="text-4xl font-bold mb-4">اتصل بنا</T.H1>
        <T.Large className="text-xl text-muted-foreground">
          نحن هنا لخدمتك والإجابة على استفساراتك
        </T.Large>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>
              <T.H2 className="text-2xl">معلومات التواصل</T.H2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <T.H3 className="text-lg font-semibold mb-1">الهاتف</T.H3>
                <T.P className="text-base">
                  <a 
                    href="tel:01026876269" 
                    className="text-primary hover:underline text-xl font-medium"
                    dir="ltr"
                  >
                    01026876269
                  </a>
                </T.P>
                <T.P className="text-sm text-muted-foreground mt-1">
                  متاح من السبت إلى الخميس
                </T.P>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <T.H3 className="text-lg font-semibold mb-1">البريد الإلكتروني</T.H3>
                <T.P className="text-base">
                  <a 
                    href="mailto:info@naebak.com" 
                    className="text-primary hover:underline"
                  >
                    info@naebak.com
                  </a>
                </T.P>
                <T.P className="text-sm text-muted-foreground mt-1">
                  سنرد على رسالتك في أقرب وقت ممكن
                </T.P>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <T.H3 className="text-lg font-semibold mb-1">ساعات العمل</T.H3>
                <T.P className="text-base">
                  السبت - الخميس: 9:00 صباحاً - 5:00 مساءً
                </T.P>
                <T.P className="text-sm text-muted-foreground mt-1">
                  (بتوقيت القاهرة)
                </T.P>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <T.H3 className="text-lg font-semibold mb-1">الموقع</T.H3>
                <T.P className="text-base">
                  جمهورية مصر العربية
                </T.P>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <T.H2 className="text-2xl">نموذج الاتصال</T.H2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  الموضوع
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="موضوع رسالتك"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  الرسالة
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="اكتب رسالتك هنا..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                إرسال الرسالة
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>
            <T.H2 className="text-2xl">لماذا التواصل معنا؟</T.H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <T.H3 className="text-lg font-semibold mb-2">الدعم الفني</T.H3>
              <T.P className="text-sm">
                نساعدك في حل أي مشكلة تقنية قد تواجهها في استخدام المنصة
              </T.P>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <span className="text-2xl">❓</span>
              </div>
              <T.H3 className="text-lg font-semibold mb-2">الاستفسارات</T.H3>
              <T.P className="text-sm">
                نجيب على جميع استفساراتك حول المنصة وكيفية استخدامها
              </T.P>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <span className="text-2xl">💡</span>
              </div>
              <T.H3 className="text-lg font-semibold mb-2">المقترحات</T.H3>
              <T.P className="text-sm">
                نرحب بمقترحاتك لتطوير المنصة وتحسين خدماتنا
              </T.P>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <T.H2 className="text-2xl">الأسئلة الشائعة</T.H2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <T.H3 className="text-lg font-semibold mb-2">كيف يمكنني التسجيل في المنصة؟</T.H3>
            <T.P className="text-base text-muted-foreground">
              يمكنك التسجيل من خلال الضغط على زر "تسجيل الدخول" في أعلى الصفحة واتباع الخطوات المطلوبة.
            </T.P>
          </div>
          <div>
            <T.H3 className="text-lg font-semibold mb-2">هل المنصة مجانية؟</T.H3>
            <T.P className="text-base text-muted-foreground">
              نعم، المنصة متاحة مجاناً لجميع المواطنين الراغبين في التواصل مع نوابهم.
            </T.P>
          </div>
          <div>
            <T.H3 className="text-lg font-semibold mb-2">كيف يمكنني التواصل مع نائبي؟</T.H3>
            <T.P className="text-base text-muted-foreground">
              بعد تسجيل الدخول، يمكنك البحث عن نائبك والتواصل معه مباشرة من خلال المنصة.
            </T.P>
          </div>
          <div>
            <T.H3 className="text-lg font-semibold mb-2">هل بياناتي آمنة؟</T.H3>
            <T.P className="text-base text-muted-foreground">
              نعم، نحن نلتزم بأعلى معايير الأمان والخصوصية لحماية بيانات مستخدمينا.
            </T.P>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

