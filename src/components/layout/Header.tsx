
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4 text-rubric-navy" />
        <h1 className="text-lg font-medium">RubricAI</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-sm font-medium mr-2">
            {user.user_metadata.first_name || 'User'}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-rubric-navy"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </header>
  );
};

export default Header;
