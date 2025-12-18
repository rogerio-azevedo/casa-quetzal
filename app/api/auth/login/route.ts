import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyPassword, createToken, setAuthCookie } from '@/app/lib/auth';
import type { User } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    const result = await sql<User>`
      SELECT * FROM users 
      WHERE email = ${email} AND ativo = TRUE
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verificar senha
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Criar token JWT
    const token = await createToken({
      userId: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
    });

    // Salvar token em cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}

