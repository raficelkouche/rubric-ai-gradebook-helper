
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import Logo from '@/components/Logo';
import { 
  FileText, 
  User, 
  LogOut, 
  BarChart 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper functions
  const isActive = (path: string) => currentPath.startsWith(path);
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-3 rounded-md ${
      isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    }`;

  return (
    <ShadcnSidebar
      className={`bg-rubric-navy text-white ${collapsed ? 'w-16' : 'w-64'}`}
      collapsible
    >
      <div className="h-14 flex items-center px-4">
        <Logo showText={!collapsed} className="text-white" />
        <div className="flex-1" />
        <SidebarTrigger className={collapsed ? 'hidden' : 'text-white'} />
      </div>

      <SidebarContent className="p-2">
        <SidebarGroup defaultOpen>
          {!collapsed && <SidebarGroupLabel className="text-gray-400">Main</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" className={getNavCls}>
                    <BarChart className="h-5 w-5" />
                    {!collapsed && <span className="ml-3">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/classes" className={getNavCls}>
                    <FileText className="h-5 w-5" />
                    {!collapsed && <span className="ml-3">Classes</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-gray-400">Account</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/profile" className={getNavCls}>
                    <User className="h-5 w-5" />
                    {!collapsed && <span className="ml-3">Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/logout" className={getNavCls}>
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span className="ml-3">Logout</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default Sidebar;
