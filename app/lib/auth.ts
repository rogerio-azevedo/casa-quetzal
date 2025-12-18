import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
);

const COOKIE_NAME = 'casa-quetzal-token';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 dias em segundos

export interface AuthPayload {
  userId: number;
  email: string;
  nome: string;
  role: 'admin' | 'vigia';
}

// Hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verificar senha
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Criar token JWT
export async function createToken(payload: AuthPayload): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  
  return token;
}

// Verificar e decodificar token JWT
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as AuthPayload;
  } catch (error) {
    return null;
  }
}

// Salvar token em cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// Obter token do cookie
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

// Obter usuário autenticado do cookie
export async function getAuthUser(): Promise<AuthPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  
  return verifyToken(token);
}

// Remover cookie de autenticação
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Verificar se é admin
export async function requireAdmin(): Promise<AuthPayload> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Não autenticado');
  }
  
  if (user.role !== 'admin') {
    throw new Error('Acesso negado: apenas administradores');
  }
  
  return user;
}

// Verificar autenticação (admin ou vigia)
export async function requireAuth(): Promise<AuthPayload> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Não autenticado');
  }
  
  return user;
}

