import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import the AuthContext for user info
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NavigationMenu: React.FC = () => {
  const { user, role, signOutUser } = useAuth(); // Get user data and role from AuthContext
  
  const handleSignOut = () => {
    signOutUser();
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img src="../assets/images/logo.png" alt="logo" className="h-14 w-14" />
        <h1 className="font-bold text-2xl">Appoint.Me</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar>
              <AvatarImage src={user?.photoURL || 'https://github.com/shadcn.png'} alt={user?.displayName || 'User Avatar'} />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user?.displayName?.split(' ')[0]}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {role === 'merchant' ? (
            <>
              <DropdownMenuLabel>Merchant Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <a href="/merchant/dashboard">
                <DropdownMenuItem>Dashboard</DropdownMenuItem>
              </a>
              <a href="/merchant/service-management">
                <DropdownMenuItem>Service Management</DropdownMenuItem>
              </a>
              <a href="/merchant/settings">
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </a>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel>SuperAdmin Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <a href="/superadmin/dashboard">
                <DropdownMenuItem>Dashboard</DropdownMenuItem>
              </a>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default NavigationMenu;
