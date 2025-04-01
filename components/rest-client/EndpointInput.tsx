'use client';

import { useState, useEffect } from 'react';
import { hasVariables } from '@/utils/variableUtils';

interface EndpointInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function EndpointInput({ value, onChange, onSubmit }: EndpointInputProps) {
  const [containsVariables, setContainsVariables] = useState(false);
  
  useEffect(() => {
    setContainsVariables(hasVariables(value));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="https://api.example.com/endpoint"
        className={`w-full h-12 rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          containsVariables ? 'border-yellow-600 dark:border-yellow-600' : ''
        }`}
      />
      {containsVariables && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-yellow-600">
          Contains variables
        </div>
      )}
    </div>
  );
}
