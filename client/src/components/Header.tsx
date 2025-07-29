import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import LocaleToggle from './LocaleToggle';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Repliti Parking</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="hover:text-secondary transition-colors">
              Find Parking
            </Link>
            <Link href="/how-it-works" className="hover:text-secondary transition-colors">
              How It Works
            </Link>
            <Link href="/help" className="hover:text-secondary transition-colors">
              Support
            </Link>
            <Link href="/manage-booking" className="hover:text-secondary transition-colors">
              Manage Booking
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LocaleToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="text-sm text-gray-600">
                  Hi, {(user as any)?.firstName || 'User'}
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
