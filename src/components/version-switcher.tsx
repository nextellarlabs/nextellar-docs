'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/button';
import {
  getVersionFromPath,
  getSlugFromPath,
  buildVersionedUrl,
  getVersionOptions,
  getCurrentVersionLabel,
} from '@/lib/versions';
import { cn } from '@/lib/utils';

interface VersionSwitcherProps {
  className?: string;
}

export function VersionSwitcher({ className }: VersionSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [versions, setVersions] = React.useState<
    { label: string; path: string; isNext: boolean; version?: string }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const currentVersion = getVersionFromPath(pathname);
  const currentSlug = getSlugFromPath(pathname);
  const currentLabel = currentVersion
    ? `v${currentVersion}`
    : getCurrentVersionLabel();

  React.useEffect(() => {
    const loadVersions = async () => {
      try {
        const opts = await getVersionOptions();
        setVersions(opts);
      } catch (error) {
        console.error('Failed to load versions:', error);
        setVersions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersions();
  }, []);

  const handleVersionChange = (versionOrUndefined: string | undefined) => {
    setIsOpen(false);

    if (!currentSlug) {
      // If we're on a root page, just navigate to the version's root
      const targetPath = versionOrUndefined
        ? `/docs/v${versionOrUndefined}`
        : '/docs/current';
      router.push(targetPath);
      return;
    }

    // Navigate to the same page in the selected version
    const targetPath = buildVersionedUrl(versionOrUndefined, currentSlug);
    router.push(targetPath);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[120px] justify-between"
      >
        <span className="truncate text-sm font-medium">{currentLabel}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', {
          'rotate-180': isOpen,
        })} />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border bg-defaultBase shadow-lg z-50">
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Loading versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No versions available
              </div>
            ) : (
              <div className="py-1">
                {versions.map((version, idx) => (
                  <React.Fragment key={version.label}>
                    <button
                      onClick={() =>
                        handleVersionChange(
                          version.isNext ? undefined : version.version
                        )
                      }
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted',
                        {
                          'bg-muted font-medium':
                            currentLabel === version.label,
                          'text-muted-foreground': !version.isNext && !currentVersion && currentLabel === version.label,
                        }
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{version.label}</span>
                        {currentLabel === version.label && (
                          <span className="text-xs font-semibold">✓</span>
                        )}
                      </div>
                    </button>
                    {version.isNext && idx < versions.length - 1 && (
                      <div className="my-1 border-t border-border" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
