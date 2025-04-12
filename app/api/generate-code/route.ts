import { NextResponse } from 'next/server';
import codegen from 'postman-code-generators';
import sdk from 'postman-collection';

export async function POST(request: Request) {
  try {
    const { language, request: reqOptions } = await request.json();

    const languageMap: Record<string, { language: string; variant: string }> = {
      curl: { language: 'curl', variant: 'curl' },
      fetch: { language: 'javascript', variant: 'fetch' },
      xhr: { language: 'javascript', variant: 'xhr' },
      nodejs: { language: 'nodejs', variant: 'axios' },
      python: { language: 'python', variant: 'requests' },
      java: { language: 'java', variant: 'unirest' },
      csharp: { language: 'csharp', variant: 'restsharp' },
      go: { language: 'go', variant: 'native' },
    };

    const options = languageMap[language] || languageMap.curl;

    const postmanReq = new sdk.Request({
      url: reqOptions.url,
      method: reqOptions.method,
      header: reqOptions.header || [],
      body: reqOptions.body || {},
    });

    interface PostmanRequestType {
      url: string;
      method: string;
      header: Array<{ key: string; value: string }>;
      body?: {
        [key: string]: unknown;
        mode?: string;
        raw?: string;
      };
      [key: string]: unknown;
    }

    const postmanRequest = postmanReq as unknown as PostmanRequestType;

    const codePromise = new Promise<string>((resolve, reject) => {
      codegen.convert(
        options.language,
        options.variant,
        postmanRequest,
        {
          indentCount: 2,
          indentType: 'Space',
          trimRequestBody: true,
          followRedirect: true,
        },
        (error: Error | null, snippet: string) => {
          if (error) {
            return reject(error);
          }
          resolve(snippet);
        }
      );
    });

    const code = await codePromise;

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Error generating code:', error);
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }
}
