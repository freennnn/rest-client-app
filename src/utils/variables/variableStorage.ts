import { Variable } from './variableSubstitution';

const STORAGE_KEY = 'restClientVariables';

export function saveVariables(variables: Variable[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
    console.log('Variables saved successfully:', variables.length);
    return true;
  } catch (error) {
    console.error('Failed to save variables to localStorage:', error);
    return false;
  }
}

export function loadVariables(): Variable[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      console.warn('Stored variables is not an array, resetting');
      return [];
    }

    const validVariables = parsed.filter(
      (item) =>
        item && typeof item === 'object' && 'id' in item && 'name' in item && 'value' in item
    );

    console.log('Loaded variables successfully:', validVariables.length);
    return validVariables;
  } catch (error) {
    console.error('Failed to load variables from localStorage:', error);
    return [];
  }
}

export function clearVariables(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear variables from localStorage:', error);
    return false;
  }
}
