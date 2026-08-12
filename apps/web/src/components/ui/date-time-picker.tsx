'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from './button';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function DateTimePicker({ value, onChange, className = '' }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active view date for calendar navigation
  const [viewDate, setViewDate] = useState<Date>(value || new Date());
  // Selected date parts
  const [selectedYear, setSelectedYear] = useState(value ? value.getFullYear() : new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value ? value.getMonth() : new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(value ? value.getDate() : new Date().getDate());
  const [hours, setHours] = useState(value ? value.getHours() : new Date().getHours());
  const [minutes, setMinutes] = useState(value ? value.getMinutes() : new Date().getMinutes());
  const [seconds, setSeconds] = useState(value ? value.getSeconds() : new Date().getSeconds());

  // Sync internal state when external value changes
  useEffect(() => {
    if (value && !isNaN(value.getTime())) {
      setViewDate(value);
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDay(value.getDate());
      setHours(value.getHours());
      setMinutes(value.getMinutes());
      setSeconds(value.getSeconds());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute days in current month grid
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const applyDateTime = (
    year = selectedYear,
    month = selectedMonth,
    day = selectedDay,
    h = hours,
    m = minutes,
    s = seconds
  ) => {
    const newDate = new Date(year, month, day, h, m, s);
    onChange(newDate);
  };

  const handleSelectDay = (day: number) => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDay(day);
    applyDateTime(y, m, day, hours, minutes, seconds);
  };

  const handleTimeChange = (h: number, m: number, s: number) => {
    const validH = Math.min(23, Math.max(0, h));
    const validM = Math.min(59, Math.max(0, m));
    const validS = Math.min(59, Math.max(0, s));
    setHours(validH);
    setMinutes(validM);
    setSeconds(validS);
    applyDateTime(selectedYear, selectedMonth, selectedDay, validH, validM, validS);
  };

  // Presets
  const applyPreset = (preset: 'now' | 'startOfToday' | '1hourAgo' | '1dayAgo' | '7daysAgo') => {
    const now = new Date();
    let target = new Date();

    if (preset === 'now') {
      target = now;
    } else if (preset === 'startOfToday') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (preset === '1hourAgo') {
      target = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (preset === '1dayAgo') {
      target = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (preset === '7daysAgo') {
      target = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    setViewDate(target);
    setSelectedYear(target.getFullYear());
    setSelectedMonth(target.getMonth());
    setSelectedDay(target.getDate());
    setHours(target.getHours());
    setMinutes(target.getMinutes());
    setSeconds(target.getSeconds());
    onChange(target);
  };

  const formattedLabel = value && !isNaN(value.getTime())
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
        value.getDate()
      ).padStart(2, '0')} ${String(value.getHours()).padStart(2, '0')}:${String(
        value.getMinutes()
      ).padStart(2, '0')}:${String(value.getSeconds()).padStart(2, '0')}`
    : 'Select Date & Time';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 text-xs font-mono flex items-center space-x-2 border border-border hover:border-accent/50 bg-background"
        title="Custom Date & Time Picker"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-accent" />
        <span>{formattedLabel}</span>
      </Button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 z-50 w-72 sm:w-80 p-4 bg-surface border border-border rounded-xl shadow-2xl space-y-4">
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-devText-muted hover:text-devText-primary hover:bg-sidebar rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-devText-primary">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-devText-muted hover:text-devText-primary hover:bg-sidebar rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Presets Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            <button
              onClick={() => applyPreset('now')}
              className="px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent font-semibold hover:bg-accent/20 transition-colors shrink-0"
            >
              Now
            </button>
            <button
              onClick={() => applyPreset('startOfToday')}
              className="px-2 py-0.5 rounded bg-sidebar border border-border text-devText-secondary hover:text-devText-primary transition-colors shrink-0"
            >
              Today 00:00
            </button>
            <button
              onClick={() => applyPreset('1hourAgo')}
              className="px-2 py-0.5 rounded bg-sidebar border border-border text-devText-secondary hover:text-devText-primary transition-colors shrink-0"
            >
              -1 Hour
            </button>
            <button
              onClick={() => applyPreset('1dayAgo')}
              className="px-2 py-0.5 rounded bg-sidebar border border-border text-devText-secondary hover:text-devText-primary transition-colors shrink-0"
            >
              -24 Hours
            </button>
          </div>

          {/* Calendar Grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-devText-muted mb-1">
              {DAYS_OF_WEEK.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isSelected =
                  selectedDay === day &&
                  selectedMonth === viewDate.getMonth() &&
                  selectedYear === viewDate.getFullYear();

                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === viewDate.getMonth() &&
                  new Date().getFullYear() === viewDate.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDay(day)}
                    className={`h-7 text-xs rounded-md font-mono flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-accent text-white font-bold shadow-xs'
                        : isToday
                        ? 'border border-accent/40 text-accent font-semibold bg-accent/10'
                        : 'text-devText-primary hover:bg-sidebar'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker Controls */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-devText-muted">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span className="font-semibold">Time:</span>
            </div>

            <div className="flex items-center space-x-1 font-mono text-xs">
              <input
                type="number"
                min={0}
                max={23}
                value={String(hours).padStart(2, '0')}
                onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0, minutes, seconds)}
                className="w-10 h-7 bg-background border border-border text-devText-primary rounded text-center focus:outline-none focus:border-accent"
                title="Hours (00-23)"
              />
              <span>:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={String(minutes).padStart(2, '0')}
                onChange={(e) => handleTimeChange(hours, parseInt(e.target.value) || 0, seconds)}
                className="w-10 h-7 bg-background border border-border text-devText-primary rounded text-center focus:outline-none focus:border-accent"
                title="Minutes (00-59)"
              />
              <span>:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={String(seconds).padStart(2, '0')}
                onChange={(e) => handleTimeChange(hours, minutes, parseInt(e.target.value) || 0)}
                className="w-10 h-7 bg-background border border-border text-devText-primary rounded text-center focus:outline-none focus:border-accent"
                title="Seconds (00-59)"
              />
            </div>

            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 text-xs px-2.5"
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
