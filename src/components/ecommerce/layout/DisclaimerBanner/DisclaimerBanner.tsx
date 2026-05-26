import React from 'react';

interface DisclaimerBannerProps {
  text: string | null | undefined;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ text }) => {
  if (!text) {
    return null; 
  }

  return (
    <div className="w-full bg-secondary text-secondary-foreground text-center text-sm p-2 break-words">
      {text}
    </div>
  );
};

export default DisclaimerBanner; 