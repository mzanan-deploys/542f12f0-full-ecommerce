'use client';

import React from 'react';
import { useDisclaimer } from './useDisclaimer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Disclaimer() {
  const { form, isLoading, isPending, onSubmit } = useDisclaimer();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-black dark:text-white">Disclaimer Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
          <CardDescription>
            Set the text displayed in the disclaimer banner across the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="disclaimerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disclaimer Banner Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter disclaimer text here..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending || isLoading}>
                  {isPending ? 'Saving...' : 'Save Disclaimer'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 