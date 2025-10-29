import { WifiOff } from "lucide-react";

export const metadata = {
  title: "غير متصل بالإنترنت",
  description: "أنت غير متصل بالإنترنت حالياً",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          غير متصل بالإنترنت
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          يبدو أنك غير متصل بالإنترنت حالياً. بعض الميزات قد لا تعمل بشكل كامل.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>نصيحة:</strong> يمكنك تصفح الصفحات التي زرتها سابقاً حتى بدون إنترنت!
          </p>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
