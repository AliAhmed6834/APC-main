import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import LocaleToggle from './LocaleToggle';
import { useAuth } from '@/hooks/useAuth';
import { Plane, Globe } from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-brand-primary text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Plane className="w-8 h-8 text-white" />
            <span className="text-xl font-bold">Airport Parking Compare</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="hover:text-brand-accent transition-colors">
              Find Parking
            </Link>
            <Link href="/how-it-works" className="hover:text-brand-accent transition-colors">
              How It Works
            </Link>
            <Link href="/help" className="hover:text-brand-accent transition-colors">
              Support
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Link href="/supplier/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                Supplier Login
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-brand-primary">
              <img src="https://flagcdn.com/gb.svg" width="20" alt="GB Flag" className="mr-2" />
              GB
            </Button>
            
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
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="bg-white text-brand-primary border-brand-primary hover:bg-gray-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-brand-accent hover:bg-brand-accent/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
