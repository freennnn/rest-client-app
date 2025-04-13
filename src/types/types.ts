export interface Header {
  id: string;
  key: string;
  value: string;
}

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
