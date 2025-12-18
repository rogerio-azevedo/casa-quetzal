'use client';

import { VehicleRecord } from '../types/vehicle';

interface VehicleListProps {
  records: VehicleRecord[];
}

export default function VehicleList({ records }: VehicleListProps) {
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

  // Ordenar por timestamp mais recente primeiro
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (records.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        Nenhum registro ainda
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condutor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrado por
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">{record.placa}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-gray-600">{record.condutor || '-'}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      record.tipo === 'entrada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {record.tipo === 'entrada' ? '→' : '←'}
                    {record.tipo.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimestamp(record.timestamp)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {record.userName || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

