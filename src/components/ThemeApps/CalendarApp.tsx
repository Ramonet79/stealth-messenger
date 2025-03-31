
import React, { useState } from 'react';
import { Settings, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

interface Event {
  id: number;
  title: string;
  time: string;
  color: string;
}

const CalendarApp: React.FC<CalendarAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  
  const [events, setEvents] = useState<Event[]>([
    { id: 1, title: 'Reunión de trabajo', time: '09:30', color: 'bg-blue-500' },
    { id: 2, title: 'Almuerzo con Juan', time: '13:00', color: 'bg-green-500' },
    { id: 3, title: 'Consulta médica', time: '16:30', color: 'bg-red-500' },
  ]);

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('es', { month: 'long' });
  
  const days = [];
  const numDays = daysInMonth(currentMonth, currentYear);
  const firstDay = firstDayOfMonth(currentMonth, currentYear);
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10"></div>);
  }
  
  // Add cells for days in the month
  for (let i = 1; i <= numDays; i++) {
    days.push(
      <div 
        key={`day-${i}`} 
        className={`h-10 flex items-center justify-center rounded-full cursor-pointer
          ${selectedDay === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
        onClick={() => setSelectedDay(i)}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-semibold">Calendario</h1>
        <button 
          onClick={onSettingsClick} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
        >
          <Settings size={24} />
          {hasUnreadMessages && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>
      
      {/* Month Navigation */}
      <div className="flex justify-between items-center p-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-medium capitalize">{monthName} {currentYear}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="text-center text-gray-500 text-sm py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
      
      {/* Events for Selected Day */}
      <div className="flex-1 p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Eventos para el día {selectedDay}</h3>
          <button className="p-2 bg-blue-500 text-white rounded-full">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center p-3 bg-white rounded-lg shadow">
              <div className={`${event.color} w-4 h-4 rounded-full mr-3`}></div>
              <div className="flex-1">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="grid grid-cols-4 border-t">
        <button className="p-4 flex flex-col items-center">
          <div className="h-2 w-6 bg-blue-500 rounded-full mb-1"></div>
          <span className="text-xs">Día</span>
        </button>
        <button className="p-4 flex flex-col items-center bg-gray-100">
          <div className="h-6 w-6 border border-blue-500 rounded-full mb-1"></div>
          <span className="text-xs text-blue-500">Mes</span>
        </button>
        <button className="p-4 flex flex-col items-center">
          <div className="h-6 w-6 flex flex-col justify-center items-center mb-1">
            <div className="h-1 w-4 bg-gray-400 rounded-full mb-1"></div>
            <div className="h-1 w-4 bg-gray-400 rounded-full"></div>
          </div>
          <span className="text-xs">Lista</span>
        </button>
        <button className="p-4 flex flex-col items-center">
          <div className="h-6 w-6 flex justify-center items-center rounded-full mb-1 border border-gray-300">
            <span className="text-xs">30</span>
          </div>
          <span className="text-xs">Año</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarApp;
