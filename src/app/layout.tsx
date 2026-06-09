import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import "./global.css";
import { AppThemeProvider } from "@/components/providers/AppThemeProvider";
import { ScrollRestorationProvider } from "@/components/providers/ScrollRestorationProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils/cn";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/seo/StructuredData";
import ImagePreloader from "@/components/core/ImagePreloader/ImagePreloader";

const geistSans = GeistSans;
const geistMono = GeistMono;

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

import { BRAND_CONFIG } from "@/config/brand";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  title: {
    default: BRAND_CONFIG.title,
    template: `${BRAND_CONFIG.name} - %s`,
  },
  description: BRAND_CONFIG.description,
  keywords: [...BRAND_CONFIG.keywords].join(", "),
  authors: [{ name: BRAND_CONFIG.name }],
  creator: BRAND_CONFIG.name,
  publisher: BRAND_CONFIG.name,
  robots: "index, follow",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: BRAND_CONFIG.name,
    title: BRAND_CONFIG.title,
    description: BRAND_CONFIG.description,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_CONFIG.title,
    description: BRAND_CONFIG.description,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  shrinkToFit: 'no',
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <>{children}</>;
  return <ClerkProvider>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <OrganizationStructuredData />
          <WebsiteStructuredData />
        </head>
        <body
          className={cn(
            geistSans.variable,
            geistMono.variable,
            cormorantGaramond.variable,
            greatVibes.variable,
            "font-sans antialiased"
          )}
          suppressHydrationWarning
        >
          <AppThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <ScrollRestorationProvider>
              <StoreProvider>
                <ReactQueryProvider>
                  <ImagePreloader />
                  <div>{children}</div>
                  <Toaster richColors position="top-center" />
                </ReactQueryProvider>
              </StoreProvider>
            </ScrollRestorationProvider>
          </AppThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
