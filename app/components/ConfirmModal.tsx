'use client';

import { VehicleActionType } from '../types/vehicle';

interface ConfirmModalProps {
  placa: string;
  condutor: string;
  tipo: VehicleActionType;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ placa, condutor, tipo, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Confirmar Registro
        </h2>
        
        <div className="space-y-3 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Tipo de Registro</p>
            <p className={`text-lg font-semibold ${tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
              {tipo.toUpperCase()}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Placa</p>
            <p className="text-lg font-semibold text-gray-900">{placa}</p>
          </div>
          
          {condutor && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Condutor</p>
              <p className="text-lg font-semibold text-gray-900">{condutor}</p>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-6">
          Tem certeza que deseja fazer este registro?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`py-3 text-white font-semibold rounded-lg transition-colors ${
              tipo === 'entrada' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

