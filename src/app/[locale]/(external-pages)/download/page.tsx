import { Smartphone, Download, Check, Zap, Bell, Wifi } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "تحميل تطبيق نائبك",
  description: "حمّل تطبيق نائبك على هاتفك واحصل على تجربة أفضل مع إشعارات فورية وعمل بدون إنترنت",
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-green-600 rounded-3xl flex items-center justify-center shadow-xl">
              <Image
                src="/logo-green.png"
                alt="نائبك"
                width={80}
                height={80}
                className="brightness-0 invert"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            حمّل تطبيق نائبك
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            احصل على تجربة أفضل مع التطبيق - إشعارات فورية، عمل بدون إنترنت، وسرعة فائقة!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                if ("beforeinstallprompt" in window) {
                  // Will be handled by PWAInstallPrompt component
                  alert("اضغط على زر 'إضافة إلى الشاشة الرئيسية' في متصفحك");
                } else {
                  alert("افتح هذه الصفحة في Chrome أو Safari لتثبيت التطبيق");
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Download className="w-6 h-6" />
              تثبيت التطبيق الآن
            </button>
            
            <a
              href="#how-to-install"
              className="text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-2"
            >
              كيفية التثبيت؟
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            لماذا التطبيق؟
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                سرعة فائقة
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تحميل أسرع وأداء أفضل من المتصفح العادي
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                إشعارات فورية
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                اعرف فوراً عند رد النائب على شكواك
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                يعمل بدون إنترنت
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تصفح الصفحات التي زرتها حتى بدون اتصال
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Install Section */}
      <div id="how-to-install" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            كيفية تثبيت التطبيق
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Android Chrome */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    أندرويد (Chrome)
                  </h3>
                  <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>افتح الموقع في متصفح Chrome</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>اضغط على القائمة (⋮) في الأعلى</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>اختر "إضافة إلى الشاشة الرئيسية"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>اضغط "تثبيت" أو "إضافة"</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* iOS Safari */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    آيفون (Safari)
                  </h3>
                  <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>افتح الموقع في متصفح Safari</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>اضغط على زر المشاركة (□↑) في الأسفل</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>اضغط "إضافة"</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            أسئلة شائعة
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                هل التطبيق مجاني؟
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                نعم، التطبيق مجاني 100% ولا يحتاج أي رسوم.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                هل يحتاج مساحة كبيرة؟
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                لا، التطبيق خفيف جداً ولا يحتاج أكثر من 5 ميجابايت.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                هل يعمل على جميع الهواتف؟
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                نعم، يعمل على أندرويد وآيفون بدون مشاكل.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
