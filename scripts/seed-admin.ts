/**
 * Script para criar o usuário admin inicial
 * Execute com: tsx scripts/seed-admin.ts
 */

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    console.log('🌱 Iniciando seed do usuário admin...');

    // Gerar hash da senha
    const passwordHash = await bcrypt.hash('Quetzal25', 10);

    // Criar tabela users se não existir
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

    // Criar tabela vehicle_records se não existir
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

    console.log('✅ Tabelas criadas com sucesso!');

    // Inserir ou atualizar usuário admin
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
      RETURNING id, email, nome, role
    `;

    console.log('✅ Usuário admin criado/atualizado:');
    console.log('   Email:', result.rows[0].email);
    console.log('   Nome:', result.rows[0].nome);
    console.log('   Role:', result.rows[0].role);
    console.log('   Senha: Quetzal25');
    console.log('\n🎉 Seed concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedAdmin();

