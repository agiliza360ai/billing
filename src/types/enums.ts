export type PlanStatus = "active" | "inactive";

export enum PlanDuration {
  MONTHLY = "monthly",
  ANNUAL = "annual",
  QUARTER = "quarter",
  SEMESTER = "semester",
  BIWEEKLY = "biweekly" // Plan quincenal
}

export interface Descuento {
  percentage?: number; // Porcentaje de descuento (0-100)
  fixed_amount?: number; // Monto fijo de descuento
  description?: string; // Descripción opcional del descuento
}