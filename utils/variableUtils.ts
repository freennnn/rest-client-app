import { getVariables } from './variableStorage';

const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Checks if a string contains variable placeholders
 */
export function hasVariables(str: string): boolean {
  return VARIABLE_REGEX.test(str);
}

/**
 * Finds all variables in a string
 */
export function findVariables(str: string): string[] {
  const matches = str.match(VARIABLE_REGEX) || [];
  return matches.map(match => match.replace(/^\{\{|\}\}$/g, ''));
}

/**
 * Replaces all variables in a string with their values
 */
export function replaceVariables(str: string): string {
  const variables = getVariables();
  
  return str.replace(VARIABLE_REGEX, (match, varName) => {
    const variable = variables.find(v => v.name === varName);
    return variable ? variable.value : match;
  });
}

export function processJsonWithVariables(json: string | object): string {
  try {
    const jsonStr = typeof json === 'string' ? json : JSON.stringify(json);
    
    const processedJson = replaceVariables(jsonStr);
    
    return JSON.stringify(JSON.parse(processedJson), null, 2);
  } catch (error) {
    console.error('Error processing JSON with variables:', error);
    return typeof json === 'string' ? json : JSON.stringify(json);
  }
}

export function processObjectWithVariables<T extends object>(obj: T): T {
  const processed = { ...obj };
  
  for (const key in processed) {
    if (Object.prototype.hasOwnProperty.call(processed, key)) {
      const value = processed[key];
      
      if (typeof value === 'string') {
        processed[key] = replaceVariables(value) as unknown as T[Extract<keyof T, string>];
      } else if (value !== null && typeof value === 'object') {
        processed[key] = processObjectWithVariables(value) as unknown as T[Extract<keyof T, string>];
      }
    }
  }
  
  return processed;
}
