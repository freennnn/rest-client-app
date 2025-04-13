declare module 'postman-code-generators' {
  export interface ConvertOptions {
    indentCount: number;
    indentType: 'Space' | 'Tab';
    trimRequestBody?: boolean;
    followRedirect?: boolean;
  }

  export interface RequestObject {
    url: string;
    method: string;
    header?: Array<{ key: string; value: string }>;
    body?: {
      mode?: string;
      raw?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export function convert(
    language: string,
    variant: string,
    request: RequestObject,
    options: ConvertOptions,
    callback: (error: Error | null, snippet: string) => void
  ): void;

  export interface Language {
    key: string;
    label: string;
    [key: string]: unknown;
  }

  export function getLanguageList(
    callback: (error: Error | null, languages: Language[]) => void
  ): void;

  export interface Variant {
    key: string;
    label: string;
    [key: string]: unknown;
  }

  export function getVariantsList(
    language: string,
    callback: (error: Error | null, variants: Variant[]) => void
  ): void;

  export const convert: typeof convert;
  export const getLanguageList: typeof getLanguageList;
  export const getVariantsList: typeof getVariantsList;
}
