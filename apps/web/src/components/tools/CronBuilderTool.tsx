'use client';

import React, { useState } from 'react';
import { CalendarClock, Copy, Check, Sparkles, HelpCircle } from 'lucide-react';
import { useDevKitStore } from '../../store/useDevKitStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function CronBuilderTool() {
  const [minute, setMinute] = useState('*/5');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');

  const [copied, setCopied] = useState(false);

  const { addHistoryItem } = useDevKitStore();

  const cronExpression = `${minute.trim() || '*'} ${hour.trim() || '*'} ${dayOfMonth.trim() || '*'} ${month.trim() || '*'} ${dayOfWeek.trim() || '*'}`;

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'every-5-min':
        setMinute('*/5'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'every-hour':
        setMinute('0'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'daily-midnight':
        setMinute('0'); setHour('0'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'weekly-monday':
        setMinute('0'); setHour('9'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('1');
        break;
      case 'monthly-first':
        setMinute('0'); setHour('0'); setDayOfMonth('1'); setMonth('*'); setDayOfWeek('*');
        break;
      default:
        break;
    }
  };

  const getHumanExplanation = (): string => {
    if (cronExpression === '* * * * *') return 'Runs every single minute of every day.';
    if (cronExpression === '*/5 * * * *') return 'Runs every 5 minutes continuously.';
    if (cronExpression === '0 * * * *') return 'Runs at minute 0 of every hour.';
    if (cronExpression === '0 0 * * *') return 'Runs every day at 00:00 (midnight).';
    if (cronExpression === '0 9 * * 1') return 'Runs at 09:00 AM every Monday.';
    if (cronExpression === '0 0 1 * *') return 'Runs at 00:00 on day-of-month 1 every month.';

    let explanation = 'Runs ';
    if (minute.startsWith('*/')) explanation += `every ${minute.slice(2)} minutes `;
    else if (minute === '0') explanation += 'at minute 0 ';
    else if (minute === '*') explanation += 'every minute ';
    else explanation += `at minute ${minute} `;

    if (hour.startsWith('*/')) explanation += `every ${hour.slice(2)} hours `;
    else if (hour !== '*') explanation += `at hour ${hour} `;

    if (dayOfWeek !== '*') explanation += `on day-of-week ${dayOfWeek} `;
    if (dayOfMonth !== '*') explanation += `on day ${dayOfMonth} of month `;

    return explanation;
  };

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getNextExecutionDates = (): string[] => {
    if (!mounted) return [];
    const dates: string[] = [];
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const future = new Date(now.getTime() + i * 5 * 60 * 1000);
      dates.push(future.toLocaleString());
    }
    return dates;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addHistoryItem('cron-builder', `Copied cron: ${cronExpression}`);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 sm:p-6">
      {/* Header Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center space-x-2">
          <CalendarClock className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold text-devText-primary">Cron Schedule Builder</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-devText-muted">Presets:</span>
          <Select onValueChange={(val) => applyPreset(val)}>
            <SelectTrigger className="w-56 text-xs">
              <SelectValue placeholder="Choose Preset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="every-5-min">Every 5 Minutes (*/5 * * * *)</SelectItem>
              <SelectItem value="every-hour">Every Hour (0 * * * *)</SelectItem>
              <SelectItem value="daily-midnight">Daily at Midnight (0 0 * * *)</SelectItem>
              <SelectItem value="weekly-monday">Weekly on Monday 09:00 (0 9 * * 1)</SelectItem>
              <SelectItem value="monthly-first">Monthly on 1st (0 0 1 * *)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Expression Display Box */}
      <div className="bg-gradient-to-r from-accent/10 via-surface to-background p-6 rounded-xl border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-accent uppercase tracking-wider">CRON EXPRESSION</div>
          <div className="font-mono text-3xl font-extrabold text-devText-primary tracking-widest">
            {cronExpression}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center space-x-2 shadow-xs transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Expression'}</span>
        </button>
      </div>

      {/* Human Readable Explanation Box */}
      <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
        <h3 className="text-xs font-semibold text-accent flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Natural Language Explanation
        </h3>
        <p className="text-sm text-devText-primary font-medium">{getHumanExplanation()}</p>
      </div>

      {/* Fields Interactive Builder Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-surface border border-border rounded-lg space-y-1.5">
          <label className="text-[11px] font-semibold text-devText-muted block">MINUTE (0 - 59)</label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full bg-background border border-border rounded px-2.5 py-1.5 font-mono text-xs text-devText-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg space-y-1.5">
          <label className="text-[11px] font-semibold text-devText-muted block">HOUR (0 - 23)</label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full bg-background border border-border rounded px-2.5 py-1.5 font-mono text-xs text-devText-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg space-y-1.5">
          <label className="text-[11px] font-semibold text-devText-muted block">DAY OF MONTH (1 - 31)</label>
          <input
            type="text"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full bg-background border border-border rounded px-2.5 py-1.5 font-mono text-xs text-devText-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg space-y-1.5">
          <label className="text-[11px] font-semibold text-devText-muted block">MONTH (1 - 12)</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-background border border-border rounded px-2.5 py-1.5 font-mono text-xs text-devText-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="p-3 bg-surface border border-border rounded-lg space-y-1.5">
          <label className="text-[11px] font-semibold text-devText-muted block">DAY OF WEEK (0 - 6)</label>
          <input
            type="text"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full bg-background border border-border rounded px-2.5 py-1.5 font-mono text-xs text-devText-primary focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Next Schedule Preview */}
      <div className="p-4 bg-surface border border-border rounded-xl space-y-2 flex-1">
        <h4 className="text-xs font-semibold text-devText-muted uppercase tracking-wider">
          Next Scheduled Runs (Estimated Preview)
        </h4>
        <div className="space-y-1.5 font-mono text-xs">
          {getNextExecutionDates().map((d, idx) => (
            <div key={idx} className="p-2 bg-background border border-border rounded flex justify-between text-devText-secondary">
              <span>Run #{idx + 1}</span>
              <span className="text-devText-primary">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
