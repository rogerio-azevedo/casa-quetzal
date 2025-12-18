import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/app/lib/auth';
import type { VehicleRecordDB } from '@/app/lib/db';

// GET /api/records - Listar todos os registros
export async function GET() {
  try {
    await requireAuth();

    const result = await sql<VehicleRecordDB>`
      SELECT 
        id,
        placa,
        condutor,
        tipo,
        timestamp,
        user_id,
        user_name,
        created_at
      FROM vehicle_records
      ORDER BY timestamp DESC
      LIMIT 1000
    `;

    return NextResponse.json({
      success: true,
      records: result.rows,
    });
  } catch (error: any) {
    console.error('Erro ao listar registros:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao listar registros' },
      { status: error.message === 'Não autenticado' ? 401 : 500 }
    );
  }
}

// POST /api/records - Criar novo registro
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { placa, condutor, tipo, timestamp } = body;

    // Validações
    if (!placa || !tipo) {
      return NextResponse.json(
        { success: false, message: 'Placa e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
      return NextResponse.json(
        { success: false, message: 'Tipo inválido' },
        { status: 400 }
      );
    }

    // Inserir registro
    const result = await sql<VehicleRecordDB>`
      INSERT INTO vehicle_records (
        placa,
        condutor,
        tipo,
        timestamp,
        user_id,
        user_name
      )
      VALUES (
        ${placa.toUpperCase()},
        ${condutor || null},
        ${tipo},
        ${timestamp || new Date().toISOString()},
        ${user.userId},
        ${user.nome}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      record: result.rows[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar registro:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao criar registro' },
      { status: error.message === 'Não autenticado' ? 401 : 500 }
    );
  }
}

