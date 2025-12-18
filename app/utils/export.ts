import { VehicleRecord } from '../types/vehicle';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const zonedDate = toZonedTime(date, 'America/Sao_Paulo');
  return format(zonedDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export function exportToPDF(records: VehicleRecord[]) {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text('Casa Quetzal - Histórico de Registros', 14, 20);
  
  // Data de exportação
  const exportDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Exportado em: ${exportDate}`, 14, 28);
  
  // Tabela
  const tableData = records.map((record) => [
    record.placa,
    record.condutor || '-',
    record.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA',
    formatTimestamp(record.timestamp),
    record.userName || '-',
  ]);

  autoTable(doc, {
    head: [['Placa', 'Condutor', 'Tipo', 'Data/Hora', 'Registrado por']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: (data) => {
      // Estatísticas no final da última página
      if (data.pageNumber === data.pageCount && data.cursor) {
        const totalEntradas = records.filter((r) => r.tipo === 'entrada').length;
        const totalSaidas = records.filter((r) => r.tipo === 'saida').length;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const y = data.cursor.y + 10;
        doc.text(`Total de Registros: ${records.length}`, 14, y);
        doc.text(`Entradas: ${totalEntradas}`, 14, y + 6);
        doc.text(`Saídas: ${totalSaidas}`, 14, y + 12);
      }
    },
  });

  // Salvar
  const fileName = `casa-quetzal-registros-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

export function exportToExcel(records: VehicleRecord[]) {
  // Preparar dados
  const excelData = records.map((record) => ({
    Placa: record.placa,
    Condutor: record.condutor || '-',
    Tipo: record.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA',
    'Data/Hora': formatTimestamp(record.timestamp),
    'Registrado por': record.userName || '-',
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 10 }, // Placa
    { wch: 20 }, // Condutor
    { wch: 10 }, // Tipo
    { wch: 18 }, // Data/Hora
    { wch: 18 }, // Registrado por
  ];

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Registros');

  // Estatísticas em outra aba
  const statsData = [
    ['Total de Registros', records.length],
    ['Entradas', records.filter((r) => r.tipo === 'entrada').length],
    ['Saídas', records.filter((r) => r.tipo === 'saida').length],
  ];
  const wsStats = XLSX.utils.aoa_to_sheet([
    ['Estatísticas'],
    [],
    ...statsData,
  ]);
  wsStats['!cols'] = [{ wch: 20 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsStats, 'Estatísticas');

  // Salvar
  const fileName = `casa-quetzal-registros-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

