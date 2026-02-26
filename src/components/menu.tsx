import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useClickOutside } from '@/hooks-d/use-click-outside';

// Type definitions
interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

// Available positions for the popup menu
type Position = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export const Menu: React.FC<MenuProps> = ({
  children,
  className = '',
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>('bottom-left');
  const [isPositioning, setIsPositioning] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const positioningTimerRef = useRef<number | null>(null);

  const isControlled =
    controlledOpen !== undefined && setControlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  // Clear positioning timer on unmount
  useEffect(() => {
    return () => {
      if (positioningTimerRef.current) {
        window.clearTimeout(positioningTimerRef.current);
      }
    };
  }, []);

  // Calculate initial position before opening
  const determineInitialPosition = (): Position => {
    if (!menuRef.current) return 'bottom-left';

    const triggerRect = menuRef.current.getBoundingClientRect();

    // Use estimated dimensions for initial calculation
    // We'll refine this once the popup is actually open
    const estimatedWidth = 200; // Reasonable default estimate
    const estimatedHeight = 200;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check horizontal space
    const hasSpaceRight =
      triggerRect.right + estimatedWidth <= viewportWidth - 16;

    // Check vertical space
    const hasSpaceBelow =
      triggerRect.bottom + estimatedHeight <= viewportHeight - 16;
    const hasSpaceAbove = triggerRect.top - estimatedHeight >= 16;

    // Determine best initial position
    if (hasSpaceBelow) {
      return hasSpaceRight ? 'bottom-left' : 'bottom-right';
    } else if (hasSpaceAbove) {
      return hasSpaceRight ? 'top-left' : 'top-right';
    }

    // Default fallback if no ideal position
    return 'bottom-left';
  };

  // Toggle handler with position pre-calculation
  const handleToggle = () => {
    if (!isOpen) {
      // Pre-calculate position before opening
      const initialPosition = determineInitialPosition();
      setPosition(initialPosition);
    }
    setIsOpen(!isOpen);
  };

  // Initial measurement of popup when it first opens
  useEffect(() => {
    if (isOpen && popupRef.current) {
      // Initial positioning with a slight delay to ensure the DOM is ready
      setIsPositioning(true);
      positioningTimerRef.current = window.setTimeout(() => {
        calculatePosition();
        setIsPositioning(false);
      }, 10);
    }
  }, [isOpen]);

  // Determine the best position for the menu based on available space
  const calculatePosition = () => {
    if (!menuRef.current || !popupRef.current || !isOpen) return;

    const triggerRect = menuRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check horizontal space
    const rightEdgePosition = triggerRect.right + popupRect.width;
    const leftEdgePosition = triggerRect.left - popupRect.width;

    const hasSpaceRight = rightEdgePosition <= viewportWidth - 16; // 16px safety margin
    const hasSpaceLeft = leftEdgePosition >= 16; // 16px safety margin

    // Check vertical space
    const bottomEdgePosition = triggerRect.bottom + popupRect.height;
    const topEdgePosition = triggerRect.top - popupRect.height;

    const hasSpaceBelow = bottomEdgePosition <= viewportHeight - 16; // 16px safety margin
    const hasSpaceAbove = topEdgePosition >= 16; // 16px safety margin

    // Determine best position with preference for current position if possible
    // This reduces unnecessary flipping when near borders
    let newPosition = position;

    // First check if current position is still valid
    const currentPositionValid = (() => {
      switch (position) {
        case 'bottom-left':
          return hasSpaceBelow && hasSpaceRight;
        case 'bottom-right':
          return hasSpaceBelow && hasSpaceLeft;
        case 'top-left':
          return hasSpaceAbove && hasSpaceRight;
        case 'top-right':
          return hasSpaceAbove && hasSpaceLeft;
      }
    })();

    if (!currentPositionValid) {
      // Find new valid position
      if (hasSpaceBelow) {
        newPosition = hasSpaceRight ? 'bottom-left' : 'bottom-right';
      } else if (hasSpaceAbove) {
        newPosition = hasSpaceRight ? 'top-left' : 'top-right';
      } else {
        // If no perfect position, prioritize visibility
        newPosition = 'bottom-left'; // Default fallback
      }
    }

    // Apply new position if changed
    if (newPosition !== position) {
      setPosition(newPosition);
    }
  };

  // Handle resize and scroll events
  useEffect(() => {
    const handleViewportChange = () => {
      if (isOpen && !isPositioning) {
        // Debounce positioning to prevent constant recalculation during resize
        if (positioningTimerRef.current) {
          window.clearTimeout(positioningTimerRef.current);
        }

        positioningTimerRef.current = window.setTimeout(() => {
          calculatePosition();
        }, 50);
      }
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, position, isPositioning]);

  // Close menu when clicking outside
  useClickOutside(menuRef, () => setIsOpen(false), { enabled: isOpen });

  return (
    <div
      ref={menuRef}
      className={`relative inline-block text-left ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === MenuTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: handleToggle,
              isOpen,
            });
          }
          if (child.type === PopMenu) {
            return isOpen
              ? React.cloneElement(child as React.ReactElement<any>, {
                onClose: () => setIsOpen(false),
                position: position,
                isPositioning: isPositioning,
                ref: popupRef,
              })
              : null;
          }
          return child;
        }
        return child;
      })}
    </div>
  );
};

interface MenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
}
export const MenuTrigger = React.forwardRef<
  HTMLButtonElement,
  MenuTriggerProps
>(({ className, onClick, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('cursor-pointer flex items-center justify-center', className)}
    onClick={onClick}
    aria-expanded={isOpen}
    {...props}
  />
));

MenuTrigger.displayName = 'MenuTrigger';

interface PopMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: Position;
  isPositioning?: boolean;
  onClose?: () => void;
}

// Forward ref to access the DOM node
export const PopMenu = React.forwardRef<HTMLDivElement, PopMenuProps>(
  (
    {
      className = '',
      position = 'bottom-left',
      isPositioning = false,
      ...props
    },
    ref
  ) => {
    // Position classes based on the calculated position
    const positionClasses = {
      'bottom-left': 'top-full left-0 mt-2',
      'bottom-right': 'top-full right-0 mt-2',
      'top-left': 'bottom-full left-0 mb-2',
      'top-right': 'bottom-full right-0 mb-2',
    };

    // Responsive width classes
    const widthClasses = 'min-w-[12rem]';

    return (
      <div
        ref={ref}
        className={`absolute z-10 ${positionClasses[position]} ${widthClasses} 
                 rounded-md shadow-sm overflow-hidden
                 bg-white dark:bg-black border border-border
                 transition-opacity duration-200 ${isPositioning ? 'opacity-0' : 'opacity-100'}
                 transform transition-transform duration-200 ${className}`}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="py-1 max-h-[80vh] overflow-y-auto" {...props} />
      </div>
    );
  }
);

PopMenu.displayName = 'PopMenu';

export const MenuItem = ({
  className,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type="button"
      className={cn(
        `cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                 hover:bg-gray-100 dark:hover:bg-gray-700`,
        className
      )}
      role="menuitem"
      onClick={onClick}
      {...props}
    />
  );
};
