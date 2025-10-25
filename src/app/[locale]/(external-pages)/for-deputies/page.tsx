import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'ForDeputiesPage' });
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function ForDeputiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#004030] via-[#005040] to-[#003020] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F87B1B] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F87B1B] rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              انضم إلى <span className="text-[#F87B1B]">نائبك.com</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              المنصة الأولى التي تربطك بأبناء دائرتك وتوثق إنجازاتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/sign-up" 
                className="bg-[#F87B1B] hover:bg-[#E6690A] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                ابدأ الآن مجاناً
              </Link>
              <a 
                href="#features" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg transition-all border-2 border-white/30"
              >
                اكتشف المميزات
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#F87B1B] mb-2">1000+</div>
              <div className="text-gray-600">نائب مسجل</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#004030] mb-2">50K+</div>
              <div className="text-gray-600">مواطن نشط</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#F87B1B] mb-2">10K+</div>
              <div className="text-gray-600">شكوى تم حلها</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#004030] mb-2">27</div>
              <div className="text-gray-600">محافظة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              لماذا <span className="text-[#F87B1B]">نائبك.com</span>؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              منصة شاملة توثق كل نشاطاتك وإنجازاتك وتربطك بأبناء دائرتك بشكل مباشر وفعال
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Feature 1: Events */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F87B1B] to-[#E6690A] rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">توثيق المناسبات</h3>
              <p className="text-gray-600 leading-relaxed">
                سجّل حضورك في الأفراح، العزاءات، والفعاليات المجتمعية. كل مناسبة تحضرها تُضاف إلى سجلك وتظهر لأبناء دائرتك.
              </p>
            </div>

            {/* Feature 2: Achievements */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#004030] to-[#003020] rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">سجل الإنجازات</h3>
              <p className="text-gray-600 leading-relaxed">
                وثّق كل مشكلة حلّيتها لمواطن. اعرض إنجازاتك بشكل واضح ومنظم. اصنع سيرة ذاتية حقيقية للشعب.
              </p>
            </div>

            {/* Feature 3: Electoral Program */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F87B1B] to-[#E6690A] rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">البرنامج الانتخابي</h3>
              <p className="text-gray-600 leading-relaxed">
                اعرض برنامجك الانتخابي وأهدافك بوضوح. دع المواطنين يعرفون رؤيتك وما تخطط لتحقيقه.
              </p>
            </div>

            {/* Feature 4: Personal Profile */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#004030] to-[#003020] rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">صفحة شخصية احترافية</h3>
              <p className="text-gray-600 leading-relaxed">
                اعرض بياناتك الشخصية، خلفيتك، وخبراتك. دع أبناء دائرتك يتعرفون عليك بشكل أعمق وأكثر واقعية.
              </p>
            </div>

            {/* Feature 5: Direct Communication */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F87B1B] to-[#E6690A] rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">تواصل مباشر</h3>
              <p className="text-gray-600 leading-relaxed">
                استقبل الشكاوى والمقترحات مباشرة من المواطنين. رد عليهم وحل مشاكلهم بكفاءة وشفافية.
              </p>
            </div>

            {/* Feature 6: Rating System */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#004030] to-[#003020] rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">نظام التقييم</h3>
              <p className="text-gray-600 leading-relaxed">
                احصل على تقييمات من المواطنين. كلما زاد أداؤك، زاد تقييمك وثقة الناخبين بك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              كيف يعمل <span className="text-[#F87B1B]">نائبك.com</span>؟
            </h2>
            <p className="text-xl text-gray-600">ثلاث خطوات بسيطة للبدء</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#F87B1B] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">سجّل حسابك</h3>
                <p className="text-gray-600">
                  أنشئ حسابك مجاناً وأكمل بياناتك الشخصية والانتخابية
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#004030] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">وثّق نشاطاتك</h3>
                <p className="text-gray-600">
                  سجّل مناسباتك، إنجازاتك، وفعالياتك بشكل منتظم
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#F87B1B] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">تواصل مع دائرتك</h3>
                <p className="text-gray-600">
                  استقبل الشكاوى، حل المشاكل، وابنِ علاقة قوية مع ناخبيك
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-[#004030] to-[#003020] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              ماذا تستفيد كنائب؟
            </h2>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border-r-4 border-[#F87B1B]">
                <h3 className="text-xl font-bold mb-2">📊 سيرة ذاتية حية للشعب</h3>
                <p className="text-gray-200">
                  كل نشاط تقوم به يُسجل ويُعرض. أبناء دائرتك يرون جهودك الحقيقية وليس مجرد وعود.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border-r-4 border-[#F87B1B]">
                <h3 className="text-xl font-bold mb-2">🎯 زيادة الثقة والمصداقية</h3>
                <p className="text-gray-200">
                  الشفافية في عرض إنجازاتك تزيد من ثقة المواطنين بك وتعزز فرصك في الانتخابات القادمة.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border-r-4 border-[#F87B1B]">
                <h3 className="text-xl font-bold mb-2">💡 فهم احتياجات دائرتك</h3>
                <p className="text-gray-200">
                  من خلال الشكاوى والمقترحات، تفهم بدقة ما يحتاجه أبناء دائرتك وتستطيع خدمتهم بشكل أفضل.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border-r-4 border-[#F87B1B]">
                <h3 className="text-xl font-bold mb-2">🔗 تواصل مستمر وفعال</h3>
                <p className="text-gray-200">
                  لا تنتظر الانتخابات لتتواصل مع ناخبيك. ابقَ على تواصل دائم واصنع علاقة قوية ومستدامة.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border-r-4 border-[#F87B1B]">
                <h3 className="text-xl font-bold mb-2">📈 قياس أدائك</h3>
                <p className="text-gray-200">
                  نظام التقييم والإحصائيات يساعدك على معرفة مستوى أدائك وتحسينه باستمرار.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#F87B1B] to-[#E6690A] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            جاهز للانضمام؟
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            انضم الآن إلى مئات النواب الذين يستخدمون نائبك.com لخدمة دوائرهم بشكل أفضل
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-up" 
              className="bg-white text-[#F87B1B] hover:bg-gray-100 px-10 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              ابدأ الآن - مجاناً
            </Link>
            <Link 
              href="/contact" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-lg font-bold text-lg transition-all border-2 border-white"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              أسئلة شائعة
            </h2>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">هل التسجيل مجاني؟</h3>
                <p className="text-gray-600">
                  نعم، التسجيل والاستخدام الأساسي مجاني تماماً لجميع النواب.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">كيف أوثق إنجازاتي؟</h3>
                <p className="text-gray-600">
                  من خلال لوحة التحكم الخاصة بك، يمكنك إضافة إنجازاتك ومناسباتك بسهولة مع إمكانية إرفاق صور ووثائق.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">هل بياناتي آمنة؟</h3>
                <p className="text-gray-600">
                  نعم، نستخدم أحدث تقنيات الأمان لحماية بياناتك الشخصية والمهنية.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">كيف يتواصل معي المواطنون؟</h3>
                <p className="text-gray-600">
                  من خلال نظام الشكاوى والرسائل المدمج في المنصة. تستقبل إشعارات فورية بكل رسالة جديدة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

