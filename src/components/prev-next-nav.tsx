'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sidebarNav } from 'config/sidebar';

interface PrevNextNavProps {
  currentPath: string; // e.g., "/docs/cli/overview"
}

interface NavPage {
  title: string;
  href: string;
}

export default function PrevNextNav({ currentPath }: PrevNextNavProps) {
  const { prevPage, nextPage } = useMemo(() => {
    // Flatten all pages from sidebar navigation
    const allPages: NavPage[] = [];

    sidebarNav.forEach((section) => {
      if (section.pages) {
        section.pages.forEach((page) => {
          if (page.href) {
            allPages.push({
              title: page.title,
              href: page.href,
            });
          }
        });
      }
    });

    // Find current page index
    const currentIndex = allPages.findIndex(
      (page) => page.href === currentPath
    );

    if (currentIndex === -1) {
      return { prevPage: null, nextPage: null };
    }

    return {
      prevPage: currentIndex > 0 ? allPages[currentIndex - 1] : null,
      nextPage:
        currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null,
    };
  }, [currentPath]);

  if (!prevPage && !nextPage) {
    return null;
  }

  return (
    <nav className="mt-12 pt-6 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between gap-4">
        {prevPage ? (
          <Link
            href={prevPage.href}
            className="flex items-center gap-2 group flex-1 p-3 rounded-lg border border-[var(--color-border)] hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Previous
              </span>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {prevPage.title}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextPage ? (
          <Link
            href={nextPage.href}
            className="flex items-center gap-2 group flex-1 p-3 rounded-lg border border-[var(--color-border)] hover:bg-secondary transition-colors justify-end text-right"
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Next
              </span>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {nextPage.title}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}
