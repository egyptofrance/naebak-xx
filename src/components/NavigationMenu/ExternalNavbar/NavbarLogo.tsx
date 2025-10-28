import { Link } from "@/components/intl-link";
import Image from "next/image";

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center flex-shrink-0">
      <div className="relative flex items-center justify-center">
        <Image
          src="/images/logo-naebak-white.png"
          width={200}
          height={67}
          alt="نائبك"
          className="object-contain h-12 md:h-14 w-auto"
        />
      </div>
    </Link>
  );
}

