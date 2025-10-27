import { Link } from "@/components/intl-link";
import Image from "next/image";

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center flex-shrink-0">
      <div className="relative flex h-12 md:h-16 items-center justify-center">
        <Image
          src="/images/logo-naebak-white.png"
          width={48}
          height={48}
          alt="نائبك"
          className="object-contain w-12 h-12 md:w-16 md:h-16"
        />
      </div>
    </Link>
  );
}

