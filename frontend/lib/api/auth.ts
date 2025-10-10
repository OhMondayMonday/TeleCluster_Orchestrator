/**
 * Authentication API endpoints
 */

import { apiRequest, saveToken, removeToken, type ApiResponse } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'alumno' | 'profesor' | 'superadmin';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  role_id: number;
  status: string;
  created_at: string;
  updated_at: string | null;
}

// Alias for convenience
export type User = UserProfile;

/**
 * Login and get JWT token
 */
export async function login(credentials: LoginCredentials): Promise<ApiResponse<TokenResponse>> {
  const response = await apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  // Save token if login successful
  if (response.ok && response.data) {
    saveToken(response.data.access_token);
  }

  return response;
}

/**
 * Register a new user
 */
export async function register(userData: RegisterData): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>('/auth/me');
}

/**
 * Logout (clear token)
 */
export function logout(): void {
  removeToken();
}

/**
 * Check auth and get role
 */
export async function checkAuth(): Promise<{ authenticated: boolean; user?: UserProfile; role?: string }> {
  const response = await getCurrentUser();
  
  if (response.ok && response.data) {
    return {
      authenticated: true,
      user: response.data,
      role: response.data.role,
    };
  }

  return { authenticated: false };
}
