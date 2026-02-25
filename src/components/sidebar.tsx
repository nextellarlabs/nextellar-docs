'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import clsx from 'clsx';
import { cn } from '@/lib/utils';
import { useEventListener } from '../hooks-d/use-event-listener';
import { useToggle } from '../hooks-d/use-toggle';

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  side: 'left' | 'right';
  isMobile: boolean;
  maxWidth: number;
  toggleSidebar: () => void;
  showIconsOnCollapse: boolean;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  const checkIsMobile = React.useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  React.useEffect(() => {
    checkIsMobile();
  }, [checkIsMobile]);

  useEventListener('resize', checkIsMobile, window);

  return isMobile;
}

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
  defaultSide?: 'left' | 'right';
  defaultMaxWidth?: number;
  showIconsOnCollapse?: boolean;
  mobileView?: boolean;
}

export function SidebarProvider({
  defaultOpen = true,
  defaultSide = 'left',
  defaultMaxWidth = 280,
  showIconsOnCollapse = true,
  mobileView = true,
  ...props
}: SidebarProviderProps) {
  const useMobile = useIsMobile();

  const isMobile = mobileView ? useMobile : false;

  const [isOpen, { toggle: toggleSidebar, set: setIsOpen }] = useToggle(defaultOpen);
  const [side] = React.useState<'left' | 'right'>(defaultSide);
  const [maxWidth] = React.useState(defaultMaxWidth);

  // Add keyboard shortcut (Ctrl+B) to toggle sidebar
  useEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  }, window);

  const contextValue = React.useMemo(
    () => ({
      isOpen,
      setIsOpen,
      side,
      isMobile,
      maxWidth,
      toggleSidebar,
      showIconsOnCollapse,
    }),
    [
      isOpen,
      setIsOpen,
      side,
      isMobile,
      maxWidth,
      toggleSidebar,
      showIconsOnCollapse,
    ]
  );

  return <SidebarContext.Provider value={contextValue} {...props} />;
}

// For enabling multiple sidebars in a layout
export function SidebarLayout({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex min-h-screen w-full', className)} {...props} />
  );
}

// Component for main content between sidebars
export function MainContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col h-screen overflow-auto w-full', className)}
      {...props}
    />
  );
}

export function Sidebar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { isOpen, side, isMobile, maxWidth, setIsOpen, showIconsOnCollapse } =
    useSidebar();

  // For mobile: use a fixed overlay when sidebar is open
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
        <aside
          className={cn(
            `
            fixed top-0 bottom-0 z-50 flex flex-col overflow-hidden
            ${side === 'left' ? 'left-0' : 'right-0'}
            ${isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'}
            w-[85vw] max-w-[300px] bg-white dark:bg-black 
            ${side === 'left' ? 'border-r' : 'border-l'} border-border
            transition-transform duration-300 ease-in-out
          `,
            className
          )}
          style={{ maxWidth: `${maxWidth}px` }}
          {...props}
        >
          {children}
        </aside>
      </>
    );
  }

  // For desktop: use a fixed sidebar
  return (
    <aside
      className={clsx(
        `
        sticky top-0 bottom-0 z-0 flex flex-col h-screen
        ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'} border-border
        transition-all duration-300 ease-in-out
        bg-sidebar
      `,
        className
      )}
      style={{
        minWidth: isOpen ? `${maxWidth}px` : showIconsOnCollapse ? '4rem' : '0',
        width: !isOpen
          ? showIconsOnCollapse
            ? `${maxWidth / 4}px`
            : '0'
          : '0px',
      }}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen, showIconsOnCollapse } = useSidebar();

  // Extract the first child to show as icon when collapsed
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];

  return (
    <div
      className={cn(
        `
        flex items-center h-16 gap-2 border-b ${isOpen ? 'px-8' : ''} border-border
        ${isOpen ? '' : 'justify-center'}
      `,
        className
      )}
      {...props}
    >
      {isOpen
        ? children
        : showIconsOnCollapse && firstChild
          ? firstChild
          : null}
    </div>
  );
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen, showIconsOnCollapse } = useSidebar();
  return isOpen || showIconsOnCollapse ? (
    <div
      className={cn('flex-1 overflow-auto px-3 py-2', className)}
      {...props}
    />
  ) : null;
}

export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen, showIconsOnCollapse } = useSidebar();

  // Extract the first child to show as icon when collapsed
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];

  return (
    <div
      className={cn(
        `
        flex items-center h-16 border-t gap-2 ${isOpen ? 'px-4' : ''} border-border
        ${isOpen ? '' : 'justify-center'}
      `,
        className
      )}
      {...props}
    >
      {isOpen
        ? children
        : showIconsOnCollapse && firstChild
          ? firstChild
          : null}
    </div>
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen, showIconsOnCollapse } = useSidebar();
  return isOpen || showIconsOnCollapse ? (
    <nav className={cn('space-y-1 px-2', className)} {...props} />
  ) : null;
}

