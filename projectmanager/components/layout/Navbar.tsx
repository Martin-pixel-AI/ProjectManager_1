import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/src/lib/useCurrentUser';
import { Button } from '@/components/ui/Button';
import { signOut } from 'next-auth/react';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useCurrentUser();

  // Define navigation items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
    { name: 'Tasks', href: '/tasks' },
  ];

  // Define admin-only navigation items
  const adminNavItems = [
    { name: 'Admin', href: '/admin' },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">P</span>
              <span className="ml-2 text-xl font-bold text-gray-900">ProjectManager</span>
            </Link>
          </div>

          {/* Navigation */}
          {isAuthenticated && !isLoading && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Admin-only nav items */}
                {user?.role === 'admin' && adminNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center">
            {isAuthenticated && !isLoading ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/settings" 
                  className="text-gray-700 hover:text-gray-900"
                >
                  Settings
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 