export type UserRole = 'admin' | 'vigia';

export interface User {
  id: number;
  email: string;
  nome: string;
  role: UserRole;
  ativo: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    nome: string;
    role: UserRole;
  };
  message?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  nome: string;
  role: UserRole;
}

