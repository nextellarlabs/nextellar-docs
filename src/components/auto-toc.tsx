'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AlignLeft } from 'lucide-react';
import { useThrottle } from '@/hooks-d/use-throttle';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const AutoToc: React.FC = () => {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [rawActiveId, setRawActiveId] = useState<string>('');
  const activeId = useThrottle(rawActiveId, 100, { leading: true, trailing: true });

  // Extract headings from the page content
  useEffect(() => {
    const extractHeadings = () => {
      const mainContent = document.querySelector('main');
      if (!mainContent) return;

      const headingElements = mainContent.querySelectorAll('h2, h3');
      const extractedHeadings: Heading[] = [];

      headingElements.forEach((heading) => {
        const id = heading.id;
        const text = heading.textContent?.replace('#', '').trim() || '';
        const level = parseInt(heading.tagName[1]);

        if (id && text) {
          extractedHeadings.push({ id, text, level });
        }
      });

      setHeadings(extractedHeadings);
    };

    // Small delay to ensure MDX content is rendered
    const timer = setTimeout(extractHeadings, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Track which heading is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRawActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setRawActiveId(id);
      // Update URL hash without scrolling
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside className="fixed right-0 hidden xl:block w-64 p-6 top-16 border-l border-border h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="top-0 pb-2">
        <h2 className="flex flex-1 gap-2 items-center font-semibold text-foreground">
          <AlignLeft size={19} />
          On this page
        </h2>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={
                heading.level === 3
                  ? 'ml-4 border-l-2 border-gray-300 dark:border-gray-600 pl-3'
                  : ''
              }
            >
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`
                  text-left w-full text-sm transition-colors py-1
                  hover:text-foreground
                  ${
                    activeId === heading.id
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }
                `}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AutoToc;
