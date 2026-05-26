'use client'

import React from 'react';
import { COMPANY_INFO } from '@/lib/constants/social';
import SocialLinks from '@/components/ecommerce/layout/SocialLinks/SocialLinks';

const hideAttribution = process.env.NEXT_PUBLIC_HIDE_ATTRIBUTION === 'true';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-8 z-10 h-full flex items-center">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3 w-full">
        <div className="text-sm">
          © {COMPANY_INFO.FOUNDED_YEAR} {COMPANY_INFO.NAME}. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <SocialLinks />
          {!hideAttribution && (
            <a
              href="https://itsmatias.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Built by Matias Zanan
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
