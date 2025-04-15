import { loadVariables } from './variableStorage';

export interface Variable {
  id: string;
  name: string;
  value: string;
}

export function getVariables(): Variable[] {
  return loadVariables();
}

export function hasVariables(text: string): boolean {
  if (!text) return false;

  const variableRegex = /{{([^{}]+)}}/g;
  return variableRegex.test(text);
}

export function substituteVariables(text: string): string {
  if (!text) return text;

  const variables = getVariables();
  if (!variables.length) return text;

  const variableRegex = /{{([^{}]+)}}/g;

  return text.replace(variableRegex, (match, variableName) => {
    const variable = variables.find((v) => v.name === variableName.trim());
    return variable ? variable.value : match; // Return original if variable not found
  });
}

export function processUrl(url: string): string {
  return substituteVariables(url);
}

export function processHeaders(
  headers: { key: string; value: string; id: string }[]
): { key: string; value: string; id: string }[] {
  return headers.map((header) => ({
    ...header,
    key: substituteVariables(header.key),
    value: substituteVariables(header.value),
  }));
}

export function processBody(body: string): string {
  return substituteVariables(body);
}
