import {
  errorPath,
  historyPath,
  homePath,
  restClientPath,
  signInPath,
  signUpPath,
  variablesPath,
} from '@/paths';

describe('Paths Utilities', () => {
  describe('homePath function', () => {
    test('returns the home route', () => {
      expect(homePath()).toBe('/');
    });
  });

  describe('signInPath function', () => {
    test('returns the sign in path with no email', () => {
      expect(signInPath()).toBe('/auth/signin');
    });

    test('returns the sign in path with email param', () => {
      expect(signInPath('test@example.com')).toBe('/auth/signin?email=test%40example.com');
    });
  });

  describe('signUpPath function', () => {
    test('returns the sign up path', () => {
      expect(signUpPath()).toBe('/auth/signup');
    });
  });

  describe('restClientPath function', () => {
    test('returns the default REST client path', () => {
      expect(restClientPath()).toBe('/GET');
    });
  });

  describe('historyPath function', () => {
    test('returns the history path', () => {
      expect(historyPath()).toBe('/history');
    });
  });

  describe('variablesPath function', () => {
    test('returns the variables path', () => {
      expect(variablesPath()).toBe('/variables');
    });
  });

  describe('errorPath function', () => {
    test('returns the error path', () => {
      expect(errorPath()).toBe('/error');
    });
  });
});
