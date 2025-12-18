import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Criar tabela users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vigia')),
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela vehicle_records
    await sql`
      CREATE TABLE IF NOT EXISTS vehicle_records (
        id SERIAL PRIMARY KEY,
        placa VARCHAR(20) NOT NULL,
        condutor VARCHAR(255),
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
        timestamp TIMESTAMP NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        user_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar índices
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_records_timestamp ON vehicle_records(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_records_user_id ON vehicle_records(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_records_placa ON vehicle_records(placa)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    // Criar admin
    const passwordHash = await bcrypt.hash("Quetzal25", 10);
    const result = await sql`
      INSERT INTO users (email, password_hash, nome, role, ativo)
      VALUES (
        'casa@quetzal.com.br',
        ${passwordHash},
        'Administrador',
        'admin',
        TRUE
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = ${passwordHash},
        ativo = TRUE
      RETURNING email, nome, role
    `;

    return NextResponse.json({
      success: true,
      message: "Banco inicializado com sucesso!",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao inicializar banco:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
