'use client';

import { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react';

type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'tip';

interface CalloutProps {
    type?: CalloutType;
    title?: string;
    children: ReactNode;
}

const calloutConfig = {
    info: {
        icon: Info,
        className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        iconClassName: 'text-blue-600 dark:text-blue-400',
        titleClassName: 'text-blue-900 dark:text-blue-200'
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        iconClassName: 'text-yellow-600 dark:text-yellow-400',
        titleClassName: 'text-yellow-900 dark:text-yellow-200'
    },
    error: {
        icon: AlertCircle,
        className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        iconClassName: 'text-red-600 dark:text-red-400',
        titleClassName: 'text-red-900 dark:text-red-200'
    },
    success: {
        icon: CheckCircle,
        className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        iconClassName: 'text-green-600 dark:text-green-400',
        titleClassName: 'text-green-900 dark:text-green-200'
    },
    tip: {
        icon: Lightbulb,
        className: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        iconClassName: 'text-purple-600 dark:text-purple-400',
        titleClassName: 'text-purple-900 dark:text-purple-200'
    }
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
    const config = calloutConfig[type];
    const Icon = config.icon;

    return (
        <div className={`my-6 p-4 border rounded-lg ${config.className}`}>
            <div className="flex gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClassName}`} />
                <div className="flex-1">
                    {title && (
                        <p className={`font-semibold mb-1 ${config.titleClassName}`}>
                            {title}
                        </p>
                    )}
                    <div className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
