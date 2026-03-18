'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import NotificationBell from './NotificationBell'; // ✅ Import correct
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  // ... reste du code ...

  return (
    <header>
      {/* ... */}
      
      {/* Actions Desktop */}
      <div className="hidden md:flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {/* Badge rôle */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user?.role === 'doctor' 
                ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {user?.role === 'doctor' ? 'Médecin' : 'Patient'}
            </span>

            {/* ✅ NOTIFICATION BELL - AJOUTÉ ICI */}
            <NotificationBell />

            {/* Avatar / Nom */}
            <div className="flex items-center space-x-2">
              {/* ... */}
            </div>

            {/* Bouton déconnexion */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Déconnexion"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          // ...
        )}
      </div>

      {/* ... */}
    </header>
  );
}