'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { AdminPageTitleProps } from '@/types/ui';

export function AdminPageTitle({ title, description, backButtonHref, children }: AdminPageTitleProps) {
    return (
        <div className="mb-6 flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
            <div className="mt-3 flex items-center gap-x-2 sm:mt-0 sm:ml-4">
            {backButtonHref && (
                    <Button asChild variant="outline" size="sm">
                        <Link href={backButtonHref}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                )}
                {children}
                </div>
        </div>
    );
} 