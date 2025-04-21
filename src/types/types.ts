export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  parsedBody: unknown;
  duration: number;
  size: number;
}

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type Header = {
  id: string;
  key: string;
  value: string;
};

export interface ResponseData {
  status: number;
  statusText: string;
  body: string;
  time?: number;
}

export interface CodeGenOptions {
  url: string;
  method: string;
  headers: Header[];
  contentType?: string;
  body?: string | null;
}
