'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import UserManagement from '../components/admin/UserManagement';
import RecordManagement from '../components/admin/RecordManagement';

type Tab = 'users' | 'records';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('records');

  // Verificar se é admin
  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-gray-600">
                Casa Quetzal - Controle de Veículos
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Administrador:</p>
              <p className="font-semibold text-gray-900">{user.nome}</p>
              <button
                onClick={logout}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'records'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Gestão de Registros
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Gestão de Vigias
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'records' && <RecordManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}

