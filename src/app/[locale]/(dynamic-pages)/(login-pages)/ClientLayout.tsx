"use client";
import { type ReactNode } from "react";
import "./graphic-background.css";
import Image from "next/image";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lg:flex h-screen border-2 border-black">
      <div className="lg:w-2/5 p-8 flex items-center relative justify-center h-full bg-background">
        <div className="max-w-xl md:min-w-[450px]">{children}</div>
      </div>
      <div className="hidden lg:flex w-3/5 border-l-2 items-center relative justify-center h-full bg-white">
        <div className="w-full px-32 flex items-center justify-center">
          <Image
            src="/images/logo-naebak-green.png"
            alt="نائبك Logo"
            width={400}
            height={400}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
