'use client';

import { useState, useEffect } from 'react';
import type { VehicleRecord, VehicleActionType } from '@/app/types/vehicle';

export default function RecordManagement() {
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleRecord | null>(null);
  const [formData, setFormData] = useState({
    placa: '',
    condutor: '',
    tipo: 'entrada' as VehicleActionType,
    timestamp: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();

      if (data.success && data.records) {
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
      setLoading(false);
    }
  };

  const handleOpenModal = (record: VehicleRecord) => {
    setEditingRecord(record);
    // Converter timestamp para formato datetime-local
    const date = new Date(record.timestamp);
    const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    setFormData({
      placa: record.placa,
      condutor: record.condutor || '',
      tipo: record.tipo,
      timestamp: localDateTime,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      placa: '',
      condutor: '',
      tipo: 'entrada',
      timestamp: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRecord) return;

    try {
      // Converter datetime-local para ISO string
      const isoTimestamp = new Date(formData.timestamp).toISOString();

      const response = await fetch(`/api/records/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timestamp: isoTimestamp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadRecords();
        handleCloseModal();
      } else {
        alert(data.message || 'Erro ao atualizar registro');
      }
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      alert('Erro ao atualizar registro');
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Tem certeza que deseja deletar este registro? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadRecords();
      } else {
        alert(data.message || 'Erro ao deletar registro');
      }
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      alert('Erro ao deletar registro');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Registros de Veículos</h2>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{records.length}</span> registros
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-blue-600">{records.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Entradas</p>
          <p className="text-2xl font-bold text-green-600">
            {records.filter((r) => r.tipo === 'entrada').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Saídas</p>
          <p className="text-2xl font-bold text-red-600">
            {records.filter((r) => r.tipo === 'saida').length}
          </p>
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data/Hora</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Placa</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Condutor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Registrado por</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatTimestamp(record.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {record.placa}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.condutor || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        record.tipo === 'entrada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.tipo === 'entrada' ? '→' : '←'}
                      {record.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.userName || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleOpenModal(record)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      {showModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Editar Registro
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condutor (opcional)
                </label>
                <input
                  type="text"
                  value={formData.condutor}
                  onChange={(e) => setFormData({ ...formData, condutor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as VehicleActionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Registrado por:</strong> {editingRecord.userName}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

