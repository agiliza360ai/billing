export type PlanStatus = "active" | "inactive";

export enum PlanDuration {
  MONTHLY = "monthly",
  ANNUAL = "annual",
  QUARTER = "quarter",
  SEMESTER = "semester",
  BIWEEKLY = "biweekly" // Plan quincenal
}

export enum SuscriptionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EXPIRED = "expired",
  CANCELED = "canceled",
}

export enum OfferStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum OfferExtraDurationType {
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
}
