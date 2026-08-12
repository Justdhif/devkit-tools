'use client';

import React, { useState } from 'react';
import { Clock, RefreshCw, Copy, Check } from 'lucide-react';
import { parseTimestamp, TimestampParseResult } from '@devkit/crypto-tools';
import { useDevKitStore } from '../../store/useDevKitStore';

export function TimestampConverterTool() {
  const [input, setInput] = useState<string>('1716239022');
  const [parsed, setParsed] = useState<TimestampParseResult | null>(() => parseTimestamp('1716239022'));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { addHistoryItem } = useDevKitStore();

  React.useEffect(() => {
    const nowSec = Math.floor(Date.now() / 1000).toString();
    setInput(nowSec);
    setParsed(parseTimestamp(nowSec));
  }, []);

  const handleNow = () => {
    const nowSec = Math.floor(Date.now() / 1000).toString();
    setInput(nowSec);
    setParsed(parseTimestamp(nowSec));
  };

  const handleConvert = (val: string) => {
    setInput(val);
    const res = parseTimestamp(val);
    setParsed(res);
    if (res) {
      addHistoryItem('timestamp-converter', `Converted timestamp: ${val}`);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Input controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex items-center space-x-3 flex-1 max-w-lg">
          <Clock className="w-4 h-4 text-accent shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => handleConvert(e.target.value)}
            placeholder="Enter timestamp in sec/ms or ISO date (e.g. 1716239022)"
            className="w-full bg-background border border-border text-devText-primary rounded px-3 py-1.5 text-xs font-mono focus:outline-none"
          />
        </div>

        <button
          onClick={handleNow}
          className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md flex items-center space-x-1 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Set Current Time (Now)</span>
        </button>
      </div>

      {/* Conversion Output Grid */}
      {parsed ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Unix Timestamp (Seconds)', value: parsed.unixSeconds.toString(), key: 'sec' },
            { label: 'Unix Timestamp (Milliseconds)', value: parsed.unixMilliseconds.toString(), key: 'ms' },
            { label: 'ISO 8601 String', value: parsed.iso, key: 'iso' },
            { label: 'UTC Format', value: parsed.utc, key: 'utc' },
            { label: 'Local Time Format', value: parsed.local, key: 'local' },
          ].map((item) => (
            <div
              key={item.key}
              className="p-4 rounded-lg bg-surface border border-border flex flex-col justify-between space-y-2 hover:border-accent/30 transition-colors"
            >
              <div className="text-xs font-medium text-devText-muted">{item.label}</div>
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-devText-primary break-all">
                <span>{item.value}</span>
                <button
                  onClick={() => copyToClipboard(item.value, item.key)}
                  className="p-1 text-devText-muted hover:text-accent ml-2 shrink-0"
                >
                  {copiedKey === item.key ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 border border-border rounded-lg bg-surface text-center text-rose-300 text-xs">
          Invalid timestamp or date format. Try entering a numeric Unix epoch or ISO string.
        </div>
      )}
    </div>
  );
}
