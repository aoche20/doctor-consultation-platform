'use client';

import { useAuth } from '@/app/lib/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,  // ✅ Ajouté pour les statistiques
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Construction de la navigation selon le rôle
  const navigation = user?.role === 'doctor' 
    ? [ // Menu pour les médecins
        { name: 'Tableau de bord', href: '/doctor/stats', icon: HomeIcon },
        { name: 'Rendez-vous', href: '/doctor/appointments', icon: CalendarIcon },
        { 
          name: 'Disponibilités', 
          href: user?.id ? `/doctor/availability/${user.id}` : '/doctor/availability', 
          icon: ClockIcon 
        },
        //{ name: 'Statistiques', href: '/doctor/stats', icon: ChartBarIcon },  // ✅ NOUVEAU
        { name: 'Messages', href: '/doctor/messages', icon: ChatBubbleLeftIcon },
        { name: 'Profil', href: '/doctor/profile', icon: UserIcon },
      ]
    : [ // Menu pour les patients
        { name: 'Tableau de bord', href: '/patient/stats', icon: HomeIcon },
        { name: 'Rendez-vous', href: '/patient/appointments', icon: CalendarIcon },
        { name: 'Trouver un médecin', href: '/doctors', icon: MagnifyingGlassIcon },
        { name: 'Mon historique', href: '/patient/stats', icon: ChartBarIcon },  // ✅ NOUVEAU
        { name: 'Messages', href: '/patient/messages', icon: ChatBubbleLeftIcon },
        { name: 'Profil', href: '/patient/profile', icon: UserIcon },
      ];

  // Filtrer les liens invalides
  const validNavigation = navigation.filter(item => 
    !item.href.includes('undefined') && !item.href.includes('null')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-blue-600">DoctorConsult</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {validNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'doctor' ? 'Médecin' : 'Patient'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}