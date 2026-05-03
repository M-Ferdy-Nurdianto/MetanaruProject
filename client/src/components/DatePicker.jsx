import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DatePicker = ({ value, onChange, placeholder = "Select date", align = "left", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  // Parse value or use current date
  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isCurrent = isToday(day);

      days.push(
        <button
          key={day.toString()}
          onClick={() => {
              onChange(format(cloneDay, 'yyyy-MM-dd'));
              setIsOpen(false);
          }}
          disabled={!isCurrentMonth}
          className={cn(
            "h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all relative group",
            !isCurrentMonth ? "text-white/10 cursor-default" : "text-white/70 hover:bg-white/10 hover:text-white cursor-pointer",
            isSelected && "bg-vibrant-pink text-white shadow-lg shadow-vibrant-pink/20 hover:bg-vibrant-pink",
            isCurrent && !isSelected && "text-vibrant-pink font-bold border border-vibrant-pink/30",
          )}
        >
          {formattedDate}
          {isCurrent && !isSelected && isCurrentMonth && (
             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-vibrant-pink" />
          )}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Input Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-[#0A0A0B] border border-white/20 rounded-lg px-3 py-2 text-sm flex items-center justify-between cursor-pointer hover:border-white/40 transition-colors w-full",
          isOpen && "border-vibrant-pink/50 ring-1 ring-vibrant-pink/20"
        )}
      >
        <span className={cn("text-white/90", !value && "text-white/40")}>
          {value ? format(new Date(value), 'dd MMM yyyy') : placeholder}
        </span>
        <CalendarIcon size={16} className="text-white/40" />
      </div>

      {/* Dropdown Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full mt-2 z-50 bg-[#121214] border border-white/10 rounded-xl shadow-2xl p-4 w-[280px]",
              align === 'right' ? 'right-0' : 'left-0'
            )}
            style={{ zIndex: 1000 }} 
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={(e) => { e.stopPropagation(); prevMonth(); }}
                className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                type="button"
              >
                <ChevronLeft size={16} />
              </button>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {format(currentMonth, 'MMMM yyyy')}
              </h4>
              <button 
                onClick={(e) => { e.stopPropagation(); nextMonth(); }}
                className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                type="button"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days Grid Headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayName, idx) => (
                <div key={`header-${dayName}-${idx}`} className="text-[10px] font-bold text-white/30 uppercase">
                  {dayName}
                </div>
              ))}
            </div>
            
            {/* Calendar Rows */}
            <div className="flex flex-col gap-1">
               {rows}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
