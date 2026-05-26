'use client';

import { useEffect, useRef } from 'react';

interface ImagePreloaderOptions {
  enabled?: boolean;
  priority?: boolean;
}

export function useImagePreloader(imageUrls: string[], options: ImagePreloaderOptions = {}) {
  const { enabled = true, priority = false } = options;
  const preloadedUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || imageUrls.length === 0) return;

    const preloadImage = (url: string) => {
      if (preloadedUrlsRef.current.has(url)) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      
      if (priority) {
        link.setAttribute('fetchpriority', 'high');
      }
      
      document.head.appendChild(link);
      preloadedUrlsRef.current.add(url);
    };

    const validUrls = imageUrls.filter(url => 
      url && 
      typeof url === 'string' && 
      url.trim() !== '' && 
      !url.includes('placeholder')
    );

    if (priority) {
      validUrls.slice(0, 3).forEach(preloadImage);
      setTimeout(() => {
        validUrls.slice(3).forEach(preloadImage);
      }, 100);
    } else {
      validUrls.forEach(preloadImage);
    }

  }, [imageUrls, enabled, priority]);
}

export function extractImageUrls(data: any): string[] {
  const urls: string[] = [];
  
  const extractFromItem = (item: any) => {
    if (item?.image_url) urls.push(item.image_url);
    if (item?.set_images) {
      item.set_images.forEach((img: any) => {
        if (img?.image_url) urls.push(img.image_url);
      });
    }
    if (item?.set_products) {
      item.set_products.forEach((sp: any) => {
        if (sp?.products?.product_images) {
          sp.products.product_images.forEach((img: any) => {
            if (img?.image_url) urls.push(img.image_url);
          });
        }
      });
    }
    if (item?.products) {
      item.products.forEach((product: any) => {
        if (product?.product_images) {
          product.product_images.forEach((img: any) => {
            if (img?.image_url) urls.push(img.image_url);
          });
        }
      });
    }
    if (item?.product_images) {
      item.product_images.forEach((img: any) => {
        if (img?.image_url) urls.push(img.image_url);
      });
    }
  };

  if (Array.isArray(data)) {
    data.forEach(extractFromItem);
  } else if (data) {
    extractFromItem(data);
    if (data.image_urls && Array.isArray(data.image_urls)) {
      urls.push(...data.image_urls);
    }
  }

  return Array.from(new Set(urls));
} 