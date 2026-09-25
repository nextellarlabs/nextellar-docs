'use client';

/**
 * Skip to Content Link
 *
 * Accessibility component that provides a keyboard-accessible link to skip
 * directly to the main content, bypassing navigation and sidebar on page load.
 *
 * Usage: Add at the start of a layout component before navigation/sidebar
 * The link is hidden by default and visible on keyboard focus
 */

export function SkipToContent() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:focus:bg-white dark:focus:text-black"
    >
      Skip to main content
    </a>
  );
}
