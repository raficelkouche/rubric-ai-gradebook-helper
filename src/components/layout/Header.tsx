
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header: React.FC = () => {
  return (
    <header className="h-14 border-b bg-white flex items-center px-4">
      <SidebarTrigger className="mr-4 text-rubric-navy" />
      <h1 className="text-lg font-medium">RubricAI</h1>
    </header>
  );
};

export default Header;
