import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import MobileMenu from './mobile-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <header className="bg-[#2E7D32] text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-1">
            <span className="material-icons text-2xl">eco</span>
            <Link href="/">
              <a className="text-xl font-poppins font-semibold">FarmerAccess</a>
            </Link>
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu isAuthenticated={isAuthenticated} />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link href="/marketplace">
                  <a className={`hover:text-neutral-200 ${location === '/marketplace' ? 'font-medium' : ''}`}>
                    Marketplace
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a className={`hover:text-neutral-200 ${location === '/community' ? 'font-medium' : ''}`}>
                    Community
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/farm-management">
                  <a className={`hover:text-neutral-200 ${location === '/farm-management' ? 'font-medium' : ''}`}>
                    Farm Management
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/weather">
                  <a className={`hover:text-neutral-200 ${location === '/weather' ? 'font-medium' : ''}`}>
                    Weather
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <Button asChild variant="secondary" className="bg-white text-[#2E7D32] hover:bg-neutral-100">
                <Link href="/login">
                  <a>Log In</a>
                </Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 hover:text-neutral-200 focus:outline-none">
                  <span>{user?.name || user?.username}</span>
                  <span className="material-icons text-sm">arrow_drop_down</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <a className="w-full">Profile</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">
                      <a className="w-full">Messages</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
