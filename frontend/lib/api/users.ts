/**
 * Users API endpoints
 */

import { apiRequest, type ApiResponse, type PaginatedResponse } from './client';
import type { UserProfile } from './auth';

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role_id: number;
  status?: 'active' | 'disabled';
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  full_name?: string;
  role_id?: number;
  status?: 'active' | 'disabled';
}

// Aliases for convenience
export type UserCreate = CreateUserData;
export type UserUpdate = UpdateUserData;

/**
 * Get list of users with pagination (RBAC applied)
 */
export async function getUsers(page: number = 1, size: number = 20): Promise<ApiResponse<PaginatedResponse<UserProfile>>> {
  return apiRequest<PaginatedResponse<UserProfile>>(`/users?page=${page}&size=${size}`);
}

/**
 * Get a specific user by ID (RBAC applied)
 */
export async function getUserById(id: string | number): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>(`/users/${id}`);
}

/**
 * Create a new user (superadmin only)
 */
export async function createUser(userData: CreateUserData): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Update a user (RBAC applied)
 */
export async function updateUser(id: string | number, userData: UpdateUserData): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

/**
 * Delete a user (superadmin only)
 */
export async function deleteUser(id: string | number): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/users/${id}`, {
    method: 'DELETE',
  });
}
