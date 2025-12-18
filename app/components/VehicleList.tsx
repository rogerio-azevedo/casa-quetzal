"use client";

import { VehicleRecord } from "../types/vehicle";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

interface VehicleListProps {
  records: VehicleRecord[];
  onQuickExit?: (placa: string, condutor: string) => void;
}

export default function VehicleList({
  records,
  onQuickExit,
}: VehicleListProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const zonedDate = toZonedTime(date, "America/Sao_Paulo");
    return format(zonedDate, "dd/MM/yyyy, HH:mm", { locale: ptBR });
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
      <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Placa
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                Condutor
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                Data/Hora
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                Registrado por
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-900 text-sm md:text-sm">
                    {record.placa}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-4 hidden md:table-cell">
                  <span className="text-gray-600 text-xs md:text-sm">
                    {record.condutor || "-"}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      record.tipo === "entrada"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {record.tipo === "entrada" ? "→" : "←"}
                    <span className="hidden sm:inline">
                      {record.tipo.toUpperCase()}
                    </span>
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-4 whitespace-nowrap text-xs text-gray-500 hidden sm:table-cell">
                  {formatTimestamp(record.timestamp)}
                </td>
                <td className="px-2 md:px-4 py-2 md:py-4 text-xs text-gray-600 hidden lg:table-cell">
                  {record.userName || "-"}
                </td>
                <td className="px-2 md:px-4 py-2 md:py-4">
                  {record.tipo === "entrada" && onQuickExit && (
                    <button
                      onClick={() =>
                        onQuickExit(record.placa, record.condutor || "")
                      }
                      className="px-2 md:px-3 py-1.5 md:py-1 bg-red-600 text-white text-sm md:text-xs font-medium rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                      Saída
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
