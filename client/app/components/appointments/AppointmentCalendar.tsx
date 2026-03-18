'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface AppointmentCalendarProps {
  doctorId: string;
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: { start: string; end: string }) => void;
  selectedDate: Date | null;
  selectedSlot: { start: string; end: string } | null;
  availableSlots: Array<{ start: string; end: string; available: boolean }>;
  loading?: boolean;
}

export default function AppointmentCalendar({
  doctorId,
  onDateSelect,
  onSlotSelect,
  selectedDate,
  selectedSlot,
  availableSlots,
  loading
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentMonth]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const isDateSelectable = (date: Date) => {
    // Ne pas permettre les dates passées
    if (isBefore(date, startOfToday())) return false;
    
    // Ici vous pouvez ajouter d'autres conditions
    // Par exemple, vérifier si le médecin travaille ce jour-là
    return true;
  };

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date)) {
      onDateSelect(date);
    }
  };

  const handleSlotClick = (slot: { start: string; end: string }) => {
    onSlotSelect(slot);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays.map((date, index) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelectable = isDateSelectable(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!isCurrentMonth || !isSelectable}
              className={`
                aspect-square p-2 rounded-lg transition
                ${!isCurrentMonth && 'text-gray-300'}
                ${isCurrentMonth && isSelectable && 'hover:bg-blue-50 cursor-pointer'}
                ${isCurrentMonth && !isSelectable && 'text-gray-300 cursor-not-allowed'}
                ${isSelected && 'bg-blue-500 text-white hover:bg-blue-600'}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Créneaux disponibles */}
      {selectedDate && (
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">
            Créneaux disponibles le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Aucun créneau disponible pour cette date
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotClick(slot)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition
                    ${selectedSlot?.start === slot.start
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}