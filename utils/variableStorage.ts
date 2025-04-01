export interface Variable {
  name: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'rest_client_variables';

/**
 * Gets all variables from local storage
 */
export function getVariables(): Variable[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedVariables = localStorage.getItem(STORAGE_KEY);
    return storedVariables ? JSON.parse(storedVariables) : [];
  } catch (error) {
    console.error('Error reading variables from storage:', error);
    return [];
  }
}

/**
 * Saves a variable to local storage
 */
export function saveVariable(variable: Omit<Variable, 'createdAt' | 'updatedAt'>): Variable {
  const variables = getVariables();
  const now = new Date().toISOString();
  
  const existingIndex = variables.findIndex(v => v.name === variable.name);
  
  if (existingIndex >= 0) {
    // Update existing variable
    const updatedVariable = {
      ...variables[existingIndex],
      ...variable,
      updatedAt: now
    };
    variables[existingIndex] = updatedVariable;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
    return updatedVariable;
  } else {
    // Create new variable
    const newVariable = {
      ...variable,
      createdAt: now,
      updatedAt: now
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...variables, newVariable]));
    return newVariable;
  }
}

/**
 * Deletes a variable from local storage
 */
export function deleteVariable(name: string): boolean {
  const variables = getVariables();
  const filteredVariables = variables.filter(v => v.name !== name);
  
  if (filteredVariables.length === variables.length) {
    return false; // Variable not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredVariables));
  return true;
}

/**
 * Clears all variables from local storage
 */
export function clearVariables(): void {
  localStorage.removeItem(STORAGE_KEY);
}
