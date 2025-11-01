import "@/styles/globals.css";
import { Tajawal } from "@/fonts/tajawal";
import { Metadata } from "next";
import { getMessages } from "next-intl/server";
import "server-only";
import { AffonsoWrapper } from "./AffonsoWrapper";
import { AppProviders } from "./AppProviders";
import { SchemaOrg } from "@/components/SchemaOrg";
import { PWARegister } from "@/components/PWA/PWARegister";
import { PWAInstallPrompt } from "@/components/PWA/PWAInstallPrompt";
import { SplashScreen } from "@/components/PWA/SplashScreen";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://naebak.com`,
  ),
  title: {
    default: "نائبك - المنصة الأولى للنواب في مصر",
    template: "%s | نائبك"
  },
  description: "المنصة الأولى التي تربط النواب بأبناء دوائرهم، توثق إنجازاتهم، وتبني سيرتهم الذاتية الحقيقية أمام الشعب",
  keywords: ["نائبك", "نواب مصر", "مجلس النواب", "برلمان مصر", "الدائرة الانتخابية", "شكاوى المواطنين", "إنجازات النواب"],
  authors: [{ name: "نائبك" }],
  creator: "نائبك",
  publisher: "نائبك",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo-green.png", sizes: "any" },
      { url: "/images/logo-black-main.ico", sizes: "any" }
    ],
    apple: "/logo-green.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "نائبك",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "https://naebak.com",
    siteName: "نائبك",
    title: "نائبك - المنصة الأولى للنواب في مصر",
    description: "المنصة الأولى التي تربط النواب بأبناء دوائرهم، توثق إنجازاتهم، وتبني سيرتهم الذاتية الحقيقية أمام الشعب",
    images: [
      {
        url: "https://naebak.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "نائبك - المنصة الأولى للنواب في مصر",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "نائبك - المنصة الأولى للنواب في مصر",
    description: "المنصة الأولى التي تربط النواب بأبناء دوائرهم، توثق إنجازاتهم، وتبني سيرتهم الذاتية الحقيقية أمام الشعب",
    images: ["https://naebak.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'OMkTrpPhr8fjxH3ZNJ5Ip0IFMbE1FiwvV8QJ8uZzBP4',
  },
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({
    locale: locale,
  });
  return (
    <html
      lang={locale}
      className={`${Tajawal.className} light`}
      suppressHydrationWarning
      style={{ colorScheme: 'light' }}
    >
      <head>
        <AffonsoWrapper />
        <SchemaOrg />
      </head>
      <body className="flex flex-col min-h-screen">
        <SplashScreen />
        <PWARegister />
        <AppProviders locale={locale} messages={messages}>
          {children}
          <PWAInstallPrompt />
        </AppProviders>
      </body>
    </html>
  );
}
