'use client';

import { useRouter } from 'next/navigation';
import { encodeBase64 } from '@/utils/base64';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface MethodSelectorProps {
  method: HttpMethod;
  endpoint: string;
  body?: string;
  headers?: Record<string, string>;
}

export default function MethodSelector({ method, endpoint, body, headers }: MethodSelectorProps) {
  const router = useRouter();
  
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  
  const handleMethodChange = (newMethod: HttpMethod) => {
    if (newMethod === method) return;
    
    // Construct the new URL
    let url = `/client/${newMethod}`;
    
    // Add encoded endpoint if available
    if (endpoint) {
      url += `/${encodeBase64(endpoint)}`;
      
      // Add encoded body if available and method supports body
      if (body && ['POST', 'PUT', 'PATCH'].includes(newMethod)) {
        url += `/${encodeBase64(body)}`;
      }
      
      // Add headers as query params if available
      if (headers && Object.keys(headers).length > 0) {
        const params = new URLSearchParams();
        Object.entries(headers).forEach(([key, value]) => {
          params.append(key, value);
        });
        url += `?${params.toString()}`;
      }
    }
    
    router.push(url);
  };

  const getMethodColor = (m: HttpMethod): string => {
    const colors: Record<HttpMethod, string> = {
      GET: 'bg-blue-600',
      POST: 'bg-green-600',
      PUT: 'bg-yellow-600',
      DELETE: 'bg-red-600',
      PATCH: 'bg-purple-600',
      HEAD: 'bg-gray-600',
      OPTIONS: 'bg-teal-600'
    };
    
    return colors[m];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className="min-w-[110px] bg-black text-white hover:bg-gray-800 border-gray-700 flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${getMethodColor(method)}`}></span>
            {method}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black border-gray-800 text-white min-w-[110px]">
        {methods.map((m) => (
          <DropdownMenuItem 
            key={m}
            onClick={() => handleMethodChange(m)}
            className={`flex items-center gap-2 cursor-pointer hover:bg-gray-800 ${
              m === method ? 'bg-gray-800' : ''
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${getMethodColor(m)}`}></span>
            {m}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
