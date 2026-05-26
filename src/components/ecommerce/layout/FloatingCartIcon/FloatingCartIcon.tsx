'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/components/providers/StoreProvider';

export default function FloatingCartIcon() {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const itemCount = useAppStore((state) => state.getCartTotalItems());
  const displayItemCount = isMounted ? itemCount : 0;

  useEffect(() => {
    setIsMounted(true);
    
    if (position.x === 0 && position.y === 0) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const iconWidth = 56;
        const iconHeight = 56;
        
        setPosition({
          x: windowWidth - iconWidth - 20,
          y: windowHeight - iconHeight - 80
        });
      }
  }, [position.x, position.y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!iconRef.current) return;
    
    setIsDragging(true);
    const rect = iconRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!iconRef.current) return;
    
    setIsDragging(true);
    const rect = iconRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const windowWidth = window.innerWidth;
    const iconWidth = 56;
    const snapThreshold = windowWidth / 2;
    
    let newX = position.x;
    
    if (position.x < snapThreshold) {
      newX = 20;
    } else {
      newX = windowWidth - iconWidth - 20;
    }
    
    const windowHeight = window.innerHeight;
    const iconHeight = 56;
    const minY = 20;
    const maxY = windowHeight - iconHeight - 20;
    
    const newY = Math.max(minY, Math.min(maxY, position.y));
    
    setPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, dragOffset, position]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      ref={iconRef}
      className={`fixed z-50 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center cursor-move transition-all duration-300 max-sm:block sm:hidden ${
        isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <Link 
        href="/cart" 
        className="w-full h-full flex items-center justify-center"
        aria-label="View Cart"
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
          }
        }}
      >
        <ShoppingCart className="h-6 w-6" />
        {displayItemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black text-white border-2 border-white text-xs flex items-center justify-center font-bold">
            {displayItemCount > 99 ? '99+' : displayItemCount}
          </span>
        )}
      </Link>
    </div>
  );
} 