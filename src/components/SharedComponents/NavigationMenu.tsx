import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Import the AuthContext for user info
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MdLogout } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { SlPuzzle } from "react-icons/sl";
import { IoSettingsOutline } from "react-icons/io5";

const NavigationMenu: React.FC = () => {
    const { userData, user, role, signOutUser, status } = useAuth(); // Use userData instead of user
    // Check if status is 'pending' or 'incomplete' to disable the items
    const isDisabled = status === 'pending' || status === 'incomplete';

    const handleSignOut = () => {
        signOutUser();
    };

    // Extract first name from full name
    const firstName = userData?.fullName?.split(' ')[0];
    const firstNameGoogle = user?.displayName?.split(' ')[0]; // Access fullName from userData

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <img src="../assets/images/logo.png" alt="logo" className="h-14 w-14" />
                <h1 className="font-semibold text-xl">Appoint.Me</h1>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer">
                        <div className="relative p-1 hover:bg-slate-400/30 focus:bg-slate-400/30 rounded-full transition-all duration-200 ease-in-out hover:p-[5px]">
                            <Avatar>
                                {/* Use brand logo as avatar if available, otherwise fallback to a default image */}
                                <AvatarImage src={userData?.brandLogo || 'https://github.com/shadcn.png'} alt={firstName || 'User Avatar'} />
                                <AvatarFallback>{firstName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </div>

                        
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='mr-8 rounded-[5px] w-[230px] p-2'>
                    {role === 'merchant' ? (
                        <>
                            <DropdownMenuLabel>{userData?.brandName || firstNameGoogle} </DropdownMenuLabel>
                            <DropdownMenuSeparator className='bg-blue-100' />
                            <a href={isDisabled ? "#" : "/merchant/dashboard"} onClick={(e) => isDisabled && e.preventDefault()}>
        <DropdownMenuItem 
          className={`rounded-[5px] mr-4 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-100 focus:bg-blue-100 cursor-pointer'}`}>
          <RxDashboard className='mr-4' /> Dashboard
        </DropdownMenuItem>
      </a>

      <a href={isDisabled ? "#" : "/merchant/service-management"} onClick={(e) => isDisabled && e.preventDefault()}>
        <DropdownMenuItem 
          className={`rounded-[5px] mr-4 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-100 focus:bg-blue-100 cursor-pointer'}`}>
          <SlPuzzle className='mr-4' /> Service Management
        </DropdownMenuItem>
      </a>

      <a href={isDisabled ? "#" : "/merchant/settings"} onClick={(e) => isDisabled && e.preventDefault()}>
        <DropdownMenuItem 
          className={`rounded-[5px] mr-4 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-100 focus:bg-blue-100 cursor-pointer'}`}>
          <IoSettingsOutline className='mr-4' /> Settings
        </DropdownMenuItem>
      </a>
                            <DropdownMenuSeparator className='bg-blue-100' />
                            <DropdownMenuItem className='hover:bg-blue-100 focus:bg-blue-100 cursor-pointer rounded-[5px]' onClick={handleSignOut}><MdLogout className='mr-4' /> Sign Out</DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <DropdownMenuLabel>SuperAdmin</DropdownMenuLabel>
                            <DropdownMenuSeparator className='bg-blue-100' />
                            <a href="/superadmin/dashboard">
                                <DropdownMenuItem className='hover:bg-blue-100 focus:bg-blue-100 cursor-pointer rounded-[5px]'><RxDashboard className='mr-4' /> Dashboard</DropdownMenuItem>
                            </a>
                            <DropdownMenuSeparator className='bg-blue-100' />
                            <DropdownMenuItem className='hover:bg-blue-100 focus:bg-blue-100 cursor-pointer rounded-[5px]' onClick={handleSignOut}><MdLogout className='mr-4' /> Sign Out</DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
};

export default NavigationMenu;
