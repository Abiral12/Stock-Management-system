// components/AdminHeader.tsx
'use client';

import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear tokens from storage
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    // Redirect to login page
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/85 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tighter text-gray-900">
          <span className="bg-black text-white px-3 py-1 rounded-lg mr-1">Forever</span>
          <span className="font-light">Young</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex">
        <ul className="flex space-x-8">
          {[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Analytics', href: '/analytics' },
            { name: 'Inventory', href: '/inventory' },
            { name: 'Sales', href: '/sales' },
          ].map((item) => (
            <li key={item.name} className="relative group">
              <Link 
                href={item.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile and Actions */}
      <div className="flex items-center space-x-4">
        {/* <button className="rounded-full hover:bg-gray-100 p-2 relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button> */}
        
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-700 hover:text-black transition-colors group"
        >
          <div className="h-9 w-9 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center group-hover:bg-gray-300">
            <LogOut className="h-4 w-4 text-gray-500 group-hover:text-black" />
          </div>
          <span className="ml-2 font-medium hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}