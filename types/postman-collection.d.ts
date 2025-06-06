declare module 'postman-collection' {
  export class Request {
    constructor(options: {
      url: string;
      method: string;
      header?: Array<{ key: string; value: string }>;
      body?: string | object | null;
    });
  }

  export { Request as default };
}
