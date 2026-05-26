'use client'

import { useActionState } from 'react'
import React, { useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Loader2 } from 'lucide-react'
import { createAdminUserAction } from '@/lib/actions/adminUserActions'
import type { AdminUserActionResult } from '@/types/adminUser'

const initialState: AdminUserActionResult = {
  success: false,
  message: "",
}

export function CreateAdminUserForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState<AdminUserActionResult, FormData>(
    createAdminUserAction, 
    initialState
  )

  useEffect(() => {
    if (state && state.message !== initialState.message) {
      if (state.success) {
      toast.success(state.message || 'Admin user created successfully!')
      formRef.current?.reset() 
      } else {
      toast.error(state.message)
      }
    }
  }, [state, initialState.message]) 

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-md">
      {state.success && state.message && (
        <Alert variant="default">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      {!state.success && state.message && state.message !== initialState.message && (
         <Alert variant="destructive">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <h2 className="text-xl font-semibold">Create New Admin User</h2>
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" type="text" placeholder="Admin Name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
        ) : (
          'Create Admin User'
        )}
      </Button>
    </form>
  )
} 