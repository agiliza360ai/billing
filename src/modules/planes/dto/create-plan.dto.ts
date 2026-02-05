import { IsString, IsNumber, IsArray, IsObject, IsEnum, IsOptional, ValidateNested, IsBoolean, IsEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { PlanDuration, type PlanStatus } from "src/types/enums";
import type { Features } from "../entities/plan.entity";

class FeaturesDto {
  @IsBoolean()
  ai_agent: boolean;

  @IsBoolean()
  priority_support: boolean;

  @IsBoolean()
  @IsOptional()
  carta_digital: boolean;

  @IsBoolean()
  @IsOptional()
  cash_closing: boolean;

  @IsBoolean()
  chats_module: boolean;

  @IsBoolean()
  @IsOptional()
  mass_messaging: boolean;

  @IsBoolean()
  @IsOptional()
  yango_integration: boolean;

  @IsBoolean()
  @IsOptional()
  reservations: boolean;

  @IsBoolean()
  @IsOptional()
  order_module: boolean;

  @IsBoolean()
  @IsOptional()
  dashboard_module: boolean;

  @IsBoolean()
  @IsOptional()
  customer_module: boolean;

  @IsBoolean()
  @IsOptional()
  complaints_module: boolean;

  @IsBoolean()
  @IsOptional()
  kds_module: boolean;

  @IsBoolean()
  @IsOptional()
  multilocals_module: boolean;

  @IsBoolean()
  @IsOptional()
  unlimited_orders: boolean;

  @IsBoolean()
  @IsOptional()
  integrations: boolean;

  @IsBoolean()
  @IsOptional()
  premium_website: boolean;
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  currency_type: string;

  @IsEnum(PlanDuration)
  duration: PlanDuration;

  @IsNumber()
  @IsOptional()
  order_limit: number | null;

  @IsObject()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features: Features;

  @IsEnum(['active', 'inactive'])
  status: PlanStatus;
}