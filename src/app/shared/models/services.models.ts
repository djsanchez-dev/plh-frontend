export interface OwnerSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Propiedad (número de lote) del propietario. */
  property?: string | null;
}

/** Las mediciones son diarias: el sistema solo usa 'DAY' (WEEK/MONTH son datos legados). */
export type ConsumptionPeriod = 'DAY' | 'WEEK' | 'MONTH';

export interface ConsumptionRecord {
  id: string;
  periodStart: string;
  period: ConsumptionPeriod;
  waterLiters: number;
  electricityKwh: number;
  /** Lecturas acumuladas del medidor (null en registros antiguos). */
  waterReading?: number | null;
  electricityReading?: number | null;
}
