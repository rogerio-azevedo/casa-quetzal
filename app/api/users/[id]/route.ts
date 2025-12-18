import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin, hashPassword } from '@/app/lib/auth';
import type { User } from '@/app/lib/db';

// PUT /api/users/[id] - Atualizar usuário (apenas admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { email, password, nome, role, ativo } = body;

    // Validações
    if (!email || !nome || !role || typeof ativo !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios: email, nome, role, ativo' },
        { status: 400 }
      );
    }

    if (role !== 'vigia' && role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Role inválido' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existing = await sql<User>`
      SELECT id FROM users WHERE id = ${id}
    `;

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se email já está em uso por outro usuário
    const emailCheck = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${id}
    `;

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Atualizar usuário
    let result;
    if (password) {
      // Se senha foi fornecida, atualizar também
      const passwordHash = await hashPassword(password);
      result = await sql<User>`
        UPDATE users
        SET email = ${email},
            password_hash = ${passwordHash},
            nome = ${nome},
            role = ${role},
            ativo = ${ativo}
        WHERE id = ${id}
        RETURNING id, email, nome, role, ativo, created_at
      `;
    } else {
      // Atualizar sem mudar a senha
      result = await sql<User>`
        UPDATE users
        SET email = ${email},
            nome = ${nome},
            role = ${role},
            ativo = ${ativo}
        WHERE id = ${id}
        RETURNING id, email, nome, role, ativo, created_at
      `;
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao atualizar usuário' },
      { status: error.message === 'Não autenticado' ? 401 : error.message.includes('apenas administradores') ? 403 : 500 }
    );
  }
}

// DELETE /api/users/[id] - Desativar usuário (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Verificar se usuário existe
    const existing = await sql<User>`
      SELECT id FROM users WHERE id = ${id}
    `;

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Desativar usuário (soft delete)
    await sql`
      UPDATE users
      SET ativo = FALSE
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Usuário desativado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao desativar usuário:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao desativar usuário' },
      { status: error.message === 'Não autenticado' ? 401 : error.message.includes('apenas administradores') ? 403 : 500 }
    );
  }
}

