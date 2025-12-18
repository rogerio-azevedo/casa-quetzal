import { sql } from '@vercel/postgres';

export { sql };

// Tipos do banco de dados
export interface User {
  id: number;
  email: string;
  password_hash: string;
  nome: string;
  role: 'admin' | 'vigia';
  ativo: boolean;
  created_at: Date;
}

export interface VehicleRecordDB {
  id: number;
  placa: string;
  condutor: string | null;
  tipo: 'entrada' | 'saida';
  timestamp: Date;
  user_id: number;
  user_name: string;
  created_at: Date;
}

