import { Link } from "@/components/intl-link";
import { Button } from "@/components/ui/button";
export function ExternalNavigationCTAButton({
  isLoggedIn = false,
  isLoading,
}: {
  isLoggedIn?: boolean;
  isLoading?: boolean;
}) {
  const href = isLoggedIn ? "/dashboard" : "/login";
  const text = isLoggedIn ? "إدارة حسابي" : "تسجيل الدخول";
  return (
    <Link href={href} className="w-full">
      <Button variant="default" size="default" className="group w-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 text-gray-900 dark:text-gray-100 font-semibold shadow-md hover:shadow-lg transition-all duration-200 border border-gray-300 dark:border-gray-600">
        {isLoading ? (
          "يرجى الانتظار..."
        ) : (
          <>
            {text}
            <svg
              className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </>
        )}
      </Button>
    </Link>
  );
}
