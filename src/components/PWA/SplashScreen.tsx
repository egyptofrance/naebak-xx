"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      {/* Animated Logo */}
      <div className="relative">
        {/* Logo */}
        <div className="relative z-10 animate-bounce-slow">
          <Image
            src="/logo-green.png"
            alt="نائبك"
            width={120}
            height={120}
            className="drop-shadow-2xl"
            priority
          />
        </div>

        {/* Loading dots */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>


    </div>
  );
}
