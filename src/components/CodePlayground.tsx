'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodePlaygroundProps {
  code: string;
  language?: string;
  title?: string;
  editable?: boolean;
  showPreview?: boolean;
}

export function CodePlayground({
  code: initialCode,
  language = 'typescript',
  title = 'Code Example',
  editable = true,
  showPreview = false,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card my-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted border-b">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs px-2 py-1 bg-background rounded border">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showPreview && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-sm px-3 py-1.5 border rounded-md hover:bg-background transition-colors"
            >
              {showCode ? 'Preview' : 'Code'}
            </button>
          )}
          <button
            onClick={copyCode}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded-md hover:bg-background transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      {showCode && (
        <div className="relative">
          {editable ? (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 font-mono text-sm bg-background border-0 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={code.split('\n').length}
              spellCheck={false}
            />
          ) : (
            <pre className="p-4 overflow-x-auto">
              <code className="font-mono text-sm">{code}</code>
            </pre>
          )}
        </div>
      )}

      {/* Preview (if enabled) */}
      {showPreview && !showCode && (
        <div className="p-6 bg-background">
          <div className="text-sm text-muted-foreground text-center py-8">
            Preview functionality coming soon
          </div>
        </div>
      )}
    </div>
  );
}

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyCode}
      className="absolute top-2 right-2 p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
