import React from 'react';

export interface AdminPageTitleProps {
    title: string;
    description?: string;
    backButtonHref?: string;
    children?: React.ReactNode;
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  limit?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export interface SelectOption {
    label: string;
    value: string;
    group?: string;
}

export interface Option {
    label: string;
  value: string;
    group?: string; 
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export interface SetLayoutHeaderProps {
  set: any;
  isHomepageContext?: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStore {
  cache: Record<string, CacheEntry>;
  set: <T>(key: string, data: T, ttl?: number) => void;
  get: <T>(key: string) => T | null;
  remove: (key: string) => void;
  clear: () => void;
  isExpired: (key: string) => boolean;
  cleanup: () => void;
}
