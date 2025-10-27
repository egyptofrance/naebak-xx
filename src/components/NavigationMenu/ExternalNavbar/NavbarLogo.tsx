import { Link } from "@/components/intl-link";
import Image from "next/image";

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="relative flex h-16 items-center justify-center">
        <Image
          src="/images/logo-naebak-white.png"
          width={64}
          height={64}
          alt="نائبك"
          className="object-contain"
        />
      </div>
    </Link>
  );
}

