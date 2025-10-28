// src/lib/auth.js

/**
 * Sauvegarder les tokens d'authentification
 */
export const saveTokens = (tokens) => {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
};

/**
 * Récupérer le token d'accès
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Récupérer le refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

/**
 * Supprimer les tokens (déconnexion)
 */
export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Sauvegarder les données utilisateur
 */
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Récupérer les données utilisateur
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Vérifier le rôle de l'utilisateur
 */
export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};

/**
 * Vérifier si l'utilisateur est admin
 */
export const isAdmin = () => {
  return hasRole('ADMIN');
};

/**
 * Vérifier si l'utilisateur est coach
 */
export const isCoach = () => {
  return hasRole('COACH');
};

/**
 * Vérifier si l'utilisateur est réceptionniste
 */
export const isReceptionist = () => {
  return hasRole('RECEPTIONIST');
};

/**
 * Vérifier si l'utilisateur est membre
 */
export const isMember = () => {
  return hasRole('MEMBER');
};

/**
 * Décoder le JWT (basique, sans vérification)
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Vérifier si le token est expiré
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};