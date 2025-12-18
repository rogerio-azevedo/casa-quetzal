-- Script de inicialização do banco de dados Casa Quetzal

-- Tabela de usuários (vigias e admin)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vigia')),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de registros de veículos
CREATE TABLE IF NOT EXISTS vehicle_records (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(20) NOT NULL,
  condutor VARCHAR(255),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  timestamp TIMESTAMP NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  user_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicle_records_timestamp ON vehicle_records(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_records_user_id ON vehicle_records(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_records_placa ON vehicle_records(placa);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Inserir usuário admin padrão
-- Senha: Quetzal25 (hash gerado com bcrypt)
INSERT INTO users (email, password_hash, nome, role, ativo)
VALUES (
  'casa@quetzal.com.br',
  '$2a$10$YourHashWillBeGeneratedHere',
  'Administrador',
  'admin',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Nota: O hash da senha será atualizado pelo script de setup

