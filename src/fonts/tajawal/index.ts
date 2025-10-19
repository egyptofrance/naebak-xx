import localFont from "next/font/local";

export const Tajawal = localFont({
  src: [
    {
      path: "./Tajawal-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Tajawal-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Tajawal-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Tajawal-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-tajawal",
  display: "swap",
});

