import * as variableSubstitution from '@/utils/variables/variableSubstitution';

const mockVariables = [
  { id: '1', name: 'BASE_URL', value: 'https://api.example.com' },
  { id: '2', name: 'API_KEY', value: '123456' },
  { id: '3', name: 'USER_ID', value: '42' },
];

jest.mock('@/utils/variables/variableStorage', () => ({
  __esModule: true,
  loadVariables: jest.fn(() => mockVariables),
}));

describe('Variable Substitution Utilities', () => {
  describe('substituteVariables', () => {
    test('should substitute variables in text', () => {
      const text = 'The base URL is {{BASE_URL}} and the API key is {{API_KEY}}';
      const result = variableSubstitution.substituteVariables(text);
      expect(result).toBe('The base URL is https://api.example.com and the API key is 123456');
    });

    test('should handle empty text', () => {
      const result = variableSubstitution.substituteVariables('');
      expect(result).toBe('');
    });

    test('should handle text with no variables', () => {
      const text = 'This is plain text with no variables';
      const result = variableSubstitution.substituteVariables(text);
      expect(result).toBe(text);
    });

    test('should handle undefined variables', () => {
      const text = 'This uses {{UNKNOWN_VAR}} as a variable';
      const result = variableSubstitution.substituteVariables(text);
      expect(result).toBe('This uses {{UNKNOWN_VAR}} as a variable');
    });
  });

  describe('processUrl', () => {
    test('should substitute variables in URL', () => {
      const url = '{{BASE_URL}}/users/{{USER_ID}}';
      const result = variableSubstitution.processUrl(url);
      expect(result).toBe('https://api.example.com/users/42');
    });

    test('should handle empty URL', () => {
      const result = variableSubstitution.processUrl('');
      expect(result).toBe('');
    });
  });

  describe('processHeaders', () => {
    test('should substitute variables in headers', () => {
      const headers = [
        { id: '1', key: 'Authorization', value: 'Bearer {{API_KEY}}' },
        { id: '2', key: 'User-ID', value: '{{USER_ID}}' },
      ];

      const result = variableSubstitution.processHeaders(headers);

      expect(result).toEqual([
        { id: '1', key: 'Authorization', value: 'Bearer 123456' },
        { id: '2', key: 'User-ID', value: '42' },
      ]);
    });

    test('should handle empty headers array', () => {
      const result = variableSubstitution.processHeaders([]);
      expect(result).toEqual([]);
    });
  });

  describe('processBody', () => {
    test('should substitute variables in JSON body', () => {
      const body = `{
        "apiKey": "{{API_KEY}}",
        "userId": "{{USER_ID}}",
        "url": "{{BASE_URL}}"
      }`;

      const result = variableSubstitution.processBody(body);

      expect(result).toContain('"apiKey": "123456"');
      expect(result).toContain('"userId": "42"');
      expect(result).toContain('"url": "https://api.example.com"');
    });

    test('should substitute variables in text body', () => {
      const body = 'API Key: {{API_KEY}}, User ID: {{USER_ID}}';
      const result = variableSubstitution.processBody(body);
      expect(result).toBe('API Key: 123456, User ID: 42');
    });

    test('should handle empty body', () => {
      const result = variableSubstitution.processBody('');
      expect(result).toBe('');
    });
  });
});
