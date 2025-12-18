'use client';

import { VehicleRecord } from '../types/vehicle';

interface StatsSummaryProps {
  records: VehicleRecord[];
}

export default function StatsSummary({ records }: StatsSummaryProps) {
  const totalEntradas = records.filter((r) => r.tipo === 'entrada').length;
  const totalSaidas = records.filter((r) => r.tipo === 'saida').length;
  const totalRegistros = records.length;

  return (
    <div className="w-full grid grid-cols-3 gap-2 md:gap-4">
      <div className="bg-white rounded-lg shadow-md p-2 md:p-4 text-center">
        <p className="text-xs md:text-sm text-gray-600 mb-1">Total Registros</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalRegistros}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-2 md:p-4 text-center">
        <p className="text-xs md:text-sm text-gray-600 mb-1">Entradas</p>
        <p className="text-2xl md:text-3xl font-bold text-green-600">{totalEntradas}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-2 md:p-4 text-center">
        <p className="text-xs md:text-sm text-gray-600 mb-1">Saídas</p>
        <p className="text-2xl md:text-3xl font-bold text-red-600">{totalSaidas}</p>
      </div>
    </div>
  );
}

