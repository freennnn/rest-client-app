import { clearVariables, loadVariables, saveVariables } from '@/utils/variables/variableStorage';
import { Variable } from '@/utils/variables/variableSubstitution';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Variable Storage Utilities', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('loadVariables', () => {
    test('should return empty array when no variables are stored', () => {
      const variables = loadVariables();
      expect(variables.length).toBe(0);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('restClientVariables');
    });

    test('should return stored variables as an array of Variable objects', () => {
      const testVars: Variable[] = [
        { id: '1', name: 'BASE_URL', value: 'https://api.example.com' },
        { id: '2', name: 'API_KEY', value: '123456' },
      ];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(testVars));

      const variables = loadVariables();

      expect(variables.length).toBe(2);
      expect(variables[0].name).toBe('BASE_URL');
      expect(variables[0].value).toBe('https://api.example.com');
      expect(variables[1].name).toBe('API_KEY');
      expect(variables[1].value).toBe('123456');
    });

    test('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid-json');

      const variables = loadVariables();

      expect(variables.length).toBe(0);
    });
  });

  describe('saveVariables', () => {
    test('should save variables to localStorage', () => {
      const vars: Variable[] = [{ id: '1', name: 'BASE_URL', value: 'https://api.example.com' }];

      saveVariables(vars);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'restClientVariables',
        expect.any(String)
      );

      const setItemCall = mockLocalStorage.setItem.mock.calls[0][1];
      const savedVars = JSON.parse(setItemCall);
      expect(savedVars).toEqual(vars);
    });

    test('should update existing variables', () => {
      const vars: Variable[] = [
        { id: '1', name: 'BASE_URL', value: 'https://api.example.com' },
        { id: '2', name: 'API_KEY', value: '123456' },
      ];

      saveVariables(vars);

      const setItemCall = mockLocalStorage.setItem.mock.calls[0][1];
      const savedVars = JSON.parse(setItemCall);
      expect(savedVars).toEqual(vars);
    });
  });

  describe('clearVariables', () => {
    test('should remove all variables', () => {
      clearVariables();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('restClientVariables');
    });
  });
});
