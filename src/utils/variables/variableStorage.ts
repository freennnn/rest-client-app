import { Variable } from './variableSubstitution';

const STORAGE_KEY = 'restClientVariables';

export function saveVariables(variables: Variable[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
    return true;
  } catch {
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
      return [];
    }

    const validVariables = parsed.filter(
      (item) =>
        item && typeof item === 'object' && 'id' in item && 'name' in item && 'value' in item
    );

    return validVariables;
  } catch {
    return [];
  }
}

export function clearVariables(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
