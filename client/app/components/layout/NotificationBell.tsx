'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { notificationApi, Notification } from '@/app/lib/api/notificationApi';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    const result = await notificationApi.getNotifications();
    if (result.success && result.notifications) {
      setNotifications(result.notifications);
      setUnreadCount(result.notifications.filter(n => !n.isRead).length);
    }
  };

  const markAsRead = async (id: number) => {
    await notificationApi.markAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    loadNotifications();
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'APPOINTMENT_REMINDER':
      case 'APPOINTMENT_CONFIRMATION':
      case 'APPOINTMENT_CANCELLATION':
        return `/patient/appointments/${notification.data?.appointmentId}`;
      case 'NEW_MESSAGE':
        return '/patient/messages';
      case 'PRESCRIPTION_ADDED':
        return `/patient/appointments/${notification.data?.appointmentId}`;
      default:
        return '#';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return '🔔';
      case 'APPOINTMENT_CONFIRMATION':
        return '✅';
      case 'APPOINTMENT_CANCELLATION':
        return '❌';
      case 'PAYMENT_SUCCESS':
        return '💰';
      case 'PAYMENT_FAILED':
        return '⚠️';
      case 'NEW_MESSAGE':
        return '💬';
      case 'PRESCRIPTION_ADDED':
        return '📋';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.isRead) markAsRead(notification.id);
                    setIsOpen(false);
                  }}
                  className={`block p-3 hover:bg-gray-50 transition border-b last:border-0 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-2 border-t text-center">
            <Link
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}