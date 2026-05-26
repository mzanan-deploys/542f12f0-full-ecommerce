'use client';

import React from 'react';
import type { StaticSectionItem } from '@/types/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface StaticItemProps {
  item: StaticSectionItem;
}

export function StaticItem({ item }: StaticItemProps) {
  return (
    <Card className="mb-4 shadow-sm bg-muted/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-semibold text-muted-foreground">{item.title}</CardTitle>
        {item.subtitle && (
          <CardDescription className="text-xs text-muted-foreground/80">{item.subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="py-2 px-4">
        <p className="text-sm text-muted-foreground/90">This is a static section and cannot be moved or edited here.</p>
      </CardContent>
    </Card>
  );
} 