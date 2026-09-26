'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Terminal,
  Clock,
  Rocket,
  BookOpen,
  Code,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function NotFound() {
  const pathname = usePathname();

  // Check if this is a docs page that should show "Coming Soon"
  const isDocsPage = pathname?.startsWith('/docs/');
  const isComingSoon =
    isDocsPage &&
    (pathname?.includes('/components/balance-card') ||
      pathname?.includes('/components/transaction-list') ||
      pathname?.includes('/components/payment-form') ||
      pathname?.includes('/guides/testing') ||
      pathname?.includes('/guides/smart-contracts') ||
      pathname?.includes('/examples/nft-marketplace') ||
      pathname?.includes('/troubleshooting'));

  if (isComingSoon) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <style>{`
          @keyframes float-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          .animate-float-up { animation: float-up 0.6s ease-out; }
          .animate-pulse-glow { animation: pulse-glow 2s infinite; }
        `}</style>

        <div className="w-full max-w-2xl text-center">
          {/* Coming Soon Badge */}
          <div className="mb-8 animate-float-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Clock className="w-4 h-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-medium text-primary">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div
            className="mb-8 animate-float-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Rocket className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">Under Construction</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-2">
              This documentation page is currently being written.
            </p>
            <p className="text-muted-foreground">
              Check back soon for updates!
            </p>
          </div>

          {/* Path Info */}
          <div
            className="mb-8 p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm animate-float-up"
            style={{ animationDelay: '0.2s' }}
          >
            <p className="text-sm text-muted-foreground font-mono">
              {pathname}
            </p>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center animate-float-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Browse Documentation
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default 404 page
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <style>{`
        @keyframes code-slide {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-code-slide { animation: code-slide 0.4s ease-out; }
        .animate-cursor-blink { animation: cursor-blink 1s infinite; }
        .animate-float-up { animation: float-up 0.6s ease-out; }
      `}</style>

      <div className="w-full max-w-4xl">
        {/* Code Block Style Header */}
        <div className="mb-8 rounded-lg border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">
              error.log
            </span>
          </div>

          <div className="p-6 font-mono text-sm space-y-2">
            <div className="text-muted-foreground animate-code-slide">
              <span className="text-destructive">Error</span>: Page not found
            </div>
            <div
              className="text-muted-foreground animate-code-slide"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="text-blue-400">→</span> Status:{' '}
              <span className="text-orange-400">404</span>
            </div>
            <div
              className="text-muted-foreground animate-code-slide"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-blue-400">→</span> Path:{' '}
              <span className="text-purple-400">{pathname || 'undefined'}</span>
            </div>
            <div
              className="text-muted-foreground animate-code-slide"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="text-blue-400">→</span> Time:{' '}
              <span className="text-green-400">{new Date().toISOString()}</span>
            </div>
            <div
              className="text-foreground animate-code-slide"
              style={{ animationDelay: '0.4s' }}
            >
              <span className="animate-cursor-blink">_</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8 animate-float-up">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-2">
            <Terminal className="w-8 h-8" />
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            The requested resource doesn't exist. Let's get you back on track.
          </p>

          {/* Search Feature */}
          <SearchWithNavigation pathname={pathname} />
        </div>

        {/* Helpful Links Section */}
        <div
          className="mb-8 animate-float-up"
          style={{ animationDelay: '0.4s' }}
        >
          <h2 className="text-lg font-semibold mb-4 text-center">
            Helpful Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Getting Started */}
            <Link
              href="/docs/getting-started/introduction"
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Rocket className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-medium">Getting Started</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                New to Nextellar? Start here with quick-start guides.
              </p>
            </Link>

            {/* CLI Reference */}
            <Link
              href="/docs/cli/overview"
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-medium">CLI Commands</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn about Nextellar CLI commands and options.
              </p>
            </Link>

            {/* Guides & Docs */}
            <Link
              href="/docs/guides"
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-medium">Guides</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore comprehensive guides and best practices.
              </p>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center animate-float-up"
          style={{ animationDelay: '0.5s' }}
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Browse All Docs
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchWithNavigation({ pathname }: { pathname: string | null }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to docs and preserve search in URL
      router.push(`/docs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative mb-8 max-w-sm mx-auto animate-float-up"
      style={{ animationDelay: '0.2s' }}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder="Search documentation..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
