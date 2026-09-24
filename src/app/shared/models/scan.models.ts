/** Código QR de propiedad: UUID opaco codificado en la etiqueta física. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidQrCode(code: string): boolean {
  return UUID_RE.test(code);
}

/** Ficha que se ve al escanear el QR de una propiedad. */
export interface ScanInfo {
  propertyId: string;
  lot: string;
  ownerName: string;
  ownerPhone: string | null;
  /** Última lectura de medidor anterior a hoy (null si es la primera). */
  previousDate: string | null;
  previousWaterReading: number | null;
  previousElectricityReading: number | null;
  /** true si hoy ya existe una medición para esta propiedad (modo edición). */
  todayExists: boolean;
  waterReading: number | null;
  electricityReading: number | null;
  waterLiters: number | null;
  electricityKwh: number | null;
}

/** Lecturas de los medidores; el consumo del día lo calcula el backend. */
export interface ScanSaveRequest {
  waterReading: number;
  electricityReading: number;
}

export interface ScanTodayItem {
  qrCode: string;
  lot: string;
  ownerName: string;
  measured: boolean;
}

/** Avance del recorrido del día. */
export interface ScanTodaySummary {
  total: number;
  measured: number;
  items: ScanTodayItem[];
}
