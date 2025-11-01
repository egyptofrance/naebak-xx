"use client";

/**
 * SkipToContent Component
 * 
 * Provides a "Skip to Content" link for keyboard and screen reader users.
 * The link is visually hidden by default and becomes visible when focused.
 * 
 * Accessibility Features:
 * - Allows keyboard users to bypass navigation and go directly to main content
 * - Meets WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks)
 * - Uses semantic HTML with proper ARIA attributes
 */

export function SkipToContent() {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="skip-to-content"
      aria-label="تخطى إلى المحتوى الرئيسي"
    >
      تخطى إلى المحتوى
    </a>
  );
}
