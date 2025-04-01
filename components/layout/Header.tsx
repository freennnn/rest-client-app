'use client';

import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-foreground">REST Client</span>
        </Link>

        <nav className="flex gap-6 items-center">
          {isAuthenticated ? (
            <>
              <Link href="/client/GET" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
                REST Client
              </Link>
              <Link href="/variables" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
                Variables
              </Link>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="bg-black text-white hover:bg-gray-800 border-gray-700 flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-blue-600 dark:hover:text-blue-400">
                Log In
              </Link>
              <Button 
                asChild 
                size="sm"
                variant="outline"
                className="bg-black text-white hover:bg-gray-800 border-gray-700"
              >
                <Link href="/signup">
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
