'use client';

import { useState, useEffect } from 'react';
import VehicleForm from './components/VehicleForm';
import ConfirmModal from './components/ConfirmModal';
import VehicleList from './components/VehicleList';
import StatsSummary from './components/StatsSummary';
import { VehicleRecord, VehicleActionType } from './types/vehicle';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [pendingRecord, setPendingRecord] = useState<{
    placa: string;
    condutor: string;
    tipo: VehicleActionType;
  } | null>(null);

  // Carregar registros da API
  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  const loadRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();

      if (data.success && data.records) {
        // Converter registros do banco para o formato usado no frontend
        const formattedRecords: VehicleRecord[] = data.records.map((r: any) => ({
          id: r.id.toString(),
          placa: r.placa,
          condutor: r.condutor || undefined,
          tipo: r.tipo,
          timestamp: r.timestamp,
          userId: r.user_id,
          userName: r.user_name,
        }));
        setRecords(formattedRecords);
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleFormSubmit = (placa: string, condutor: string, tipo: VehicleActionType) => {
    setPendingRecord({ placa, condutor, tipo });
  };

  const handleConfirm = async () => {
    if (!pendingRecord) return;

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placa: pendingRecord.placa,
          condutor: pendingRecord.condutor,
          tipo: pendingRecord.tipo,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Recarregar registros
        await loadRecords();
        setPendingRecord(null);
        // Limpar formulário disparando um evento customizado
        window.dispatchEvent(new CustomEvent('clearVehicleForm'));
      } else {
        alert('Erro ao criar registro: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      alert('Erro ao criar registro');
    }
  };

  const handleCancel = () => {
    setPendingRecord(null);
  };

  if (loading || loadingRecords) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Casa Quetzal
              </h1>
              <p className="text-gray-600">
                Sistema de Controle de Veículos
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Logado como:</p>
              <p className="font-semibold text-gray-900">{user?.nome}</p>
              <button
                onClick={logout}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <StatsSummary records={records} />

        {/* Vehicle Form */}
        <VehicleForm onSubmit={handleFormSubmit} />

        {/* Vehicle List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Histórico de Registros
          </h2>
          <VehicleList records={records} />
        </div>

        {/* Confirm Modal */}
        {pendingRecord && (
          <ConfirmModal
            placa={pendingRecord.placa}
            condutor={pendingRecord.condutor}
            tipo={pendingRecord.tipo}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
