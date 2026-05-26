'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar/AdminSidebar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader/AdminHeader';
import { ThemeToggle } from "@/components/shared/ThemeToggle/ThemeToggle";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const AdminLayout = React.memo(function AdminLayout({ 
  children, 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const isAdminLoginPage = pathname === '/admin/login';

  const showAdminLayout = !isAdminLoginPage;

  const ADMIN_THEME_STORAGE_KEY = "admin-theme";

  if (showAdminLayout) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey={ADMIN_THEME_STORAGE_KEY}>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <AdminHeader />
            <main className="flex-1 bg-gray-200 dark:bg-gray-700 p-6 transition-all duration-300 ease-in-out">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    );
  } else {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey={ADMIN_THEME_STORAGE_KEY}>
        <div className="min-h-screen bg-background relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center h-full min-h-screen">
             {children}
          </div>
        </div>
      </ThemeProvider>
    );
  }
});

export default AdminLayout; 