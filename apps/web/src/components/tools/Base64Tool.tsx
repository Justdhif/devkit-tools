'use client';

import React, { useState } from 'react';
import { Copy, Check, Binary, AlertCircle } from 'lucide-react';
import { encodeBase64, decodeBase64 } from '@devkit/crypto-tools';
import { useDevKitStore } from '../../store/useDevKitStore';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Card, CardHeader } from '../ui/card';
import { Textarea } from '../ui/input';

export function Base64Tool() {
  const [input, setInput] = useState('Hello DevKit World!');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { addHistoryItem } = useDevKitStore();

  const handleEncode = () => {
    try {
      const res = encodeBase64(input, urlSafe);
      setOutput(res);
      setError(undefined);
      addHistoryItem('base64-encoder', 'Encoded text to Base64');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDecode = () => {
    try {
      const res = decodeBase64(input);
      setOutput(res);
      setError(undefined);
      addHistoryItem('base64-encoder', 'Decoded Base64 to text');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border">
        <label className="flex items-center space-x-2 text-xs cursor-pointer text-devText-secondary hover:text-devText-primary">
          <Checkbox
            checked={urlSafe}
            onCheckedChange={(checked) => setUrlSafe(checked === true)}
          />
          <span>URL-Safe Base64 (replace +/ with -_)</span>
        </label>

        <div className="flex items-center space-x-2">
          <Button onClick={handleEncode} size="sm">
            <Binary className="w-3.5 h-3.5" />
            <span>Encode</span>
          </Button>
          <Button onClick={handleDecode} variant="secondary" size="sm">
            Decode
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <span>INPUT TEXT OR BASE64</span>
          </CardHeader>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type raw text or base64 string..."
            className="h-[360px] border-0 bg-transparent rounded-none resize-none font-mono text-xs"
          />
        </Card>

        <Card>
          <CardHeader>
            <span>PROCESSED RESULT</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
              className="h-auto p-0 hover:bg-transparent text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </CardHeader>
          <Textarea
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className="h-[360px] border-0 bg-transparent rounded-none resize-none font-mono text-xs"
          />
        </Card>
      </div>
    </div>
  );
}

