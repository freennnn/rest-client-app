export const homePath = () => '/';

export const authenticatedPathesPrefix = () => [
  '/GET',
  '/POST',
  '/PUT',
  '/PATCH',
  '/DELETE',
  '/OPTIONS',
  '/HEAD',
  '/variables',
  '/history',
];

export const signInPath = (email?: string) => {
  return pathWithEmail('/auth/signin', email);
};
export const signUpPath = () => '/auth/signup';
export const confirmEmailPath = (email: string) =>
  pathWithEmail(`/auth/signup/confirm-email`, email);
export const errorPath = () => '/error';

export const restClientPath = () => '/GET';
export const variablesPath = () => '/variables';
export const historyPath = () => '/history';
export const nonFoundPath = () => '/404';
export const isAuthenticatedPath = (pathname: string) => {
  const upperPathname = pathname.toUpperCase();
  // Check if the uppercase pathname contains any of the uppercase authenticated prefixes
  return authenticatedPathesPrefix().some((prefix) => upperPathname.includes(prefix));
};

function pathWithEmail(path: string, email?: string) {
  if (email) {
    return `${path}?email=${encodeURIComponent(email)}`;
  }
  return path;
}
