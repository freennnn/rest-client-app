'use client';

import { useState, useEffect } from 'react';
import { hasVariables } from '@/utils/variableUtils';
import { Button } from "@/components/ui/button";

interface RequestBodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  contentType?: string;
}

export default function RequestBodyEditor({ 
  value, 
  onChange, 
  readOnly = false,
  contentType = 'application/json'
}: RequestBodyEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const [containsVariables, setContainsVariables] = useState(false);
  
  useEffect(() => {
    setContainsVariables(hasVariables(value));
  }, [value]);

  const handlePrettify = () => {
    try {
      if (contentType.includes('json')) {
        const parsed = JSON.parse(value);
        onChange(JSON.stringify(parsed, null, 2));
        setError(null);
      }
      // Could add XML prettify here in the future
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Invalid JSON format');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Clear any previous errors when user starts typing again
    if (error) setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{readOnly ? 'Response Body' : 'Request Body'}</h3>
          {containsVariables && !readOnly && (
            <span className="text-xs text-yellow-600 px-2 py-0.5 bg-yellow-600/10 rounded">
              Contains variables
            </span>
          )}
        </div>
        
        {!readOnly && (
          <Button
            onClick={handlePrettify}
            variant="outline"
            size="sm"
          >
            Prettify
          </Button>
        )}
      </div>
      
      {error && (
        <div className="text-sm text-red-500 p-2 bg-red-100 dark:bg-red-100/10 rounded-md">
          {error}
        </div>
      )}
      
      <textarea
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        className={`w-full h-64 p-4 font-mono text-sm border border-gray-300 dark:border-gray-700 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          readOnly ? 'bg-gray-200 dark:bg-gray-800' : ''
        }`}
        placeholder={readOnly ? 'Response will appear here...' : 'Enter request body here...'}
      />
    </div>
  );
}