interface SidebarMenuItemProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  children?: React.ReactNode;
  isActive?: boolean;
  defaultOpen?: boolean;
  alwaysOpen?: boolean;
  isCollapsable?: boolean;
}

export function SidebarMenuItem({
  icon,
  label,
  href,
  children,
  isActive: propIsActive,
  defaultOpen = false,
  alwaysOpen = false,
  isCollapsable = false,
}: SidebarMenuItemProps) {
  const { isOpen, isMobile, setIsOpen } = useSidebar();
  const [isExpanded, setIsExpanded] = React.useState(defaultOpen || alwaysOpen);
  const pathname = usePathname();

  // Determine if this item is active based on the current path
  const isActive =
    propIsActive !== undefined
      ? propIsActive
      : href
        ? pathname === href || pathname.startsWith(href)
        : false;

  React.useEffect(() => {
    // If alwaysOpen is true, ensure the menu stays open
    if (alwaysOpen) {
      setIsExpanded(true);
    }
  }, [alwaysOpen]);

  const handleClick = (e: React.MouseEvent) => {
    if (children && !href && !alwaysOpen) {
      e.preventDefault();
      setIsExpanded((prev) => !prev);
    }
    // Close the sidebar if in mobile view when a link is clicked
    if (isMobile && href) {
      setIsOpen(false); // Close the sidebar
    }
  };
  const content = (
    <>
      <div className="flex items-center">
        {icon && (
          <span
            className={`${isActive ? 'font-medium' : 'text-gray-500 dark:text-gray-400'} ${isOpen ? 'mr-3' : ''}`}
          >
            {icon}
          </span>
        )}
        {isOpen && (
          <span
            className={`${isActive ? 'bg-accent text-accent-foreground' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {label}
          </span>
        )}
      </div>
      {isOpen && children && !alwaysOpen && isCollapsable && (
        <span className="ml-auto">
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </span>
      )}
    </>
  );

  return (
    <div>
      {href ? (
        <Link
          href={href}
          className={`
            flex items-center justify-between w-full p-2 rounded-md
            ${isActive
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent text-gray-700 dark:text-gray-300'
            }
            ${!isOpen ? 'justify-center' : ''}
          `}
          onClick={handleClick}
        >
          {content}
        </Link>
      ) : (
        <button
          className={`
            flex items-center justify-between w-full p-2 rounded-md
            ${isActive
              ? 'bg-sidebar text-blue-500'
              : 'hover:bg-accent text-gray-700 dark:text-gray-300'
            }
            ${!isOpen ? 'justify-center' : ''}
          `}
          onClick={handleClick}
        >
          {content}
        </button>
      )}

      {isOpen && (isExpanded || alwaysOpen) && children && (
        <div className="ml-6 mt-1 pl-3 border-l border-border space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

export function NestedLink({
  children,
  href = '#',
  isActive: propIsActive,
}: {
  children: React.ReactNode;
  href?: string;
  isActive?: boolean;
}) {
  const pathname = usePathname();
  const { isMobile, setIsOpen } = useSidebar();

  // Determine if this link is active based on the current path
  const isActive =
    propIsActive !== undefined
      ? propIsActive
      : pathname === href || pathname.startsWith(href);
  const handleClick = () => {
    // Close the sidebar if in mobile view when a link is clicked
    if (isMobile && href) {
      setIsOpen(false); // Close the sidebar
    }
  };
  return (
    <Link
      href={href}
      className={`
        block py-1.5 px-2 rounded-md text-sm transition-all
        ${isActive
          ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white font-medium border-l-2 border-black dark:border-white -ml-[2px]'
          : 'hover:bg-accent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }
      `}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

export function SidebarTrigger() {
  const { toggleSidebar, side, isOpen } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle sidebar"
    >
      {isOpen ? (
        side === 'left' ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </button>
  );
}

export function SidebarHeaderLogo({
  logo,
  className,
}: {
  logo?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'h-10 w-10 flex items-center justify-center truncate',
        className
      )}
    >
      {logo}
    </div>
  );
}

export function SidebarHeaderTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadElement>) {
  return (
    <h1
      className={cn(
        'text-3xl font-stretch-110% -tracking-tighter text-black dark:text-white truncate',
        className
      )}
      {...props}
    />
  );
}

export function UserAvatar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center',
        className
      )}
      {...props}
    />
  );
}
