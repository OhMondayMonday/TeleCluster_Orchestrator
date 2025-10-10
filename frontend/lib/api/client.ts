/**
 * API Client for FastAPI Backend
 * Handles all HTTP requests with automatic token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Generic API request function with automatic token handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get token from localStorage (only on client side)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with any additional headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Make request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse response
    const data = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      return {
        ok: false,
        error: data.detail || data.error || 'Error en la solicitud',
        details: JSON.stringify(data),
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Error de conexión con el servidor',
    };
  }
}

/**
 * Save auth token to localStorage
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

/**
 * Remove auth token from localStorage
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

/**
 * Get auth token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
