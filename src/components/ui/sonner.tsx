"use client"

import React, { useEffect } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  useEffect(() => {
    const handleToastClick = (event: MouseEvent) => {
      const toastElement = (event.target as Element)?.closest('[data-sonner-toast]')
      if (toastElement) {
        // Don't dismiss if clicking on the close button
        const isCloseButton = (event.target as Element)?.closest('[data-close-button]')
        if (!isCloseButton) {
          // Simply dismiss all toasts when clicking on any part of a toast
          // This is simpler and more reliable than trying to get specific IDs
          const allToasts = document.querySelectorAll('[data-sonner-toast]')
          allToasts.forEach((toastEl) => {
            if (toastEl === toastElement) {
              // Find the toast ID from the data attributes
              const toastId = toastEl.getAttribute('data-toast-id') || toastEl.getAttribute('data-sonner-toast-id')
              if (toastId) {
                toast.dismiss(toastId)
              } else {
                // If no ID found, dismiss the latest toast
                toast.dismiss()
              }
            }
          })
        }
      }
    }

    document.addEventListener('click', handleToastClick)
    return () => document.removeEventListener('click', handleToastClick)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      closeButton
      toastOptions={{
        style: {
          direction: 'ltr',
        },
        classNames: {
          closeButton: 'absolute right-2 top-2 left-auto',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
