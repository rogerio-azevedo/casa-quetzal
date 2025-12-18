import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/app/lib/auth';
import type { VehicleRecordDB } from '@/app/lib/db';

// PUT /api/records/[id] - Atualizar registro (apenas admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { placa, condutor, tipo, timestamp } = body;

    // Validações
    if (!placa || !tipo || !timestamp) {
      return NextResponse.json(
        { success: false, message: 'Placa, tipo e timestamp são obrigatórios' },
        { status: 400 }
      );
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
      return NextResponse.json(
        { success: false, message: 'Tipo inválido' },
        { status: 400 }
      );
    }

    // Verificar se registro existe
    const existing = await sql<VehicleRecordDB>`
      SELECT id FROM vehicle_records WHERE id = ${id}
    `;

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Registro não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar registro
    const result = await sql<VehicleRecordDB>`
      UPDATE vehicle_records
      SET placa = ${placa.toUpperCase()},
          condutor = ${condutor || null},
          tipo = ${tipo},
          timestamp = ${timestamp}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      record: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erro ao atualizar registro:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao atualizar registro' },
      { status: error.message === 'Não autenticado' ? 401 : error.message.includes('apenas administradores') ? 403 : 500 }
    );
  }
}

// DELETE /api/records/[id] - Deletar registro (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Verificar se registro existe
    const existing = await sql<VehicleRecordDB>`
      SELECT id FROM vehicle_records WHERE id = ${id}
    `;

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Registro não encontrado' },
        { status: 404 }
      );
    }

    // Deletar registro
    await sql`
      DELETE FROM vehicle_records
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Registro deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar registro:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao deletar registro' },
      { status: error.message === 'Não autenticado' ? 401 : error.message.includes('apenas administradores') ? 403 : 500 }
    );
  }
}

