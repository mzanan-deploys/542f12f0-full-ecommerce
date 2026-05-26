'use client';

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/ecommerce/layout/Header/Header";
import Footer from "@/components/ecommerce/layout/Footer/Footer";
import FloatingCartIcon from "@/components/ecommerce/layout/FloatingCartIcon/FloatingCartIcon";

export default function AppGroupLayout({ 
  children, 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className={`bg-background relative flex flex-col w-full max-w-[100vw] overflow-x-hidden ${isHomePage ? 'h-screen overflow-y-hidden' : 'min-h-screen'}`}>
      <Header />
      <main className={`relative w-full overflow-x-hidden ${isHomePage ? 'h-full overflow-y-hidden' : 'flex-1'}`}>{children}</main>
      {!isHomePage && <Footer />}
      <FloatingCartIcon />
    </div>
  );
} 