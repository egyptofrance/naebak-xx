import { T } from "@/components/ui/Typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن - نائبك",
  description: "منصة نائبك لإدارة التواصل بين المواطن ونائبه في مجالس الدولة المتنوعة",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl" dir="rtl">
      <div className="text-center mb-12">
        <T.H1 className="text-4xl font-bold mb-4">من نحن</T.H1>
        <T.Large className="text-xl text-muted-foreground">
          منصة نائبك - جسر التواصل بين المواطن ونائبه
        </T.Large>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <T.H2 className="text-2xl">رؤيتنا</T.H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <T.P className="text-lg leading-relaxed">
            نسعى في منصة نائبك إلى بناء جسر تواصل فعّال وشفاف بين المواطنين ونوابهم في مختلف مجالس الدولة. 
            نؤمن بأن التواصل المباشر والفعّال هو أساس الديمقراطية الحقيقية، ونعمل على تمكين كل مواطن من 
            إيصال صوته وآرائه ومطالبه إلى ممثليه في المجالس النيابية بكل سهولة ويسر.
          </T.P>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <T.H2 className="text-2xl">عن المنصة</T.H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <T.P className="text-lg leading-relaxed mb-4">
            منصة نائبك هي منصة إلكترونية متطورة لإدارة التواصل بين المواطن ونائبه في مجالس الدولة المتنوعة، 
            بما في ذلك:
          </T.P>
          <ul className="list-disc list-inside space-y-2 mr-6 text-lg">
            <li>مجلس النواب</li>
            <li>مجلس الشيوخ</li>
            <li>المجالس المحلية</li>
            <li>المجالس النيابية الأخرى</li>
          </ul>
          <T.P className="text-lg leading-relaxed mt-4">
            توفر المنصة أدوات متقدمة تمكن النواب من عرض برامجهم الانتخابية، إنجازاتهم، وفعالياتهم، 
            بينما تتيح للمواطنين متابعة أداء نوابهم والتواصل معهم بشكل مباشر وفعّال.
          </T.P>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <T.H2 className="text-2xl">مهمتنا</T.H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <T.P className="text-lg leading-relaxed">
            نهدف إلى تعزيز المشاركة المدنية وتمكين المواطنين من ممارسة دورهم الديمقراطي بفعالية. 
            نعمل على توفير منصة شاملة تجمع بين الشفافية والكفاءة والسهولة في الاستخدام، مما يساهم في:
          </T.P>
          <ul className="list-disc list-inside space-y-2 mr-6 text-lg mt-4">
            <li>تسهيل التواصل المباشر بين المواطنين ونوابهم</li>
            <li>تعزيز الشفافية في العمل النيابي</li>
            <li>تمكين المواطنين من متابعة أداء ممثليهم</li>
            <li>توفير قنوات فعّالة لتقديم الشكاوى والمقترحات</li>
            <li>دعم النواب في إدارة علاقاتهم مع ناخبيهم</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <T.H2 className="text-2xl">قيمنا</T.H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <T.H3 className="text-xl font-semibold mb-2">الشفافية</T.H3>
              <T.P className="text-base leading-relaxed">
                نؤمن بأهمية الشفافية في العمل النيابي وحق المواطن في معرفة ما يقوم به ممثلوه.
              </T.P>
            </div>
            <div>
              <T.H3 className="text-xl font-semibold mb-2">المشاركة</T.H3>
              <T.P className="text-base leading-relaxed">
                نشجع المشاركة الفعّالة للمواطنين في العملية الديمقراطية والحياة السياسية.
              </T.P>
            </div>
            <div>
              <T.H3 className="text-xl font-semibold mb-2">الكفاءة</T.H3>
              <T.P className="text-base leading-relaxed">
                نسعى لتوفير أدوات وحلول تقنية تساهم في تحسين كفاءة التواصل والعمل النيابي.
              </T.P>
            </div>
            <div>
              <T.H3 className="text-xl font-semibold mb-2">الشمولية</T.H3>
              <T.P className="text-base leading-relaxed">
                نعمل على إتاحة المنصة لجميع المواطنين بغض النظر عن خلفياتهم أو مستوياتهم التقنية.
              </T.P>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <T.H2 className="text-2xl">لماذا نائبك؟</T.H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <T.P className="text-lg leading-relaxed mb-4">
            في عصر التحول الرقمي، أصبح من الضروري توفير وسائل حديثة وفعّالة للتواصل بين المواطنين 
            ونوابهم. منصة نائبك تقدم حلاً متكاملاً يجمع بين:
          </T.P>
          <ul className="list-disc list-inside space-y-2 mr-6 text-lg">
            <li>تقنية حديثة وسهلة الاستخدام</li>
            <li>أمان وخصوصية عالية للبيانات</li>
            <li>واجهة عربية متكاملة تدعم اللغة العربية بشكل كامل</li>
            <li>نظام إدارة متقدم للنواب والمديرين</li>
            <li>قنوات متعددة للتواصل والمتابعة</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <T.P className="text-lg leading-relaxed text-center font-medium">
            نحن هنا لنكون صوتك في المجالس النيابية. انضم إلينا اليوم وكن جزءاً من التغيير الإيجابي 
            في مجتمعك.
          </T.P>
        </CardContent>
      </Card>
    </div>
  );
}

