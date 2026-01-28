import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested } from "class-validator";
import { Descuento } from "../entities/offer.entity";
import { AtLeastOneDiscountValue, OnlyOneDiscountType } from "src/core/decorators/discount.decorator";
import { OnlyDiscountOrExtraDuration } from "src/core/decorators/offer.decorator";
import { Type } from "class-transformer";
import { OfferExtraDurationType, OfferStatus } from "src/types/enums";

export class CreateDescuentoDto implements Descuento {
  @IsOptional()
  @ValidateIf((o: CreateDescuentoDto) => o.fixed_amount === undefined || o.fixed_amount === null)
  @IsNumber({}, { message: "El porcentaje debe ser un número" })
  @Min(0, { message: "El porcentaje no puede ser menor a 0" })
  @Max(100, { message: "El porcentaje no puede ser mayor a 100" })
  percentage?: number;

  @IsOptional()
  @ValidateIf((o: CreateDescuentoDto) => o.percentage === undefined || o.percentage === null)
  @IsNumber({}, { message: "El monto fijo debe ser un número" })
  @Min(0, { message: "El monto fijo no puede ser menor a 0" })
  fixed_amount?: number;

  // Validación cruzada del objeto descuento (siempre debe correr si el objeto existe)
  @OnlyOneDiscountType({
    message: 'Solo se puede especificar un tipo de descuento: porcentaje o monto fijo, no ambos'
  })
  @AtLeastOneDiscountValue({
    message: 'Debe especificar un descuento: porcentaje o monto fijo'
  })
  private readonly _discountValidation!: string;
}

export class ExtraDurationPlanDto {
  @IsNumber({}, { message: "La duracion extra debe ser un numero" })
  @Min(1, { message: "La duracion extra no puede ser menor a 1" })
  extra_duration: number;

  @IsEnum(OfferExtraDurationType, {
    message: "El tipo de duracion extra debe ser: 'days', 'weeks', 'months' o 'years'"
  })
  @IsNotEmpty({ message: "El tipo de duracion extra es requerido" })
  duration_type: OfferExtraDurationType;
}

export class OfferBaseDto {
  @IsString({ message: "El nombre de la oferta debe ser una cadena de texto" })
  @IsNotEmpty({ message: "El nombre de la oferta es requerido" })
  offer_name: string;
  
  @IsOptional()
  @IsString({ message: "La descripcion debe ser una cadena de texto" })
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDescuentoDto)
  discount?: CreateDescuentoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExtraDurationPlanDto)
  extra_duration_plan?: ExtraDurationPlanDto;

  @IsEnum(OfferStatus, {
    message: "status debe ser: 'active' o 'inactive'"
  })
  @IsNotEmpty({ message: "status es requerido" })
  @IsString({ message: "status debe ser una cadena de texto" })
  status: OfferStatus;
}

export class CreateOfferDto extends OfferBaseDto {
  // En CREATE: exigir exactamente uno (discount XOR extra_duration_plan)
  @OnlyDiscountOrExtraDuration({ allowNeither: false })
  private readonly _offerChoiceValidation!: string;
}
