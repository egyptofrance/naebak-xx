"use client";

interface BannerImageProps {
  src: string;
  alt: string;
}

export function BannerImage({ src, alt }: BannerImageProps) {
  return (
    <div className="w-full h-64 md:h-96 relative overflow-hidden bg-muted">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to gradient if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

