
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 500 500"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M350 120H150c-16.5 0-30 13.5-30 30v280c0 16.5 13.5 30 30 30h200c16.5 0 30-13.5 30-30V150c0-16.5-13.5-30-30-30zM200 350c0 5.5-4.5 10-10 10s-10-4.5-10-10v-20c0-5.5 4.5-10 10-10s10 4.5 10 10v20zm0-80c0 5.5-4.5 10-10 10s-10-4.5-10-10v-20c0-5.5 4.5-10 10-10s10 4.5 10 10v20zm0-80c0 5.5-4.5 10-10 10s-10-4.5-10-10v-20c0-5.5 4.5-10 10-10s10 4.5 10 10v20zm100 160c0 5.5-4.5 10-10 10H270c-5.5 0-10-4.5-10-10s4.5-10 10-10h20c5.5 0 10 4.5 10 10zm0-80c0 5.5-4.5 10-10 10H270c-5.5 0-10-4.5-10-10s4.5-10 10-10h20c5.5 0 10 4.5 10 10zm0-80c0 5.5-4.5 10-10 10H270c-5.5 0-10-4.5-10-10s4.5-10 10-10h20c5.5 0 10 4.5 10 10zm-50-120c27.6 0 50 22.4 50 50h-100c0-27.6 22.4-50 50-50zm-80 20c0 11-9 20-20 20s-20-9-20-20 9-20 20-20 20 9 20 20zm160 0c0 11-9 20-20 20s-20-9-20-20 9-20 20-20 20 9 20 20zm0 360v80c0 22.1-17.9 40-40 40H160c-22.1 0-40-17.9-40-40v-80"
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && (
        <span className="ml-2 text-2xl font-bold">RubricAI</span>
      )}
    </div>
  );
};

export default Logo;
