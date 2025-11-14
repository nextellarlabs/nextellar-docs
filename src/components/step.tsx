'use client';

import React from 'react';
import clsx from 'clsx';

// Utility function (replace with your actual implementation)
const cn = (...classes: any[]) => clsx(...classes);

export interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const stepsArray = React.Children.toArray(children).filter((child) =>
    React.isValidElement(child)
  );
  return (
    <div className={cn('relative space-y-8', className)} {...props}>
      {stepsArray.map((child, index) =>
        React.cloneElement(child as React.ReactElement<any>, {
          stepNumber: index + 1,
          isLast: index === stepsArray.length - 1,
        })
      )}
    </div>
  );
}

export interface StepProps {
  children: React.ReactNode;
  stepNumber?: number;
  isLast?: boolean;
  contentPosition?: 'right' | 'below';
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  lineClassName?: string;
  numberClassName?: string;
}

export function Step({
  children,
  stepNumber,
  isLast,
  contentPosition = 'below',
  className,
  titleClassName,
  contentClassName,
  lineClassName,
  numberClassName,
}: StepProps) {
  const childrenArray = React.Children.toArray(
    children
  ) as React.ReactElement[];
  const titleChild = childrenArray.find((child) => child.type === StepTitle);
  const contentChild = childrenArray.find(
    (child) => child.type === StepContent
  );

  const isHorizontal = contentPosition === 'right';

  return (
    <div
      className={clsx(
        'relative pl-12 group',
        className,
        isHorizontal ? 'flex items-start gap-6' : 'flex flex-col'
      )}
    >
      {/* Step number circle - minimalist design */}
      <div
        className={clsx(
          'absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full',
          'bg-black dark:bg-white',
          'text-white dark:text-black font-medium text-sm',
          'transition-all duration-200',
          numberClassName
        )}
      >
        {stepNumber}
      </div>

      {/* Connector line - simple and clean */}
      {!isLast && (
        <div
          className={clsx(
            'absolute left-[17px] top-9 w-[2px] bg-gray-200 dark:bg-gray-800',
            lineClassName
          )}
          style={{ height: 'calc(100% + 2rem)' }}
        />
      )}

      {isHorizontal ? (
        <>
          <div
            className={clsx(
              'font-medium text-base text-black dark:text-white',
              titleClassName
            )}
          >
            {titleChild}
          </div>
          <div
            className={clsx(
              'text-gray-600 dark:text-gray-400 text-sm leading-relaxed',
              contentClassName
            )}
          >
            {contentChild}
          </div>
        </>
      ) : (
        <>
          <div
            className={clsx(
              'font-medium text-base text-black dark:text-white mb-2',
              titleClassName
            )}
          >
            {titleChild}
          </div>
          <div
            className={clsx(
              'text-gray-600 dark:text-gray-400 text-sm leading-relaxed',
              'pb-8',
              contentClassName
            )}
          >
            {contentChild}
          </div>
        </>
      )}
    </div>
  );
}

export function StepTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function StepContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('prose prose-gray dark:prose-invert max-w-none', className)} {...props} />;
}

