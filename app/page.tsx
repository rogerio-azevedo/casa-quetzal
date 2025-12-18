"use client";

import { useState, useEffect } from "react";
import VehicleForm from "./components/VehicleForm";
import ConfirmModal from "./components/ConfirmModal";
import VehicleList from "./components/VehicleList";
import StatsSummary from "./components/StatsSummary";
import { VehicleRecord, VehicleActionType } from "./types/vehicle";
import { useAuth } from "./hooks/useAuth";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
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
      const response = await fetch("/api/records");
      const data = await response.json();

      if (data.success && data.records) {
        // Converter registros do banco para o formato usado no frontend
        const formattedRecords: VehicleRecord[] = data.records.map(
          (r: {
            id: number;
            placa: string;
            condutor: string | null;
            tipo: string;
            timestamp: string;
            user_id: number;
            user_name: string;
          }) => ({
            id: r.id.toString(),
            placa: r.placa,
            condutor: r.condutor || undefined,
            tipo: r.tipo,
            timestamp: r.timestamp,
            userId: r.user_id,
            userName: r.user_name,
          })
        );
        setRecords(formattedRecords);
      }
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleFormSubmit = (
    placa: string,
    condutor: string,
    tipo: VehicleActionType
  ) => {
    setPendingRecord({ placa, condutor, tipo });
  };

  const handleConfirm = async () => {
    if (!pendingRecord) return;

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        window.dispatchEvent(new CustomEvent("clearVehicleForm"));
      } else {
        alert("Erro ao criar registro: " + data.message);
      }
    } catch (error) {
      console.error("Erro ao criar registro:", error);
      alert("Erro ao criar registro");
    }
  };

  const handleCancel = () => {
    setPendingRecord(null);
  };

  const handleQuickExit = (placa: string, condutor: string) => {
    setPendingRecord({ placa, condutor, tipo: "saida" });
    // Limpar filtro após selecionar
    setSearchFilter("");
  };

  // Filtrar registros por placa
  const filteredRecords = records.filter((record) => {
    if (!searchFilter.trim()) return true;
    return record.placa.toLowerCase().includes(searchFilter.toLowerCase());
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-3 md:py-8 md:px-4">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                Casa Quetzal
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Sistema de Controle de Veículos
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs md:text-sm text-gray-600">Logado como:</p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {user?.nome}
              </p>
              <button
                onClick={logout}
                className="mt-1 text-xs md:text-sm text-red-600 hover:text-red-700 underline"
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
        <div className="mt-4 md:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Histórico de Registros
            </h2>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value.toUpperCase())}
                placeholder="Buscar por placa (ex: A33)"
                className="w-full sm:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-500 uppercase"
              />
            </div>
          </div>
          <VehicleList
            records={filteredRecords}
            onQuickExit={handleQuickExit}
          />
          {searchFilter && filteredRecords.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Nenhum registro encontrado para &ldquo;{searchFilter}&rdquo;
            </div>
          )}
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
