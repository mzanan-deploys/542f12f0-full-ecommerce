"use client"

import React from "react"
import { toast as sonnerToast } from "sonner"

// Custom toast function that makes the entire toast clickable to dismiss
export const toast = {
  success: (message: string, options?: any) => {
    return sonnerToast.success(message, {
      ...options,
      dismissible: true,
      closeButton: true,
    });
  },
  
  error: (message: string, options?: any) => {
    return sonnerToast.error(message, {
      ...options,
      dismissible: true,
      closeButton: true,
    });
  },
  
  info: (message: string, options?: any) => {
    return sonnerToast.info(message, {
      ...options,
      dismissible: true,
      closeButton: true,
    });
  },
  
  warning: (message: string, options?: any) => {
    return sonnerToast.warning(message, {
      ...options,
      dismissible: true,
      closeButton: true,
    });
  },
  
  custom: (jsx: (id: string | number) => React.ReactElement, options?: any) => {
    return sonnerToast.custom(jsx, {
      ...options,
      dismissible: true,
      closeButton: true,
    });
  },
  
  dismiss: sonnerToast.dismiss,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
}; 