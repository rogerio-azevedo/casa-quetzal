import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin, hashPassword } from '@/app/lib/auth';
import type { User } from '@/app/lib/db';

// GET /api/users - Listar todos os usuários (apenas admin)
export async function GET() {
  try {
    await requireAdmin();

    const result = await sql<User>`
      SELECT id, email, nome, role, ativo, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      users: result.rows,
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao listar usuários' },
      { status: error.message === 'Não autenticado' ? 401 : error.message.includes('apenas administradores') ? 403 : 500 }
    );
  }
}

// POST /api/users - Criar novo usuário (apenas admin)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { email, password, nome, role } = body;

    // Validações
    if (!email || !password || !nome || !role) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (role !== 'vigia' && role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Role inválido' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Inserir usuário
    const result = await sql<User>`
      INSERT INTO users (email, password_hash, nome, role, ativo)
      VALUES (${email}, ${passwordHash}, ${nome}, ${role}, TRUE)
      RETURNING id, email, nome, role, ativo, created_at
    `;

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao criar usuário' },
      { status: error.message === 'Não autenticado' ? 401 : error.message.includes('apenas administradores') ? 403 : 500 }
    );
  }
}

