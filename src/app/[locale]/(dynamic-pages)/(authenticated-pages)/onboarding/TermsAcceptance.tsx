import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, startOfMonth } from "date-fns";
import { useOnboarding } from "./OnboardingContext";

export function TermsAcceptance() {
  const { acceptTermsActionState } = useOnboarding();

  return (
    <>
      <CardHeader>
        <CardTitle
          data-testid="terms-acceptance-title"
          className="text-2xl font-bold mb-2"
        >
          مرحباً بك في نائبك
        </CardTitle>
        <CardDescription>
          يرجى قراءة شروط الخدمة قبل المتابعة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">شروط الخدمة</h3>
          <p className="text-sm text-muted-foreground mb-4">
            آخر تحديث: {format(startOfMonth(new Date()), "MMMM d, yyyy")}
          </p>
          <div className="max-h-40 overflow-y-auto text-sm space-y-3" dir="rtl">
            <p>
              مرحباً بكم في منصة نائبك، المنصة الرقمية التي تربط بين المواطنين وأعضاء مجلس النواب المصري. باستخدامك لهذه المنصة، فإنك توافق على الشروط والأحكام التالية.
            </p>
            <p>
              <strong>1. استخدام المنصة:</strong> توفر منصة نائبك وسيلة للتواصل المباشر مع نائبك في البرلمان، وتقديم الشكاوى والمقترحات، ومتابعة أداء النواب ومشاريعهم. يجب استخدام المنصة بشكل قانوني وأخلاقي.
            </p>
            <p>
              <strong>2. الخصوصية والبيانات:</strong> نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية. لن يتم مشاركة بياناتك مع أي طرف ثالث دون موافقتك، وسيتم استخدامها فقط لتحسين خدماتنا وتسهيل التواصل مع نائبك.
            </p>
            <p>
              <strong>3. المحتوى والمسؤولية:</strong> أنت مسؤول عن المحتوى الذي تنشره على المنصة. يجب أن يكون المحتوى محترماً وخالياً من الإساءة أو التحريض على العنف. نحتفظ بالحق في حذف أي محتوى يخالف هذه الشروط.
            </p>
            <p>
              <strong>4. حقوقك وواجباتك:</strong> لديك الحق في الوصول إلى بياناتك، وتعديلها، أو حذفها في أي وقت. كما يجب عليك الحفاظ على سرية بيانات حسابك وعدم مشاركتها مع الغير.
            </p>
            <p>
              <strong>5. التعديلات:</strong> نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال المنصة.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          data-testid="accept-terms-button"
          onClick={() => acceptTermsActionState.execute()}
          disabled={acceptTermsActionState.status === "executing"}
          className="w-full"
        >
          {acceptTermsActionState.status === "executing"
            ? "جاري القبول..."
            : "أوافق على الشروط"}
        </Button>
      </CardFooter>
    </>
  );
}
