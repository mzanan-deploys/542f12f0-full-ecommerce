'use client';

import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { SOCIAL_LINKS, CONTACT_INFO } from '@/lib/constants/social';

interface SocialLinksProps {
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ className = '' }) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      <Link href={SOCIAL_LINKS.FACEBOOK} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className='hover:text-primary transition-colors'>
        <FaFacebook className="h-5 w-5" />
      </Link>
      <Link href={SOCIAL_LINKS.INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className='hover:text-primary transition-colors'>
        <FaInstagram className="h-5 w-5" />
      </Link>
      <Link href={`mailto:${CONTACT_INFO.EMAIL}`} aria-label="Email" className='hover:text-primary transition-colors'>
        <FaEnvelope className="h-5 w-5" />
      </Link>
    </div>
  );
};

export default SocialLinks;

