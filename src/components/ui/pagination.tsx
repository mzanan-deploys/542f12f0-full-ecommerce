'use client';

import React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface BaseProps {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

interface ClientProps extends BaseProps {
  onPageChange: (page: number) => void;
  baseUrl?: never;
  searchParams?: never;
}

interface ServerProps extends BaseProps {
  onPageChange?: never;
  baseUrl: string;
  searchParams?: URLSearchParams;
}

type PaginationProps = ClientProps | ServerProps;

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  searchParams,
  disabled = false,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  const isServerMode = !!baseUrl;

  const getVisiblePages = () => {
    const pages: number[] = [];

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  const createUrl = (page: number) => {
    if (!isServerMode) return '#';
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `${baseUrl}?${params.toString()}`;
  };

  const renderButton = (
    page: number,
    content: React.ReactNode,
    props: Partial<ButtonProps> = {},
    isPageNumber = false
  ) => {
    const commonProps: ButtonProps = {
      variant: isPageNumber ? (page === currentPage ? 'default' : 'outline') : 'outline',
      size: 'sm',
      disabled: disabled || props.disabled,
      className: props.className,
    };

    if (isServerMode) {
      return (
        <Link href={createUrl(page)} passHref>
          <Button {...commonProps}>{content}</Button>
        </Link>
      );
    }

    return (
      <Button {...commonProps} onClick={() => onPageChange?.(page)}>
        {content}
      </Button>
    );
  };

  return (
    <div className={cn('flex items-center justify-end gap-2 mt-4', className)}>
      {renderButton(currentPage - 1, <><ChevronLeft className="h-4 w-4" /> Previous</>, {
        disabled: currentPage <= 1,
        className: 'flex items-center gap-1',
      })}

      <div className="flex items-center gap-1">
        {visiblePages[0] > 1 && (
          <>
            {renderButton(1, 1, {}, true)}
            {visiblePages[0] > 2 && <span className="px-2 text-muted-foreground">...</span>}
          </>
        )}
        {visiblePages.map((p) => (
          <React.Fragment key={p}>{renderButton(p, p, {}, true)}</React.Fragment>
        ))}
        {visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
            {renderButton(totalPages, totalPages, {}, true)}
          </>
        )}
      </div>

      {renderButton(currentPage + 1, <>Next <ChevronRight className="h-4 w-4" /></>, {
        disabled: currentPage >= totalPages,
        className: 'flex items-center gap-1',
      })}
    </div>
  );
}
