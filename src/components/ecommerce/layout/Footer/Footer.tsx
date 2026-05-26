'use client'

import React from 'react';
import { COMPANY_INFO } from '@/lib/constants/social';
import SocialLinks from '@/components/ecommerce/layout/SocialLinks/SocialLinks';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-8 z-10 h-full flex items-center">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center w-full">
        <div className="text-sm mb-4 md:mb-0">
          © {COMPANY_INFO.FOUNDED_YEAR} {COMPANY_INFO.NAME}. All rights reserved.
        </div>
        <SocialLinks />
      </div>
    </footer>
  );
};

export default Footer; 