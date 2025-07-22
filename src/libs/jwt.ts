import { jwtDecode } from 'jwt-decode';

export function isTokenExpiringSoon(token: string, thresholdMs = 120000): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const expTime = decoded.exp * 1000;
    return expTime - Date.now() <= thresholdMs;
  } catch (e) {
    return true;
  }
}
