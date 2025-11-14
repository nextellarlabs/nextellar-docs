'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder as FolderIcon } from 'lucide-react';

// Utility function
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

type FolderTreeContextType = {
  indentSize: number;
};

const FolderTreeContext = createContext<FolderTreeContextType>({
  indentSize: 16,
});

export function FolderTree({
  children,
  className,
  indentSize = 16,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  indentSize?: number;
}) {
  return (
    <FolderTreeContext.Provider value={{ indentSize }}>
      <div
        className={cn(
          'text-sm border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-black',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </FolderTreeContext.Provider>
  );
}

export function Folder({
  children,
  element,
  defaultOpen = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  element: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { indentSize } = useContext(FolderTreeContext);

  return (
    <div className={cn('select-none', className)} {...props}>
      <FolderLabel
        name={element}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div
          className="pl-4 border-l border-gray-200 dark:border-gray-800 ml-3 mt-0.5"
          style={{ marginLeft: indentSize / 2 }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function File({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('select-none', className)} {...props}>
      <FileLabel>{children}</FileLabel>
    </div>
  );
}

function FolderLabel({
  name,
  isOpen,
  onClick,
}: {
  name: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
      onClick={onClick}
    >
      <ChevronIcon isOpen={isOpen} />
      <FolderIconComponent />
      <span className="text-sm text-black dark:text-white font-medium">{name}</span>
    </div>
  );
}

function FileLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900">
      <div className="w-4 h-4" /> {/* Spacer for alignment */}
      <FileIconComponent />
      <span className="text-sm text-gray-600 dark:text-gray-400">{children}</span>
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-4 h-4 flex items-center justify-center text-gray-600 dark:text-gray-400">
      {isOpen ? (
        <ChevronDown className="w-3.5 h-3.5" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5" />
      )}
    </div>
  );
}

function FolderIconComponent() {
  return (
    <div className="w-4 h-4 flex items-center justify-center text-gray-600 dark:text-gray-400">
      <FolderIcon className="w-4 h-4" />
    </div>
  );
}

function FileIconComponent() {
  return (
    <div className="w-4 h-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
      <FileText className="w-4 h-4" />
    </div>
  );
}
