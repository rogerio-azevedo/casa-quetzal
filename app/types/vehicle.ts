export type VehicleActionType = "entrada" | "saida";

export interface VehicleRecord {
  id: string;
  placa: string;
  condutor?: string;
  tipo: VehicleActionType;
  timestamp: string;
  userId?: number;
  userName?: string;
}
