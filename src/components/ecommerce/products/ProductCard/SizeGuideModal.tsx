'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import type { JsonValue } from '@/lib/schemas/sizeGuideTemplateSchema';

interface SizeGuideModalProps {
  sizeGuideData: JsonValue | null;
  productName?: string;
}

export function SizeGuideModal({ sizeGuideData, productName }: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sizeGuideData || typeof sizeGuideData !== 'object' || !sizeGuideData) {
    return null;
  }

  const guideData = sizeGuideData as any;
  
  const headers = guideData?.headers || [];
  const rows = guideData?.rows || [];

  if (!headers.length || !rows.length) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
          aria-label="Ver guía de talles"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Guía de Talles{productName ? ` - ${productName}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {headers.map((header: string, index: number) => (
                    <th
                      key={index}
                      className="border border-gray-300  text-left font-medium text-gray-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300  text-gray-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 