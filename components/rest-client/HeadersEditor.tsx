'use client';

import { hasVariables } from '@/utils/variableUtils';
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Header {
  id: string;
  key: string;
  value: string;
}

interface HeadersEditorProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

export default function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  const addHeader = () => {
    const newHeader = { id: crypto.randomUUID(), key: '', value: '' };
    onChange([...headers, newHeader]);
  };

  const removeHeader = (id: string) => {
    onChange(headers.filter(header => header.id !== id));
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    onChange(
      headers.map(header => 
        header.id === id ? { ...header, [field]: value } : header
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Headers</h3>
        <Button
          onClick={addHeader}
          variant="outline"
          size="sm"
          className="bg-black text-white hover:bg-gray-800 border-gray-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Header
        </Button>
      </div>
      
      {headers.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300 text-sm py-2">
          No headers added yet. Click &apos;Add Header&apos; to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {headers.map(header => (
            <div key={header.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                placeholder="Header name"
                className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  hasVariables(header.key) ? 'border-yellow-600 dark:border-yellow-600' : ''
                }`}
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                placeholder="Header value"
                className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  hasVariables(header.value) ? 'border-yellow-600 dark:border-yellow-600' : ''
                }`}
              />
              <Button
                onClick={() => removeHeader(header.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100/20"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove header</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
