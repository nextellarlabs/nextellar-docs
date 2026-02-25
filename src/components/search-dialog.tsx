'use client';

import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { useDebounce } from '@/hooks-d/use-debounce';
import { useKeyboardShortcut } from '@/hooks-d/use-keyboard-shortcut';
import { Dialog, DialogTrigger, DialogContent } from '@/components/dialog';
import { Input } from '@/components/input';
import SearchButton from '@/components/search-button';
import { Text, Search } from 'lucide-react';
import Link from 'next/link';

export interface DocType {
  title: string;
  body: { raw?: string };
  _raw: { flattenedPath: string };
}

export interface SearchDialogProps {
  searchData: DocType[];
}

export interface SearchDialogHandle {
  close: () => void;
  open: () => void;
}

// Strip markdown/HTML from raw MDX content for clean search display
function stripMarkdown(text: string): string {
  return (
    text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove markdown links, keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown headers
      .replace(/#{1,6}\s?/g, '')
      // Remove bold/italic
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      // Remove horizontal rules
      .replace(/---+/g, '')
      // Remove frontmatter
      .replace(/^---[\s\S]*?---/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-300 dark:text-black rounded-sm">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

function getSnippet(
  text: string,
  searchTerm: string,
  contextLength: number = 40
): React.ReactNode {
  if (!searchTerm) return text;
  const regex = new RegExp(searchTerm, 'i');
  const match = regex.exec(text);
  if (!match) return text;
  const start = Math.max(0, match.index - contextLength);
  const end = Math.min(
    text.length,
    match.index + match[0].length + contextLength
  );
  const snippet = text.substring(start, end);
  return (
    <>
      {start > 0 && '…'}
      {highlightText(snippet, searchTerm)}
      {end < text.length && '…'}
    </>
  );
}

const SearchDialog = forwardRef<SearchDialogHandle, SearchDialogProps>(
  ({ searchData }, ref) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300, true);

    useImperativeHandle(ref, () => ({
      close: () => setOpen(false),
      open: () => setOpen(true),
    }));

    useKeyboardShortcut('mod+k', () => setOpen(true));


    const filteredDocs = useMemo(() => {
      if (!debouncedQuery) return [];
      const q = debouncedQuery.toLowerCase();
      return searchData.filter((doc) => {
        const title = doc.title.toLowerCase();
        const description = stripMarkdown(doc.body.raw || '').toLowerCase();
        return title.includes(q) || description.includes(q);
      });
    }, [debouncedQuery, searchData]);

    return (
      <Dialog open={open} setOpen={setOpen}>
        <DialogTrigger className="hidden sm:block">
          <SearchButton size="sm" placeholder="Search documentation.." />
        </DialogTrigger>
        <DialogContent className="fixed h-auto sm:max-w-xl bg-muted p-2 top-40">
          {/* Close Button */}
          {/* <DialogCloseTrigger asChild>
          <button
            className="cursor-pointer border border-border text-lg absolute -top-2 -right-2 bg-muted text-black dark:text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
            aria-label="Close"
          >
            &times;
          </button>
        </DialogCloseTrigger> */}
          {/* <DialogHeader>
            <DialogTitle>Search Documentation</DialogTitle>
            <DialogDescription>Type below to search your docs.</DialogDescription>
          </DialogHeader> */}
          <div className="relative">
            <Input
              type="text"
              className="w-full bg-transparent focus:outline-none rounded-none border-t-0 border-x-0 border-border pl-10 pr-4 py-2"
              placeholder="Search the docs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search />
            </div>
          </div>
          <div className="mt-2 max-h-[300px] overflow-y-auto">
            {filteredDocs.length > 0 ? (
              <ul className="list-none p-0">
                {filteredDocs.map((doc) => (
                  <li
                    key={doc._raw.flattenedPath}
                    className="gap-2 py-2 border-b border-border"
                  >
                    <Link
                      href={`/docs/${doc._raw.flattenedPath}`}
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2 font-bold">
                          <Text /> <div>{highlightText(doc.title, debouncedQuery)}</div>
                        </div>
                        <div className="text-sm">
                          {getSnippet(
                            stripMarkdown(doc.body.raw || ''),
                            debouncedQuery
                          ) || 'No description'}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-center">
                {query.length > 0 ? 'No results found.' : 'Type to search'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

SearchDialog.displayName = 'SearchDialog';

export default SearchDialog;
