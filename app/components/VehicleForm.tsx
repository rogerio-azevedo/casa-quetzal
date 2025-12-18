'use client';

import { useState, useEffect } from 'react';
import { VehicleActionType } from '../types/vehicle';

interface VehicleFormProps {
  onSubmit: (placa: string, condutor: string, tipo: VehicleActionType) => void;
}

export default function VehicleForm({ onSubmit }: VehicleFormProps) {
  const [placa, setPlaca] = useState('');
  const [condutor, setCondutor] = useState('');

  // Ouvir evento para limpar o formulário
  useEffect(() => {
    const handleClear = () => {
      setPlaca('');
      setCondutor('');
    };

    window.addEventListener('clearVehicleForm', handleClear);
    return () => window.removeEventListener('clearVehicleForm', handleClear);
  }, []);

  const handleSubmit = (tipo: VehicleActionType) => {
    if (!placa.trim()) {
      alert('Por favor, informe a placa do veículo');
      return;
    }
    onSubmit(placa.toUpperCase(), condutor, tipo);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="placa" className="block text-sm font-medium text-gray-700 mb-2">
            Placa do Veículo *
          </label>
          <input
            id="placa"
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="ABC1D23"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder:text-gray-500"
            maxLength={8}
          />
        </div>

        <div>
          <label htmlFor="condutor" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Condutor (Opcional)
          </label>
          <input
            id="condutor"
            type="text"
            value={condutor}
            onChange={(e) => setCondutor(e.target.value)}
            placeholder="Nome do motorista"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => handleSubmit('entrada')}
            className="py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md active:scale-95 transform"
          >
            REGISTRAR ENTRADA
          </button>
          <button
            onClick={() => handleSubmit('saida')}
            className="py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md active:scale-95 transform"
          >
            REGISTRAR SAÍDA
          </button>
        </div>
      </div>
    </div>
  );
}

